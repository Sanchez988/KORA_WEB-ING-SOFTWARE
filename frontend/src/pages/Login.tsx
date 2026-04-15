import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../services';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../services/api';
import BrandLogo from '../components/BrandLogo';

const loginSchema = z.object({
  email: z.string().email('Email inválido').regex(/@pascualbravo\.edu\.co$/, 'Debes usar tu correo institucional'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(response.token, response.refreshToken, response.user.id, response.user.email, response.user.hasProfile);
      
      toast.success('¡Bienvenido a Kora! 🎉');
      
      if (response.user.hasProfile) {
        navigate('/discovery');
      } else {
        navigate('/create-profile');
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden bg-gradient-soft dark:bg-gray-900">
      <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-md w-full surface-glass rounded-card shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <BrandLogo size="md" showSubtitle subtitle="Brav Crew" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Correo Institucional
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="input"
              placeholder="tu.correo@pascualbravo.edu.co"
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="input pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-error text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <Link
            to="/register"
            className="block text-primary hover:text-primary-dark font-medium"
          >
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}
