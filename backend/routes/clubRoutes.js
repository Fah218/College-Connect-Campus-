import express from 'express';
import { getClubs, toggleArchiveClub } from '../controllers/clubController.js';

const router = express.Router();

router.get('/', getClubs);
router.put('/:id/archive', toggleArchiveClub);

export default router;
