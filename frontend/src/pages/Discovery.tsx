import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Heart, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { profileService, matchService } from '../services';
import type { Profile } from '../types';

export default function Discovery() {
  const queryClient = useQueryClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['discovery'],
    queryFn: () => profileService.getDiscoveryProfiles(20, 0),
  });

  useEffect(() => {
    if (data?.profiles) {
      setProfiles(data.profiles);
      setCurrentIndex(0);
    }
  }, [data]);

  const currentProfile = profiles[currentIndex];

  const handleLike = async (isSuperLike = false) => {
    if (!currentProfile) return;

    try {
      const response = await matchService.likeProfile(currentProfile.userId, isSuperLike);
      
      if (response.isMatch) {
        setMatchedUser(currentProfile);
        setShowMatch(true);
        queryClient.invalidateQueries({ queryKey: ['matches'] });
        toast.success('¡Es un match! 🎉');
      } else {
        toast.success(isSuperLike ? 'Super Like enviado ⭐' : 'Like enviado ❤️');
      }

      setCurrentIndex(currentIndex + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al enviar like');
    }
  };

  const handleNope = async () => {
    if (!currentProfile) return;

    try {
      await matchService.dislikeProfile(currentProfile.userId);
      setCurrentIndex(currentIndex + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Buscando perfiles...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile || currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-soft dark:bg-gray-900">
        <div className="text-center surface-glass rounded-card px-8 py-10 max-w-md w-full">
          <Heart className="w-16 h-16 mx-auto text-primary/70 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No hay más perfiles por ahora</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sigue activa y vuelve más tarde para descubrir nuevas conexiones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gray-900 px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6 surface-glass rounded-card py-4 px-5">
          <h1 className="text-3xl font-bold gradient-text">Descubrir</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {profiles.length - currentIndex} perfiles disponibles
          </p>
        </div>

        {/* Card Stack */}
        <div className="relative" style={{ height: '600px' }}>
          <SwipeableCard
            profile={currentProfile}
            onLike={() => handleLike(false)}
            onNope={handleNope}
            onSuperLike={() => handleLike(true)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mt-6">
          <button
            onClick={handleNope}
            className="surface-glass p-4 rounded-full shadow-md hover:scale-110 transition-transform active:scale-95"
          >
            <X size={32} className="text-error" />
          </button>

          <button
            onClick={() => handleLike(true)}
            className="bg-gradient-primary p-4 rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95"
          >
            <Zap size={32} className="text-white" />
          </button>

          <button
            onClick={() => handleLike(false)}
            className="surface-glass p-4 rounded-full shadow-md hover:scale-110 transition-transform active:scale-95"
          >
            <Heart size={32} className="text-success" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Match Modal */}
      {showMatch && matchedUser && (
        <MatchModal user={matchedUser} onClose={() => setShowMatch(false)} />
      )}
    </div>
  );
}

// Componente de tarjeta deslizable
interface SwipeableCardProps {
  profile: Profile;
  onLike: () => void;
  onNope: () => void;
  onSuperLike: () => void;
}

function SwipeableCard({ profile, onLike, onNope }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onLike();
    } else if (info.offset.x < -100) {
      onNope();
    }
  };

  return (
    <motion.div
      className="swipe-card"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    >
      {/* Image */}
      <div className="relative h-full">
        <img
          src={profile.photos[0]}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-card" />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-bold mb-1">
            {profile.name}, {profile.age}
          </h2>
          <p className="text-lg mb-3">{profile.program}</p>
          <p className="text-sm mb-4 line-clamp-2">{profile.bio}</p>

          {/* Interests */}
          <div className="flex flex-wrap gap-2">
            {profile.interests.slice(0, 5).map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs"
              >
                {interest}
              </span>
            ))}
            {profile.interests.length > 5 && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                +{profile.interests.length - 5} más
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Modal de match
interface MatchModalProps {
  user: Profile;
  onClose: () => void;
}

function MatchModal({ user, onClose }: MatchModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="surface-glass rounded-card p-8 max-w-md w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-4xl font-bold gradient-text mb-4">¡Es un Match! 🎉</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          A ti y a {user.name} les gustaron mutuamente
        </p>

        <div className="flex justify-center gap-6 mb-8">
          <img src={user.photos[0]} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
        </div>

        <button onClick={onClose} className="btn btn-primary w-full">
          Enviar Mensaje
        </button>
        <button onClick={onClose} className="btn btn-outline w-full mt-3">
          Seguir Deslizando
        </button>
      </motion.div>
    </motion.div>
  );
}
