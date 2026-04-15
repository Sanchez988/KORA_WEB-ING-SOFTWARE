import { api } from './api';

type ProgressCallback = (progress: number) => void;

export const uploadService = {
  /**
   * Subir una sola imagen
   */
  async uploadSingle(base64Image: string): Promise<{ url: string; publicId: string }> {
    const response = await api.post('/upload/single', {
      image: base64Image,
    });
    return response.data.data;
  },

  /**
   * Subir múltiples imágenes
   */
  async uploadMultiple(base64Images: string[]): Promise<string[]> {
    const response = await api.post('/upload/multiple', {
      images: base64Images,
    });
    return response.data.data.urls;
  },

  /**
   * Subir múltiples archivos adjuntos
   */
  async uploadFiles(base64Files: string[], onProgress?: ProgressCallback): Promise<string[]> {
    const response = await api.post(
      '/upload/files',
      {
        files: base64Files,
      },
      {
        onUploadProgress: (event) => {
          if (!onProgress || !event.total) {
            return;
          }
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        },
      }
    );
    return response.data.data.urls;
  },
};
