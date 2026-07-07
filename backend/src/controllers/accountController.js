import * as Account from '../models/Account.js';
import { redisClient } from '../config/queue.js';

// Get all accounts with pagination and filters
export const getAccounts = (req, res) => {
    try {
        const { status, batchId, search, page = 1, limit = 50 } = req.query;

        const filters = {
            status,
            batchId: batchId ? parseInt(batchId) : undefined,
            search,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        };

        const accounts = Account.getAllAccounts(filters);
        const total = Account.countAccounts({ status, batchId, search });

        res.json({
            success: true,
            accounts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get accounts',
            error: error.message,
        });
    }
};

// Get account statistics
export const getStats = (req, res) => {
    try {
        const stats = Account.getAccountStats();

        res.json({
            success: true,
            stats: {
                total: stats.total || 0,
                success: stats.success || 0,
                failed: stats.failed || 0,
                pending: stats.pending || 0,
                successRate: stats.total > 0
                    ? ((stats.success / stats.total) * 100).toFixed(2)
                    : 0,
            },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics',
            error: error.message,
        });
    }
};

// Export accounts to CSV
export const exportToCSV = (req, res) => {
    try {
        const { status, batchId } = req.query;

        const filters = { status, batchId: batchId ? parseInt(batchId) : undefined };
        const accounts = Account.getAllAccounts(filters);

        // Create CSV headers
        const headers = [
            'ID',
            'Batch ID',
            'Email',
            'Password',
            'Username',
            'Date of Birth',
            'TikTok User ID',
            'Status',
            'Error Message',
            'Created At',
        ];

        // Create CSV rows
        const rows = accounts.map(acc => [
            acc.id,
            acc.batch_id,
            acc.email || '',
            acc.password || '',
            acc.username || '',
            acc.date_of_birth || '',
            acc.tiktok_user_id || '',
            acc.status,
            acc.error_message || '',
            acc.created_at,
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        // Set response headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="tiktok-accounts-${Date.now()}.csv"`);

        res.send(csvContent);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export CSV',
            error: error.message,
        });
    }
};

// Real-time progress updates using Server-Sent Events (SSE)
export const streamProgress = async (req, res) => {
    try {
        const { batchId } = req.params;

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send initial data
        const sendUpdate = () => {
            const accounts = Account.getAccountsByBatchId(parseInt(batchId));
            const success = accounts.filter(a => a.status === 'success').length;
            const failed = accounts.filter(a => a.status === 'failed').length;
            const pending = accounts.filter(a => a.status === 'pending').length;
            const total = accounts.length;

            const data = {
                batchId: parseInt(batchId),
                total,
                success,
                failed,
                pending,
                completed: success + failed,
                timestamp: new Date().toISOString(),
            };

            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        // Send initial update
        sendUpdate();

        // Subscribe to Redis pub/sub for real-time updates
        const subscriber = redisClient.duplicate();
        await subscriber.connect();

        subscriber.subscribe(`batch:${batchId}:update`, (message) => {
            sendUpdate();
        });

        // Update every 5 seconds as backup
        const interval = setInterval(sendUpdate, 5000);

        // Clean up on client disconnect
        req.on('close', async () => {
            clearInterval(interval);
            await subscriber.unsubscribe();
            await subscriber.quit();
            res.end();
        });
    } catch (error) {
        console.error('Stream progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to stream progress',
            error: error.message,
        });
    }
};

export default {
    getAccounts,
    getStats,
    exportToCSV,
    streamProgress,
};
