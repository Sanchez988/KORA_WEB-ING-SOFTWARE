import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../services/upload.service';
import { AppError } from '../middleware/errorHandler';

export const uploadController = {
  /**
   * Subir una sola imagen
   */
  async uploadSingle(req: Request, res: Response, next: NextFunction) {
    try {
      const { image } = req.body;

      if (!image) {
        throw new AppError('No se proporcionó ninguna imagen', 400);
      }

      const result = await uploadService.uploadImage(image);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Subir múltiples imágenes
   */
  async uploadMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const { images } = req.body;

      if (!images || !Array.isArray(images)) {
        throw new AppError('No se proporcionaron imágenes', 400);
      }

      if (images.length === 0) {
        throw new AppError('El array de imágenes está vacío', 400);
      }

      if (images.length > 6) {
        throw new AppError('Máximo 6 imágenes permitidas', 400);
      }

      const urls = await uploadService.uploadMultipleImages(images);

      res.json({
        success: true,
        data: { urls },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Subir múltiples archivos adjuntos
   */
  async uploadFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const { files } = req.body;

      if (!files || !Array.isArray(files)) {
        throw new AppError('No se proporcionaron archivos', 400);
      }

      if (files.length === 0) {
        throw new AppError('El array de archivos está vacío', 400);
      }

      if (files.length > 5) {
        throw new AppError('Máximo 5 archivos permitidos', 400);
      }

      const urls = await uploadService.uploadMultipleFiles(files, 'chat-attachments');

      res.json({
        success: true,
        data: { urls },
      });
    } catch (error) {
      next(error);
    }
  },
};
