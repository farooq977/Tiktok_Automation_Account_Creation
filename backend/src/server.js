import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './config/database.js';
import { connectRedis } from './config/queue.js';
import authRoutes from './routes/auth.js';
import batchRoutes from './routes/batch.js';
import accountRoutes from './routes/account.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'TikTok Automation API is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/accounts', accountRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const startServer = async () => {
    try {
        // Connect to Redis
        await connectRedis();
        console.log('✅ Redis connected');

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Backend server running on http://localhost:${PORT}`);
            console.log(`📊 Database: ${process.env.DATABASE_PATH || './database.sqlite'}`);
            console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

startServer();

export default app;
