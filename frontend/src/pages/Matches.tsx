import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Heart } from 'lucide-react';
import { matchService } from '../services';
import { useAuthStore } from '../store/authStore';
import type { Match } from '../types';

export default function Matches() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['matches'],
    queryFn: matchService.getMyMatches,
    refetchOnMount: 'always',
  });

  const matches: Match[] = data?.matches || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No se pudieron cargar tus matches</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {(error as any)?.response?.data?.error || (error as Error)?.message || 'Ocurrio un error inesperado'}
          </p>
          <button onClick={() => refetch()} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 surface-glass rounded-card px-5 py-4">
          <h1 className="text-3xl font-bold gradient-text mb-2">Tus Matches</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </p>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <div className="text-center py-16 surface-glass rounded-card">
            <Heart className="w-16 h-16 mx-auto text-primary/70 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No tienes matches aún</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sigue deslizando para encontrar personas compatibles
            </p>
            <button onClick={() => navigate('/discovery')} className="btn btn-primary">
              Descubrir Perfiles
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => (
              <MatchCard key={match.matchId} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: Match;
}

function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  return (
    <div
      onClick={() => navigate(`/chat/${match.matchId}`)}
      className="card flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer"
    >
      {/* Avatar */}
      <img
        src={match.user.photos?.[0] || 'https://via.placeholder.com/150?text=Kora'}
        alt={match.user.name || 'Match'}
        className="w-16 h-16 rounded-full object-cover"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg">{match.user.name || 'Usuario'}</h3>
        {match.lastMessage ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {match.lastMessage.content}
          </p>
        ) : (
          <p className="text-sm text-primary">¡Envía el primer mensaje!</p>
        )}
      </div>

      {/* Time & Indicator */}
      <div className="text-right">
        {match.lastMessage && (
          <p className="text-xs text-gray-500 mb-1">{timeAgo(match.lastMessage.sentAt)}</p>
        )}
        {match.lastMessage && match.lastMessage.senderId !== userId && !match.lastMessage.isRead && (
          <div className="w-3 h-3 bg-primary rounded-full ml-auto"></div>
        )}
        <MessageCircle size={24} className="text-gray-400 mt-2" />
      </div>
    </div>
  );
}
