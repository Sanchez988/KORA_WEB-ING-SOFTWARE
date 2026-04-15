import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/upload/single
 * @desc    Subir una sola imagen
 * @access  Private
 */
router.post('/single', authenticate, uploadController.uploadSingle);

/**
 * @route   POST /api/upload/multiple
 * @desc    Subir múltiples imágenes
 * @access  Private
 */
router.post('/multiple', authenticate, uploadController.uploadMultiple);

/**
 * @route   POST /api/upload/files
 * @desc    Subir múltiples archivos adjuntos
 * @access  Private
 */
router.post('/files', authenticate, uploadController.uploadFiles);

export default router;
