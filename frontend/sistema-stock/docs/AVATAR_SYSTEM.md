# Sistema de Avatares - Documentación

## 📋 **Resumen**

El sistema de avatares está diseñado para funcionar tanto en desarrollo como en producción, utilizando almacenamiento local (localStorage) para persistencia de datos.

## 🏗️ **Arquitectura**

### **Almacenamiento:**
- **localStorage:** Base64 de imágenes redimensionadas
- **Perfil:** Referencias a las imágenes almacenadas
- **Limpieza automática:** Mantiene solo los últimos 5 avatares

### **Procesamiento:**
- **Redimensionamiento:** Automático a 200x200px
- **Optimización:** JPEG con 80% de calidad
- **Validación:** Tipo, tamaño y formato

## 🔧 **Funcionalidades**

### **1. Subida de Imágenes**
```typescript
const { uploadAvatar } = useProfile();
const result = await uploadAvatar(file);
```

### **2. Validación Automática**
- ✅ Tipos soportados: JPEG, JPG, PNG, WebP
- ✅ Tamaño máximo: 5MB (antes del redimensionamiento)
- ✅ Redimensionamiento automático: 200x200px

### **3. Almacenamiento Persistente**
- ✅ Base64 en localStorage
- ✅ Nombres únicos: `avatar_{timestamp}`
- ✅ Limpieza automática de archivos antiguos

## 🚀 **Ventajas del Sistema**

### **✅ Funciona en Producción**
- No depende de directorios del servidor
- Funciona en Vercel, Netlify, etc.
- Sin configuración adicional

### **✅ Rendimiento Optimizado**
- Imágenes siempre optimizadas
- Carga instantánea desde localStorage
- Sin llamadas a API

### **✅ Gestión Automática**
- Limpieza de archivos antiguos
- Validación robusta
- Manejo de errores

## 📁 **Estructura de Datos**

### **localStorage:**
```
avatar_1703123456789: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
avatar_1703123456790: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
profileSettings: '{"name":"Usuario","avatar":"avatar_1703123456790.jpeg",...}'
```

### **Perfil del Usuario:**
```typescript
{
  name: string;
  email: string;
  role: string;
  avatar: string;        // Nombre del archivo
  avatarUrl: string;     // Base64 de la imagen
  phone: string;
  company: string;
}
```

## 🔄 **Flujo de Trabajo**

1. **Usuario selecciona imagen**
2. **Validación automática** (tipo, tamaño, formato)
3. **Redimensionamiento** a 200x200px
4. **Conversión a base64**
5. **Almacenamiento en localStorage**
6. **Actualización del perfil**
7. **Limpieza de archivos antiguos**

## 🛠️ **Uso en Componentes**

### **SettingsModal:**
```typescript
const { uploadAvatar, isLoading } = useProfile();

const handleFileChange = async (file: File) => {
  const result = await uploadAvatar(file);
  if (result.success) {
    // Imagen subida correctamente
  }
};
```

### **Sidebar/Header:**
```typescript
const { profile } = useProfile();

// La imagen se carga automáticamente desde profile.avatarUrl
<Avatar src={profile.avatarUrl} name={profile.name} />
```

## ⚠️ **Limitaciones**

### **localStorage:**
- Límite de ~5-10MB por dominio
- Se borra al limpiar datos del navegador
- No se sincroniza entre dispositivos

### **Solución Recomendada:**
Para producción a gran escala, considerar:
- Cloud Storage (AWS S3, Cloudinary)
- Base de datos con BLOB
- CDN para distribución

## 🔧 **Configuración**

### **Parámetros de Redimensionamiento:**
```typescript
const { blob, fileName } = await resizeImage(
  file,           // Archivo original
  200,            // Ancho máximo (px)
  200,            // Alto máximo (px)
  0.8             // Calidad JPEG (0-1)
);
```

### **Limpieza Automática:**
```typescript
// Mantiene solo los últimos 5 avatares
const avatarKeys = keys.filter(key => key.startsWith('avatar_'));
if (avatarKeys.length > 5) {
  // Elimina los más antiguos
}
```

## 🐛 **Solución de Problemas**

### **Imagen no se guarda:**
1. Verificar que el archivo sea una imagen válida
2. Verificar el tamaño (máximo 5MB)
3. Verificar el formato (JPEG, PNG, WebP)

### **Error de localStorage:**
1. Verificar espacio disponible
2. Limpiar datos del navegador
3. Usar modo incógnito para pruebas

### **Imagen no se muestra:**
1. Verificar que `profile.avatarUrl` contenga datos
2. Verificar formato base64 válido
3. Verificar que el componente Avatar use la URL correcta
