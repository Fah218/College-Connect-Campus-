import express from 'express';
import { createTeamRequest, getTeamRequests, createJoinRequest } from '../controllers/teamController.js';

const router = express.Router();

router.post('/request', createTeamRequest);
router.get('/request', getTeamRequests);
router.post('/join', createJoinRequest);

export default router;
