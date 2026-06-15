import express from 'express';
import {
  registerForEvent,
  getStudentRegistrations,
  getEventRegistrations,
  getAdminStats
} from '../controllers/registrationController.js';

const router = express.Router();

// Register for an event (Individual or Team)
router.post('/', registerForEvent);

// Get logged-in student's registrations
router.get('/student/:studentId', getStudentRegistrations);

// Get admin stats
router.get('/stats/admin', getAdminStats);

// Get registrations for a specific event
router.get('/event/:eventId', getEventRegistrations);

export default router;
