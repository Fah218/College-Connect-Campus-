import express from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Get all events
router.get('/', getEvents);

// Create a new event
router.post('/create', upload.fields([{ name: 'bannerImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 5 }]), createEvent);

// Update an event
router.put('/:id', upload.fields([{ name: 'bannerImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 5 }]), updateEvent);

// Delete an event
router.delete('/:id', deleteEvent);

export default router;
