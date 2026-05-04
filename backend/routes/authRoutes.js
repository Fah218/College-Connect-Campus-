import express from 'express';
import { registerUser, loginUser, updateUser } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// PUT /api/auth/update/:id
router.put('/update/:id', updateUser);

export default router;
