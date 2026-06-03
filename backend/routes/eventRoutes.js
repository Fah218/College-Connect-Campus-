import express from 'express';
import { createEvent, getEvents, updateEvent } from '../controllers/eventController.js';

const router = express.Router();

// Get all events
router.get('/', getEvents);

// Create a new event
router.post('/create', createEvent);

// Update an event
router.put('/:id', updateEvent);

export default router;
