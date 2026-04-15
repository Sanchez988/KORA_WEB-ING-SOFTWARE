import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { authService } from '../services';
import { handleApiError } from '../services/api';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no proporcionado');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage(handleApiError(error));
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-card shadow-2xl p-12 text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verificando correo...</h2>
            <p className="text-gray-600 dark:text-gray-400">Por favor espera un momento</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
            <h2 className="text-2xl font-bold text-success mb-2">¡Verificación Exitosa!</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirigiendo al inicio de sesión...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-error mb-4" />
            <h2 className="text-2xl font-bold text-error mb-2">Error de Verificación</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Ir al inicio de sesión
            </button>
          </>
        )}
      </div>
    </div>
  );
}
