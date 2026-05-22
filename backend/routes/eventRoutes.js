import express from 'express';
import { createEvent, getEvents } from '../controllers/eventController.js';

const router = express.Router();

// Get all events
router.get('/', getEvents);

// Create a new event
router.post('/create', createEvent);

export default router;
