import express from 'express';
import {
    register,
    login,
    getCurrentUser,
    registerValidation,
    loginValidation,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

export default router;
