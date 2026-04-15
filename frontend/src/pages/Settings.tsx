import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Bell, 
  MapPin, 
  Moon, 
  LogOut,
  Trash2,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { locationService } from '../services';

export default function Settings() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const [darkMode, setDarkMode] = useState(() => {
    // Cargar preferencia de modo oscuro desde localStorage
    const saved = localStorage.getItem('darkMode');
    const isDark = saved ? JSON.parse(saved) : false;
    // Aplicar al cargar
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    return isDark;
  });
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Cargar estado de ubicación al montar
  useEffect(() => {
    loadLocationStatus();
  }, []);

  const loadLocationStatus = async () => {
    try {
      const { location } = await locationService.getMyLocation();
      setLocationEnabled(location !== null);
    } catch (error) {
      console.error('Error al cargar estado de ubicación:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleToggleLocation = async (checked: boolean) => {
    if (checked) {
      // Activar ubicación
      try {
        toast.loading('Obteniendo ubicación...', { id: 'location' });
        await locationService.enableLocation();
        setLocationEnabled(true);
        toast.success('Ubicación activada correctamente', { id: 'location' });
      } catch (error: any) {
        toast.error(error.message || 'Error al activar ubicación', { id: 'location' });
        setLocationEnabled(false);
      }
    } else {
      // Desactivar ubicación
      if (confirm('¿Estás seguro de que quieres desactivar la ubicación?\n\nEsto puede afectar la calidad de tus matches.')) {
        try {
          await locationService.deleteLocation();
          setLocationEnabled(false);
          toast.success('Ubicación desactivada');
        } catch (error) {
          toast.error('Error al desactivar ubicación');
        }
      }
    }
  };

  const handleToggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    // Guardar en localStorage
    localStorage.setItem('darkMode', JSON.stringify(checked));
    // Aplicar o quitar clase 'dark' del elemento HTML
    if (checked) {
      document.documentElement.classList.add('dark');
      toast.success('Modo oscuro activado');
    } else {
      document.documentElement.classList.remove('dark');
      toast.success('Modo claro activado');
    }
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      clearAuth();
      toast.success('Sesión cerrada');
      navigate('/login');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
      // Implement delete account
      toast.success('Cuenta eliminada');
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="surface-glass rounded-card px-5 py-4 mb-8">
          <h1 className="text-3xl font-bold gradient-text">Configuración</h1>
        </div>

        <div className="space-y-4">
          {/* Account Section */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} />
              Cuenta
            </h2>
            <div className="space-y-3">
              <SettingItem
                label="Editar Perfil"
                onClick={() => navigate('/profile')}
              />
              <SettingItem
                label="Cambiar Contraseña"
                onClick={() => toast('Función próximamente')}
              />
            </div>
          </div>

          {/* Privacy Section */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield size={20} />
              Privacidad y Seguridad
            </h2>
            <div className="space-y-3">
              <SettingToggle
                label="Mostrar última conexión"
                checked={true}
                onChange={() => toast('Función próximamente')}
              />
              <SettingToggle
                label="Mostrar distancia"
                checked={true}
                onChange={() => toast('Función próximamente')}
              />
              <SettingToggle
                label="Modo Incógnito"
                checked={false}
                onChange={() => toast('Función próximamente')}
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Ubicación
            </h2>
            <div className="space-y-3">
              <SettingToggle
                label="Activar localización"
                checked={locationEnabled}
                onChange={handleToggleLocation}
                disabled={loadingLocation}
              />
              {locationEnabled && (
                <p className="text-xs text-success">
                  ✓ Ubicación activa - Mejora tus matches con usuarios cercanos
                </p>
              )}
              <SettingItem
                label="Solo mostrar en campus"
                onClick={() => toast('Función próximamente')}
              />
            </div>
          </div>

          {/* Notifications Section */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell size={20} />
              Notificaciones
            </h2>
            <div className="space-y-3">
              <SettingToggle
                label="Nuevos matches"
                checked={true}
                onChange={() => toast('Función próximamente')}
              />
              <SettingToggle
                label="Mensajes nuevos"
                checked={true}
                onChange={() => toast('Función próximamente')}
              />
              <SettingToggle
                label="Super Likes recibidos"
                checked={true}
                onChange={() => toast('Función próximamente')}
              />
            </div>
          </div>

          {/* Appearance Section */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Moon size={20} />
              Apariencia
            </h2>
            <SettingToggle
              label="Modo Oscuro"
              checked={darkMode}
              onChange={handleToggleDarkMode}
            />
          </div>

          {/* Danger Zone */}
          <div className="card border-2 border-error/30">
            <h2 className="text-lg font-semibold mb-4 text-error">Zona de Peligro</h2>
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/70 dark:hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={20} />
                  <span>Cerrar Sesión</span>
                </div>
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-error/10 text-error transition"
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={20} />
                  <span>Eliminar Cuenta</span>
                </div>
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="text-center text-sm text-gray-500 py-4">
            <p>Kora v1.0.0</p>
            <p className="mt-1">
              <a href="#" className="text-primary hover:underline">
                Términos de Servicio
              </a>
              {' • '}
              <a href="#" className="text-primary hover:underline">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingItemProps {
  label: string;
  onClick: () => void;
}

function SettingItem({ label, onClick }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
    >
      <span>{label}</span>
      <span className="text-gray-400">›</span>
    </button>
  );
}

interface SettingToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function SettingToggle({ label, checked, onChange, disabled = false }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-3">
      <span className={disabled ? 'opacity-50' : ''}>{label}</span>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition ${
          checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'transform translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  );
}
