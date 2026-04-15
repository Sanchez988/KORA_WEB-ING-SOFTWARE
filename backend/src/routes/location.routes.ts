import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { updateLocation, getMyLocation, deleteLocation } from '../controllers/location.controller';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

const updateLocationValidation = [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('accuracy').optional().isFloat({ min: 0 }),
];

router.use(authenticate);

/**
 * @route   POST /api/location
 * @desc    Actualizar ubicación del usuario
 * @access  Private
 */
router.post('/', updateLocationValidation, validate, updateLocation);

/**
 * @route   GET /api/location
 * @desc    Obtener ubicación del usuario
 * @access  Private
 */
router.get('/', getMyLocation);

/**
 * @route   DELETE /api/location
 * @desc    Eliminar ubicación del usuario
 * @access  Private
 */
router.delete('/', deleteLocation);

export default router;
