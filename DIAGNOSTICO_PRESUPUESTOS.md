# Diagnóstico: Loading infinito en "Seguimiento de Presupuestos"

## 🔍 Problema reportado
La pantalla "Seguimiento de Presupuestos" se quedaba atascada mostrando "Cargando presupuestos..." indefinidamente en producción.

## 🎯 Causa raíz identificada

### 1. **URL de API truncada en producción**
**Archivo:** `frontend/sistema-stock/.env.production`
```env
# ANTES (INCORRECTO):
NEXT_PUBLIC_API_URL=http://

# DESPUÉS (CORREGIDO):
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

**Impacto:** 
- Las peticiones fetch intentaban acceder a URLs inválidas: `http:///presupuestos?include=clientes,producto`
- El navegador quedaba esperando indefinidamente sin timeout
- No se mostraba ningún mensaje de error al usuario

### 2. **Falta de timeout en peticiones fetch**
El componente `PresupuestosTable` no tenía timeout configurado, por lo que:
- Si el backend no respondía, la petición se quedaba colgada indefinidamente
- El usuario veía "Cargando presupuestos..." sin ninguna indicación del problema
- No había forma de detectar si el servidor estaba caído o la URL era incorrecta

### 3. **Mensajes de error genéricos**
Los errores no proporcionaban suficiente información para diagnosticar el problema.

## ✅ Solución implementada

### Cambios en `.env.production`
- URL completada con valor por defecto válido
- Comentarios agregados explicando cómo configurar para producción real
- Documentación del formato esperado

### Cambios en `components/presupuestosTable.tsx`

#### 1. Validación de configuración
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl || apiUrl === 'http://' || apiUrl === 'https://') {
  throw new Error('La URL de la API no está configurada correctamente...');
}
```

#### 2. Timeout de 10 segundos
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

const response = await fetch(url, { signal: controller.signal });
```

#### 3. Manejo de errores mejorado
- Mensajes específicos para timeout
- Códigos de estado HTTP en errores
- Información clara para debugging

## 📍 Ubicación del componente
El "Seguimiento de Presupuestos" se muestra en:
- **Página:** `/app/home/page.tsx` (línea 175)
- **Componente:** `components/presupuestosTable.tsx`
- **Endpoint:** `GET /presupuestos?include=clientes,producto`

## 🔧 Archivos modificados
1. `frontend/sistema-stock/.env.production` - URL corregida
2. `frontend/sistema-stock/components/presupuestosTable.tsx` - Timeout y validación

## ⚠️ Acciones pendientes

### Para el equipo de desarrollo:
1. **Actualizar `.env.production` con la URL real del backend de producción**
   ```env
   NEXT_PUBLIC_API_URL=https://api-produccion.cortinova.com/api
   ```

2. **Considerar aplicar el mismo patrón de timeout a otros componentes**
   Se identificaron 25+ lugares con fetch sin timeout. Recomendación:
   - Crear un helper `fetchWithTimeout()` compartido
   - Refactorizar gradualmente todos los fetch para usar el helper

### Para backend:
3. **Verificar si el hotfix reciente en `PUT /presupuestos/:id` afecta el listado**
   - El usuario mencionó un hotfix reciente en validación
   - Aunque no debería afectar GET, vale la pena verificar

## 🧪 Testing recomendado

### Escenario 1: Backend disponible
✅ La tabla debe cargar correctamente
✅ Los presupuestos se muestran sin delay notable

### Escenario 2: Backend no responde
✅ Después de 10 segundos muestra error: "La solicitud tardó demasiado tiempo..."
✅ El usuario puede recargar la página o reintentar

### Escenario 3: URL mal configurada
✅ Muestra error inmediato: "La URL de la API no está configurada correctamente..."

### Escenario 4: Error HTTP (500, 404, etc.)
✅ Muestra error con código: "Error al cargar los datos: 500 / 200"

## 📊 Impacto
- ✅ **Fix inmediato** del problema de loading infinito
- ✅ **Mejor UX** con mensajes de error claros
- ✅ **Prevención** de problemas similares con timeout
- ⚠️ **Requiere** configuración de URL de producción real para deploy

## 🔗 Pull Request
**PR #100:** https://github.com/fertadeo/cortinova-sistema/pull/100
**Rama:** `cursor/fix-presupuestos-loading-12f4`

---

**Fecha:** 2026-09-15  
**Investigado por:** Cursor Cloud Agent
