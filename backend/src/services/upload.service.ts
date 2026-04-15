import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

interface UploadResult {
  url: string;
  publicId: string;
}

export class UploadService {
  /**
   * Subir archivo generico a Cloudinary desde data URI
   */
  async uploadFile(dataUri: string, folder: string = 'attachments'): Promise<UploadResult> {
    try {
      if (!dataUri.startsWith('data:')) {
        throw new AppError('Formato de archivo inválido', 400);
      }

      const isImage = dataUri.startsWith('data:image');
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: `kora/${folder}`,
        resource_type: 'auto',
        ...(isImage
          ? {
              transformation: [
                { width: 1600, height: 1600, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
              ],
            }
          : {}),
      });

      logger.info(`Archivo subido exitosamente: ${result.public_id}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      logger.error('Error al subir archivo:', error);
      throw new AppError('Error al subir el archivo', 500);
    }
  }

  /**
   * Subir imagen a Cloudinary desde base64
   */
  async uploadImage(base64Data: string, folder: string = 'profiles'): Promise<UploadResult> {
    try {
      // Verificar que sea base64 válido
      if (!base64Data.startsWith('data:image')) {
        throw new AppError('Formato de imagen inválido', 400);
      }

      const result = await cloudinary.uploader.upload(base64Data, {
        folder: `kora/${folder}`,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      });

      logger.info(`Imagen subida exitosamente: ${result.public_id}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      logger.error('Error al subir imagen:', error);
      throw new AppError('Error al subir la imagen', 500);
    }
  }

  /**
   * Subir múltiples imágenes
   */
  async uploadMultipleImages(base64Array: string[], folder: string = 'profiles'): Promise<string[]> {
    try {
      const uploadPromises = base64Array.map((base64) => this.uploadImage(base64, folder));
      const results = await Promise.all(uploadPromises);
      return results.map((r) => r.url);
    } catch (error: any) {
      logger.error('Error al subir múltiples imágenes:', error);
      throw new AppError('Error al subir las imágenes', 500);
    }
  }

  /**
   * Subir múltiples archivos
   */
  async uploadMultipleFiles(dataUriArray: string[], folder: string = 'attachments'): Promise<string[]> {
    try {
      const uploadPromises = dataUriArray.map((dataUri) => this.uploadFile(dataUri, folder));
      const results = await Promise.all(uploadPromises);
      return results.map((result) => result.url);
    } catch (error: any) {
      logger.error('Error al subir múltiples archivos:', error);
      throw new AppError('Error al subir los archivos', 500);
    }
  }

  /**
   * Eliminar imagen de Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`Imagen eliminada: ${publicId}`);
    } catch (error: any) {
      logger.error('Error al eliminar imagen:', error);
      throw new AppError('Error al eliminar la imagen', 500);
    }
  }
}

export const uploadService = new UploadService();
