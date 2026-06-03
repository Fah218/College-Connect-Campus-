import express from 'express';
import { registerUser, loginUser, updateUser, getClubHeads } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// PUT /api/auth/update/:id
router.put('/update/:id', updateUser);

// GET /api/auth/club-heads
router.get('/club-heads', getClubHeads);

export default router;
