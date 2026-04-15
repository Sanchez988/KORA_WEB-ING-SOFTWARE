import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import CreateProfile from './pages/CreateProfile';
import Discovery from './pages/Discovery';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Layout
import Layout from './components/Layout';


function App() {
  // Aplicar modo oscuro al cargar la aplicación
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1D29',
            color: '#FDFEFF',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#26D07C',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF4757',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/discovery" replace />} />
          <Route path="create-profile" element={<CreateProfile />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="matches" element={<Matches />} />
          <Route path="chat/:matchId" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Componente de ruta protegida
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default App;
