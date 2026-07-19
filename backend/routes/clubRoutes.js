import express from 'express';
import { getClubs, toggleArchiveClub, reassignClubHead } from '../controllers/clubController.js';

const router = express.Router();

router.get('/', getClubs);
router.put('/:id/archive', toggleArchiveClub);
router.put('/:id/reassign', reassignClubHead);

export default router;
