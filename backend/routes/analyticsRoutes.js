import express from 'express';
import { getStudentAnalytics, getClubHeadAnalytics, getAdminAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/student', protect, getStudentAnalytics);
router.get('/clubhead', protect, authorize('clubhead'), getClubHeadAnalytics);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

export default router;
