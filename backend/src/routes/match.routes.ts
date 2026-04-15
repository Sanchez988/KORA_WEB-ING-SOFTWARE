import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  likeProfile,
  dislikeProfile,
  getMyMatches,
  unmatch,
} from '../controllers/match.controller';

const router = Router();

router.use(authenticate);

router.post('/like', likeProfile);
router.post('/dislike', dislikeProfile);
router.get('/', getMyMatches);
router.delete('/:matchId', unmatch);

export default router;
