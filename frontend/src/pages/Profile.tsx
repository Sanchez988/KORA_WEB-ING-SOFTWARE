import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Briefcase, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { profileService } from '../services';

const RELATIONSHIP_GOAL_LABELS: Record<string, string> = {
  FRIENDSHIP: 'Amistad',
  DATING: 'Citas',
  SERIOUS_RELATIONSHIP: 'Relacion seria',
  JUST_MEETING_PEOPLE: 'Solo conocer gente',
  STUDY_GROUPS: 'Grupos de estudio',
};

export default function Profile() {
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['myProfile'],
    queryFn: profileService.getMyProfile,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    program: '',
    semester: '',
    relationshipGoal: 'FRIENDSHIP',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        program: profile.program || '',
        semester: profile.semester ? String(profile.semester) : '',
        relationshipGoal: profile.relationshipGoal || 'FRIENDSHIP',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      if (!formData.name.trim() || !formData.program.trim()) {
        toast.error('Nombre y programa son obligatorios');
        return;
      }

      if (!formData.bio.trim() || formData.bio.trim().length < 50) {
        toast.error('La biografia debe tener minimo 50 caracteres');
        return;
      }

      await profileService.updateProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        program: formData.program.trim(),
        semester: formData.semester ? parseInt(formData.semester, 10) : null,
        relationshipGoal: formData.relationshipGoal,
      });

      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'No se pudo actualizar el perfil');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 surface-glass rounded-card p-4">
          <h1 className="text-3xl font-bold gradient-text">Mi Perfil</h1>
          <button
            className="btn btn-outline flex items-center gap-2"
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
          >
            <Edit size={18} />
            {isEditing ? 'Guardar' : 'Editar'}
          </button>
        </div>

        {/* Profile Card */}
        <div className="card">
          {/* Photos Grid */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {profile.photos.map((photo: string, index: number) => (
              <img
                key={index}
                src={photo}
                alt={`Foto ${index + 1}`}
                className="aspect-square object-cover rounded-xl"
              />
            ))}
          </div>

          {/* Basic Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              ) : (
                `${profile.name}, ${profile.age}`
              )}
            </h2>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Briefcase size={16} />
              {isEditing ? (
                <div className="flex gap-2 items-center w-full">
                  <input
                    type="text"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="input"
                    placeholder="Programa academico"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="input w-28"
                    placeholder="Sem"
                  />
                </div>
              ) : (
                <>
                  <span>{profile.program}</span>
                  {profile.semester && <span>• Semestre {profile.semester}</span>}
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Sobre mí</h3>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input min-h-[120px]"
                maxLength={500}
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
            )}
          </div>

          {/* Relationship Goal */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Heart size={18} />
              Buscando
            </h3>
            {isEditing ? (
              <select
                className="input"
                value={formData.relationshipGoal}
                onChange={(e) => setFormData({ ...formData, relationshipGoal: e.target.value })}
              >
                <option value="FRIENDSHIP">Amistad</option>
                <option value="DATING">Citas</option>
                <option value="SERIOUS_RELATIONSHIP">Relacion seria</option>
                <option value="JUST_MEETING_PEOPLE">Solo conocer gente</option>
                <option value="STUDY_GROUPS">Grupos de estudio</option>
              </select>
            ) : (
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {RELATIONSHIP_GOAL_LABELS[profile.relationshipGoal] || profile.relationshipGoal}
              </span>
            )}
          </div>

          {/* Interests */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Intereses</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-secondary/10 text-secondary dark:bg-secondary/20 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Hobbies */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Completeness */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Completitud del perfil</span>
              <span className="text-sm font-bold text-primary">{profile.completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all"
                style={{ width: `${profile.completeness}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
