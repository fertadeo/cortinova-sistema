import { useState, useCallback, useEffect } from 'react';

interface ProfileData {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
  company: string;
  avatarUrl?: string;
  lastUpdated?: string;
}

interface ProfileSettings {
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
  company: string;
}

// Utilidad para redimensionar imágenes
const resizeImage = (
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.8
): Promise<{ blob: Blob; fileName: string }> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Generar nombre de archivo único
            const timestamp = Date.now();
            const fileName = `avatar_${timestamp}.jpeg`;
            
            resolve({ blob, fileName });
          } else {
            reject(new Error('Error al procesar la imagen'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'));
    };

    img.src = URL.createObjectURL(file);
  });
};

// Utilidad para validar archivos de imagen
const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'El archivo debe ser una imagen' };
  }

  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'La imagen no puede superar 5MB' };
  }

  // Validar formatos soportados
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedFormats.includes(file.type)) {
    return { isValid: false, error: 'Formato de imagen no soportado. Use JPEG, PNG o WebP' };
  }

  return { isValid: true };
};

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Gonzalo Manavella',
    email: 'administracion@cortinovaok.com',
    role: 'Administrador',
    avatar: '',
    phone: '+54 9 351 755-2258',
    company: 'Cortinova'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar perfil desde localStorage al inicializar
  useEffect(() => {
    loadProfileFromStorage();
  }, []);

  const loadProfileFromStorage = useCallback(() => {
    try {
      const storedProfile = localStorage.getItem('profileSettings');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(prev => ({ ...prev, ...parsedProfile }));
      }
    } catch (error) {
      console.error('Error cargando perfil desde localStorage:', error);
    }
  }, []);

  const saveProfileToStorage = useCallback((profileData: ProfileSettings) => {
    try {
      localStorage.setItem('profileSettings', JSON.stringify(profileData));
      setProfile(prev => ({ ...prev, ...profileData, lastUpdated: new Date().toISOString() }));
    } catch (error) {
      console.error('Error guardando perfil en localStorage:', error);
      setError('Error al guardar el perfil localmente');
    }
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<ProfileSettings>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular llamada a API (aquí iría tu endpoint real)
      const updatedProfile = { ...profile, ...profileData };
      
      // Guardar en localStorage inmediatamente
      saveProfileToStorage(updatedProfile);

      // Aquí iría la llamada real a tu API
      // const response = await fetch('/api/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedProfile)
      // });
      
      // if (!response.ok) throw new Error('Error al actualizar perfil');

      setIsLoading(false);
      return { success: true, data: updatedProfile };
    } catch (error) {
      setIsLoading(false);
      setError('Error al actualizar el perfil');
      return { success: false, error: 'Error al actualizar el perfil' };
    }
  }, [profile, saveProfileToStorage]);

  // Función para limpiar avatares antiguos del localStorage
  const cleanupOldAvatars = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const avatarKeys = keys.filter(key => key.startsWith('avatar_'));
      
      // Mantener solo los últimos 5 avatares
      if (avatarKeys.length > 5) {
        avatarKeys
          .sort()
          .slice(0, avatarKeys.length - 5)
          .forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.error('Error limpiando avatares antiguos:', error);
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar archivo
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Redimensionar imagen
      const { blob, fileName } = await resizeImage(file, 200, 200, 0.8);
      
      // Convertir a base64 para almacenamiento persistente
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error('Error al convertir imagen a base64'));
        };
        reader.readAsDataURL(blob);
      });

      // Guardar en localStorage con nombre único
      const avatarKey = `avatar_${Date.now()}`;
      localStorage.setItem(avatarKey, base64Data);
      
      // Limpiar avatares antiguos
      cleanupOldAvatars();
      
      // Actualizar perfil con nueva imagen
      const updatedProfile = { 
        ...profile, 
        avatar: fileName, 
        avatarUrl: base64Data // Guardamos el base64 directamente
      };
      saveProfileToStorage(updatedProfile);

      // Crear URL temporal para preview inmediato
      const avatarUrl = URL.createObjectURL(blob);

      setIsLoading(false);
      return { success: true, avatarUrl };
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [profile, saveProfileToStorage, cleanupOldAvatars]);

  const resetProfile = useCallback(() => {
    const defaultProfile: ProfileSettings = {
      name: 'Gonzalo Manavella',
      email: 'administracion@cortinovaok.com',
      role: 'Administrador',
      avatar: '',
      phone: '+54 9 351 755-2258',
      company: 'Cortinova'
    };

    saveProfileToStorage(defaultProfile);
    setError(null);
  }, [saveProfileToStorage]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    resetProfile,
    loadProfileFromStorage,
    cleanupOldAvatars
  };
};
