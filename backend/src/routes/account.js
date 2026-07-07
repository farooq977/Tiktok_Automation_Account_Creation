import express from 'express';
import {
    getAccounts,
    getStats,
    exportToCSV,
    streamProgress,
} from '../controllers/accountController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All account routes require authentication
router.use(authMiddleware);

// Account routes
router.get('/', getAccounts);
router.get('/stats', getStats);
router.get('/export', exportToCSV);
router.get('/progress/:batchId', streamProgress);

export default router;
