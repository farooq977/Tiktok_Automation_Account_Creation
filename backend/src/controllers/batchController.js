import { body, validationResult } from 'express-validator';
import * as Batch from '../models/Batch.js';
import * as Account from '../models/Account.js';
import { accountQueue } from '../config/queue.js';

// Create batch validation
export const createBatchValidation = [
    body('batchSize')
        .isInt({ min: 1, max: 500 })
        .withMessage('Batch size must be between 1 and 500'),
];

// Create new batch
export const createBatch = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { batchSize } = req.body;
        const userId = req.user.userId;

        // Create batch record
        const batchId = Batch.createBatch(userId, batchSize);

        // Create account records for this batch
        const accountIds = [];
        for (let i = 0; i < batchSize; i++) {
            const accountId = Account.createAccount(batchId);
            accountIds.push(accountId);
        }

        // Add jobs to queue
        for (const accountId of accountIds) {
            await accountQueue.add({
                accountId,
                batchId,
            }, {
                delay: accountIds.indexOf(accountId) * 5000, // Stagger job creation by 5 seconds
            });
        }

        // Update batch status to processing
        Batch.updateBatchStatus(batchId, 'processing');

        res.status(201).json({
            success: true,
            message: 'Batch created successfully',
            batch: {
                id: batchId,
                batchSize,
                status: 'processing',
                accountIds,
            },
        });
    } catch (error) {
        console.error('Create batch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create batch',
            error: error.message,
        });
    }
};

// Get all batches for current user
export const getBatches = (req, res) => {
    try {
        const userId = req.user.userId;
        const batches = Batch.getBatchesByUserId(userId);

        res.json({
            success: true,
            batches,
        });
    } catch (error) {
        console.error('Get batches error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get batches',
            error: error.message,
        });
    }
};

// Get single batch with accounts
export const getBatchById = (req, res) => {
    try {
        const { batchId } = req.params;
        const batch = Batch.getBatchWithAccounts(parseInt(batchId));

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Verify batch belongs to current user
        const userBatches = Batch.getBatchesByUserId(req.user.userId);
        const isBatchOwner = userBatches.some(b => b.id === batch.id);

        if (!isBatchOwner) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            batch,
        });
    } catch (error) {
        console.error('Get batch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get batch',
            error: error.message,
        });
    }
};

export default {
    createBatch,
    getBatches,
    getBatchById,
    createBatchValidation,
};
