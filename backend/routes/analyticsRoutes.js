
import express from 'express';
import { getStudentAnalytics, getClubHeadAnalytics, getAdminAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/student', getStudentAnalytics);
router.get('/clubhead', getClubHeadAnalytics);
router.get('/admin', getAdminAnalytics);

export default router;
