import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createProfile,
  getMyProfile,
  updateProfile,
  getUserProfile,
  getDiscoveryProfiles,
} from '../controllers/profile.controller';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

const createProfileValidation = [
  body('name').notEmpty().isLength({ min: 2, max: 50 }),
  body('bio').notEmpty().isLength({ min: 50, max: 500 }),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  body('program').notEmpty(),
  body('photos').isArray({ min: 1, max: 6 }),
  body('interests').isArray({ min: 3 }),
  body('interests.*').isString().isLength({ min: 1, max: 150 }),
  body('hobbies').optional().isArray({ max: 8 }),
  body('hobbies.*').optional().isString().isLength({ min: 1, max: 150 }),
  body('relationshipGoal').isIn(['FRIENDSHIP', 'DATING', 'SERIOUS_RELATIONSHIP', 'JUST_MEETING_PEOPLE', 'STUDY_GROUPS']),
];

router.use(authenticate);

router.post('/', createProfileValidation, validate, createProfile);
router.get('/me', getMyProfile);
router.put('/me', updateProfile);
router.get('/discovery', getDiscoveryProfiles);
router.get('/:userId', getUserProfile);

export default router;
