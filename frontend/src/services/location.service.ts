import { api } from './api';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationResponse {
  location: LocationData & {
    updatedAt: string;
  } | null;
}

export const locationService = {
  /**
   * Obtener ubicación actual del navegador
   */
  getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Tu navegador no soporta geolocalización'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let errorMessage = 'Error al obtener ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado. Por favor habilítalo en la configuración del navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado al obtener ubicación';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  },

  /**
   * Actualizar ubicación en el servidor
   */
  async updateLocation(locationData: LocationData): Promise<void> {
    await api.post('/location', locationData);
  },

  /**
   * Obtener ubicación guardada del servidor
   */
  async getMyLocation(): Promise<LocationResponse> {
    const response = await api.get('/location');
    return response.data;
  },

  /**
   * Eliminar ubicación del servidor
   */
  async deleteLocation(): Promise<void> {
    await api.delete('/location');
  },

  /**
   * Activar localización: obtener y guardar ubicación
   */
  async enableLocation(): Promise<void> {
    const position = await this.getCurrentPosition();
    await this.updateLocation(position);
  },
};
