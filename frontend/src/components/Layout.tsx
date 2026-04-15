import { useEffect, useMemo } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, MessageCircle, User, Settings as SettingsIcon } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { matchService } from '../services';
import BrandLogo from './BrandLogo';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Layout() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { token, userId } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['matches'],
    queryFn: matchService.getMyMatches,
    refetchOnMount: 'always',
  });

  const unreadCount = useMemo(() => {
    const matches = data?.matches || [];
    return matches.filter((match: any) => match.lastMessage && match.lastMessage.senderId !== userId && !match.lastMessage.isRead).length;
  }, [data, userId]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
    });

    newSocket.on('new_message_notification', (payload) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      if (!location.pathname.startsWith(`/chat/${payload.matchId}`)) {
        toast(`Nuevo mensaje de ${payload.sender?.name || 'tu match'}`);
      }
    });

    newSocket.on('messages_read', () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, location.pathname, queryClient]);

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gray-900">
      <header className="sticky top-0 z-20 border-b border-white/40 dark:border-gray-700/80 bg-white/75 dark:bg-gray-800/90 backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 py-2">
          <BrandLogo variant="inline" size="sm" showSubtitle={false} />
        </div>
      </header>

      {/* Content */}
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/85 dark:bg-gray-800/95 border-t border-white/40 dark:border-gray-700 shadow-lg backdrop-blur-md">
        <div className="max-w-lg mx-auto px-6 py-3">
          <div className="flex justify-around items-center">
            <NavItem to="/discovery" icon={<Home size={24} />} label="Descubrir" />
            <NavItem to="/matches" icon={<MessageCircle size={24} />} label="Matches" badgeCount={unreadCount} />
            <NavItem to="/profile" icon={<User size={24} />} label="Perfil" />
            <NavItem to="/settings" icon={<SettingsIcon size={24} />} label="Ajustes" />
          </div>
        </div>
      </nav>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badgeCount?: number;
}

function NavItem({ to, icon, label, badgeCount = 0 }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
          isActive
            ? 'text-primary'
            : 'text-gray-500 dark:text-gray-400 hover:text-primary'
        }`
      }
    >
      <span className="relative">
        {icon}
        {badgeCount > 0 && (
          <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 bg-error text-white text-[10px] rounded-full flex items-center justify-center font-bold">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </span>
      <span className="text-xs font-medium">{label}</span>
    </NavLink>
  );
}
