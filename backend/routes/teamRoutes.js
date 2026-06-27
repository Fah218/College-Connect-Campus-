import express from 'express';
import { createTeamRequest, getTeamRequests, updateTeamRequest, deleteTeamRequest, createJoinRequest, getJoinRequests, updateJoinRequestStatus } from '../controllers/teamController.js';

const router = express.Router();

router.post('/request', createTeamRequest);
router.get('/request', getTeamRequests);
router.put('/request/:id', updateTeamRequest);
router.delete('/request/:id', deleteTeamRequest);
router.post('/join', createJoinRequest);
router.get('/join', getJoinRequests);
router.put('/join/:id/status', updateJoinRequestStatus);

export default router;
