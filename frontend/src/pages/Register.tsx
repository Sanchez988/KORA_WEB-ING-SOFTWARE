import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../services';
import { handleApiError } from '../services/api';
import BrandLogo from '../components/BrandLogo';

const registerSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .regex(/@pascualbravo\.edu\.co$/, 'Debes usar tu correo institucional'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      'Debe tener mayúscula, minúscula, número y carácter especial (@$!%*?&#)'
    ),
  confirmPassword: z.string(),
  dateOfBirth: z.string().min(1, 'Fecha de nacimiento requerida'),
  terms: z.boolean().refine((val) => val === true, 'Debes aceptar los términos'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const dateOfBirth = watch('dateOfBirth');

  // Calcular edad
  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(dateOfBirth);

  const onSubmit = async (data: RegisterForm) => {
    if (age < 18) {
      toast.error('Debes ser mayor de 18 años para registrarte');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        email: data.email,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
      });

      toast.success('¡Registro exitoso! Por favor verifica tu correo electrónico.');
      navigate('/login');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-gradient-soft dark:bg-gray-900">
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-md w-full surface-glass rounded-card shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <BrandLogo size="sm" showSubtitle subtitle="Brav Crew" />
          <h1 className="text-3xl font-bold gradient-text mt-4">Crear Cuenta</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Únete a Kora</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Correo Institucional
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="input"
              placeholder="tu.correo@pascualbravo.edu.co"
            />
            {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
              Fecha de Nacimiento
            </label>
            <input
              id="dateOfBirth"
              type="date"
              {...register('dateOfBirth')}
              className="input"
              max={new Date().toISOString().split('T')[0]}
            />
            {dateOfBirth && (
              <p className={`text-xs mt-1 ${age >= 18 ? 'text-success' : 'text-error'}`}>
                {age >= 18 ? `✓ ${age} años` : `✗ Debes ser mayor de 18 años (tienes ${age})`}
              </p>
            )}
            {errors.dateOfBirth && (
              <p className="text-error text-xs mt-1">{errors.dateOfBirth.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
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
            {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Min. 8 caracteres: 1 mayúscula, 1 minúscula, 1 número, 1 especial (@$!%*?&#)
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="input pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              {...register('terms')}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
              Acepto los términos y condiciones y la política de privacidad
            </label>
          </div>
          {errors.terms && <p className="text-error text-xs">{errors.terms.message}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        {/* Link */}
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-primary hover:text-primary-dark font-medium">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
