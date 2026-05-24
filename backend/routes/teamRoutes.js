import express from 'express';
import { createTeamRequest, getTeamRequests, createJoinRequest, getJoinRequests, updateJoinRequestStatus } from '../controllers/teamController.js';

const router = express.Router();

router.post('/request', createTeamRequest);
router.get('/request', getTeamRequests);
router.post('/join', createJoinRequest);
router.get('/join', getJoinRequests);
router.put('/join/:id/status', updateJoinRequestStatus);

export default router;
