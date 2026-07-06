
import express from 'express';
import { getStudentAnalytics, getClubHeadAnalytics, getAdminAnalytics, getAdminClubAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/student', getStudentAnalytics);
router.get('/clubhead', getClubHeadAnalytics);
router.get('/admin', getAdminAnalytics);
router.get('/admin/club/:id', getAdminClubAnalytics);

export default router;
