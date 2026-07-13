import express from 'express';
import { createTeamRequest, getTeamRequests, updateTeamRequest, deleteTeamRequest, createJoinRequest, getJoinRequests, updateJoinRequestStatus } from '../controllers/teamController.js';

const router = express.Router();

router.post('/request', (req,res,next)=>{
    console.log("===== /request ROUTE HIT =====");
    console.log("headers:", req.headers);
    console.log("content-type:", req.headers["content-type"]);
    console.log("body:", req.body);
    return createTeamRequest(req,res,next);
});
router.get('/request', getTeamRequests);
router.put('/request/:id', updateTeamRequest);
router.delete('/request/:id', deleteTeamRequest);
router.post('/join', (req,res,next)=>{
    console.log("===== /join ROUTE HIT =====");
    console.log("headers:", req.headers);
    console.log("content-type:", req.headers["content-type"]);
    console.log("body:", req.body);
    return createJoinRequest(req,res,next);
});
router.get('/join', getJoinRequests);
router.put('/join/:id/status', updateJoinRequestStatus);

export default router;
