import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera, Plus, X } from 'lucide-react';
import { profileService } from '../services';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../services/api';
import { Gender, RelationshipGoal } from '../types';

const INTERESTS = [
  'Deportes', 'Música', 'Cine', 'Libros', 'Viajes', 'Tecnología',
  'Arte', 'Gastronomía', 'Fotografía', 'Videojuegos', 'Fitness',
  'Naturaleza', 'Moda', 'Baile', 'Mascotas', 'Series',
];

const HOBBIES = [
  'Tocar instrumento', 'Pintar', 'Dibujar', 'Cocinar', 'Programar',
  'Leer', 'Fotografía', 'Ejercicio', 'Bailar', 'Senderismo',
  'Jardinería', 'Escribir', 'Jugar ajedrez', 'Ver películas', 'Viajar',
];

export default function CreateProfile() {
  const navigate = useNavigate();
  const { setHasProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customHobbies, setCustomHobbies] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [hobbyInput, setHobbyInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const bio = watch('bio', '');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 6) {
      toast.error('Máximo 6 fotos');
      return;
    }

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} excede 5MB`);
        return false;
      }
      return true;
    });

    // Convertir a URLs para previsualización
    const photoUrls: string[] = [];
    for (const file of validFiles) {
      const reader = new FileReader();
      reader.onloadend = () => {
        photoUrls.push(reader.result as string);
        if (photoUrls.length === validFiles.length) {
          setPhotos([...photos, ...photoUrls]);
          setPhotoFiles([...photoFiles, ...validFiles]);
        }
      };
      reader.readAsDataURL(file);
    }

    // Resetear el input para poder seleccionar el mismo archivo de nuevo
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      if (selectedInterests.length >= 10) {
        toast.error('Máximo 10 intereses');
        return;
      }
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const addCustomInterest = () => {
    const value = interestInput.trim();
    if (!value) return;

    if (value.length > 150) {
      toast.error('Cada gusto puede tener máximo 150 caracteres');
      return;
    }

    if (selectedInterests.includes(value)) {
      toast.error('Este gusto ya fue agregado');
      return;
    }

    if (selectedInterests.length >= 10) {
      toast.error('Máximo 10 intereses');
      return;
    }

    setSelectedInterests([...selectedInterests, value]);
    setInterestInput('');
  };

  const toggleHobby = (hobby: string) => {
    if (customHobbies.includes(hobby)) {
      setCustomHobbies(customHobbies.filter((h) => h !== hobby));
      return;
    }

    if (customHobbies.length >= 8) {
      toast.error('Máximo 8 hobbies');
      return;
    }

    setCustomHobbies([...customHobbies, hobby]);
  };

  const addHobby = () => {
    const value = hobbyInput.trim();
    if (!value) return;

    if (value.length > 150) {
      toast.error('Cada hobby puede tener máximo 150 caracteres');
      return;
    }

    if (customHobbies.includes(value)) {
      toast.error('Este hobby ya fue agregado');
      return;
    }

    if (customHobbies.length >= 8) {
      toast.error('Máximo 8 hobbies');
      return;
    }

    setCustomHobbies([...customHobbies, value]);
    setHobbyInput('');
  };

  const removeHobby = (index: number) => {
    setCustomHobbies(customHobbies.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    if (photos.length < 1) {
      toast.error('Debes subir al menos 1 foto');
      return;
    }

    if (selectedInterests.length < 3) {
      toast.error('Debes seleccionar al menos 3 intereses');
      return;
    }

    setLoading(true);
    try {
      // Subir fotos al servidor
      toast.loading('Subiendo fotos...', { id: 'upload' });
      const { uploadService } = await import('../services');
      const uploadedPhotoUrls = await uploadService.uploadMultiple(photos);
      toast.success('Fotos subidas exitosamente', { id: 'upload' });

      // Crear perfil con URLs de Cloudinary
      await profileService.createProfile({
        ...data,
        photos: uploadedPhotoUrls,
        interests: selectedInterests,
        hobbies: customHobbies,
      });

      setHasProfile(true);
      toast.success('¡Perfil creado exitosamente! 🎉');
      navigate('/discovery');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Crea tu Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cuéntanos sobre ti para encontrar mejores conexiones
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Fotos */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">
              Fotos ({photos.length}/6)
              <span className="text-error text-sm ml-2">* 1 foto requerida</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {photos.length < 6 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Camera size={32} />
                  <span className="text-xs mt-2 text-center px-2">Seleccionar fotos</span>
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Formatos: JPG, PNG, GIF. Máximo 5MB por foto.
            </p>
          </div>

          {/* Información básica */}
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold mb-4">Información Básica</h3>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                {...register('name', { required: true, minLength: 2, maxLength: 50 })}
                className="input"
                placeholder="Tu nombre"
              />
              {errors.name && <p className="text-error text-xs mt-1">Nombre requerido (2-50 caracteres)</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Género</label>
              <select {...register('gender', { required: true })} className="input">
                <option value="">Selecciona...</option>
                <option value={Gender.MALE}>Hombre</option>
                <option value={Gender.FEMALE}>Mujer</option>
                <option value={Gender.OTHER}>Otro</option>
                <option value={Gender.PREFER_NOT_TO_SAY}>Prefiero no decir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Programa Académico</label>
              <input
                type="text"
                {...register('program', { required: true, minLength: 3, maxLength: 100 })}
                className="input"
                placeholder="Ej: Ingeniería de Sistemas, Contaduría Pública, Diseño Gráfico..."
              />
              {errors.program && <p className="text-error text-xs mt-1">Programa requerido (3-100 caracteres)</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Semestre (Opcional)</label>
              <input
                type="number"
                {...register('semester', { min: 1, max: 12 })}
                className="input"
                placeholder="1-12"
                min="1"
                max="12"
              />
            </div>
          </div>

          {/* Biografía */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">
              Biografía
              <span className="text-error text-sm ml-2">* 50-500 caracteres</span>
            </h3>
            <textarea
              {...register('bio', { required: true, minLength: 50, maxLength: 500 })}
              className="input min-h-[120px]"
              placeholder="Cuéntanos sobre ti, tus pasiones, lo que buscas..."
            />
            <div className="flex justify-between text-xs mt-1">
              <span className={bio.length < 50 || bio.length > 500 ? 'text-error' : 'text-success'}>
                {bio.length >= 50 ? '✓' : '✗'} {bio.length}/500 caracteres
              </span>
            </div>
          </div>

          {/* Intereses */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">
              Intereses
              <span className="text-error text-sm ml-2">* Mínimo 3, máximo 10 (hasta 150 caracteres c/u)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedInterests.includes(interest)
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                className="input flex-1"
                placeholder="Agregar gusto personalizado"
                maxLength={150}
              />
              <button type="button" onClick={addCustomInterest} className="btn btn-secondary">
                <Plus size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Seleccionados: {selectedInterests.length}/10
            </p>
          </div>

          {/* Hobbies */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Hobbies (Opcional, máximo 8, hasta 150 caracteres c/u)</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {HOBBIES.map((hobby) => (
                <button
                  key={hobby}
                  type="button"
                  onClick={() => toggleHobby(hobby)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    customHobbies.includes(hobby)
                      ? 'bg-accent text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {hobby}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={hobbyInput}
                onChange={(e) => setHobbyInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                className="input flex-1"
                placeholder="Agregar hobby personalizado"
                maxLength={150}
              />
              <button
                type="button"
                onClick={addHobby}
                disabled={customHobbies.length >= 8}
                className="btn btn-secondary"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {customHobbies.map((hobby, index) => (
                <span
                  key={index}
                  className="bg-accent/20 text-accent px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {hobby}
                  <button type="button" onClick={() => removeHobby(index)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Objetivo */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">¿Qué buscas?</h3>
            <select {...register('relationshipGoal', { required: true })} className="input">
              <option value="">Selecciona...</option>
              <option value={RelationshipGoal.FRIENDSHIP}>Amistad</option>
              <option value={RelationshipGoal.DATING}>Citas</option>
              <option value={RelationshipGoal.SERIOUS_RELATIONSHIP}>Relación seria</option>
              <option value={RelationshipGoal.JUST_MEETING_PEOPLE}>Solo conocer gente</option>
              <option value={RelationshipGoal.STUDY_GROUPS}>Grupos de estudio</option>
            </select>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Creando perfil...' : 'Crear Perfil'}
          </button>
        </form>
      </div>
    </div>
  );
}
