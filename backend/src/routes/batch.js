import express from 'express';
import {
    createBatch,
    getBatches,
    getBatchById,
    createBatchValidation,
} from '../controllers/batchController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All batch routes require authentication
router.use(authMiddleware);

// Batch routes
router.post('/', createBatchValidation, createBatch);
router.get('/', getBatches);
router.get('/:batchId', getBatchById);

export default router;
