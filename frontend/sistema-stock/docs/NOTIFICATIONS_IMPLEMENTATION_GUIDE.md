# 🚀 Guía de Implementación: Sistema de Notificaciones Centralizado

## 📋 **Resumen del Sistema**

Sistema completo de notificaciones con:
- ✅ **Base de datos robusta** con templates y configuración por usuario
- ✅ **API REST completa** con todos los endpoints necesarios
- ✅ **Hook centralizado** con polling automático y gestión de estado
- ✅ **Modal avanzado** con filtros, búsqueda y acciones en lote
- ✅ **Integración total** con el sistema existente

---

## 🗄️ **1. Configuración de Base de Datos**

### **Paso 1: Crear las tablas**

Ejecuta los siguientes comandos SQL en tu base de datos:

```sql
-- Tabla principal de notificaciones
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error', 'system') NOT NULL DEFAULT 'info',
  category ENUM('pedido', 'cliente', 'stock', 'presupuesto', 'sistema', 'general') NOT NULL DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  action_url VARCHAR(500) NULL,
  action_text VARCHAR(100) NULL,
  metadata JSON NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_category (category),
  INDEX idx_is_read (is_read),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at),
  INDEX idx_expires_at (expires_at)
);

-- Tabla de configuración por usuario
CREATE TABLE notification_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL UNIQUE,
  
  -- Configuración general
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  sound_on_hover BOOLEAN DEFAULT FALSE,
  
  -- Configuración por tipo
  email_info BOOLEAN DEFAULT TRUE,
  email_success BOOLEAN DEFAULT TRUE,
  email_warning BOOLEAN DEFAULT TRUE,
  email_error BOOLEAN DEFAULT TRUE,
  email_system BOOLEAN DEFAULT TRUE,
  
  push_info BOOLEAN DEFAULT TRUE,
  push_success BOOLEAN DEFAULT TRUE,
  push_warning BOOLEAN DEFAULT TRUE,
  push_error BOOLEAN DEFAULT TRUE,
  push_system BOOLEAN DEFAULT TRUE,
  
  -- Configuración por categoría
  email_pedidos BOOLEAN DEFAULT TRUE,
  email_clientes BOOLEAN DEFAULT TRUE,
  email_stock BOOLEAN DEFAULT TRUE,
  email_presupuestos BOOLEAN DEFAULT TRUE,
  email_sistema BOOLEAN DEFAULT TRUE,
  
  push_pedidos BOOLEAN DEFAULT TRUE,
  push_clientes BOOLEAN DEFAULT TRUE,
  push_stock BOOLEAN DEFAULT TRUE,
  push_presupuestos BOOLEAN DEFAULT TRUE,
  push_sistema BOOLEAN DEFAULT TRUE,
  
  -- Configuración de frecuencia
  digest_frequency ENUM('immediate', 'hourly', 'daily', 'weekly') DEFAULT 'immediate',
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id)
);

-- Tabla de templates
CREATE TABLE notification_templates (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  title_template VARCHAR(255) NOT NULL,
  message_template TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error', 'system') NOT NULL DEFAULT 'info',
  category ENUM('pedido', 'cliente', 'stock', 'presupuesto', 'sistema', 'general') NOT NULL DEFAULT 'general',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Paso 2: Insertar templates básicos**

```sql
INSERT INTO notification_templates (name, title_template, message_template, type, category, priority) VALUES
('pedido_creado', 'Nuevo Pedido #{pedido_id}', 'Se ha creado un nuevo pedido para {cliente_nombre} con un total de ${total}', 'success', 'pedido', 'medium'),
('pedido_completado', 'Pedido Completado #{pedido_id}', 'El pedido para {cliente_nombre} ha sido completado exitosamente', 'success', 'pedido', 'medium'),
('pedido_atrasado', 'Pedido Atrasado #{pedido_id}', 'El pedido para {cliente_nombre} está atrasado por {dias_atraso} días', 'warning', 'pedido', 'high'),
('stock_bajo', 'Stock Bajo - {producto_nombre}', 'El producto {producto_nombre} tiene stock bajo ({stock_actual} unidades)', 'warning', 'stock', 'high'),
('stock_agotado', 'Stock Agotado - {producto_nombre}', 'El producto {producto_nombre} se ha agotado completamente', 'error', 'stock', 'urgent'),
('cliente_nuevo', 'Nuevo Cliente Registrado', 'Se ha registrado un nuevo cliente: {cliente_nombre}', 'info', 'cliente', 'low'),
('presupuesto_aprobado', 'Presupuesto Aprobado #{presupuesto_id}', 'El presupuesto para {cliente_nombre} ha sido aprobado', 'success', 'presupuesto', 'medium'),
('sistema_mantenimiento', 'Mantenimiento Programado', 'El sistema estará en mantenimiento el {fecha} de {hora_inicio} a {hora_fin}', 'warning', 'sistema', 'high');
```

---

## 🔌 **2. Implementación de API**

### **Paso 1: Crear estructura de carpetas**

```
app/
├── api/
│   └── notifications/
│       ├── route.ts                    # GET, POST /api/notifications
│       ├── [id]/
│       │   ├── route.ts                # GET, PATCH, DELETE /api/notifications/[id]
│       │   ├── read/
│       │   │   └── route.ts            # PATCH /api/notifications/[id]/read
│       │   └── archive/
│       │       └── route.ts            # PATCH /api/notifications/[id]/archive
│       ├── read-multiple/
│       │   └── route.ts                # PATCH /api/notifications/read-multiple
│       ├── read-all/
│       │   └── route.ts                # PATCH /api/notifications/read-all
│       ├── settings/
│       │   └── route.ts                # GET, PUT /api/notifications/settings
│       ├── create/
│       │   └── route.ts                # POST /api/notifications/create
│       └── stats/
│           └── route.ts                # GET /api/notifications/stats
```

### **Paso 2: Implementar endpoints principales**

**`app/api/notifications/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const isRead = searchParams.get('is_read');
    const priority = searchParams.get('priority');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      user_id: session.user.id,
      is_archived: false
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (isRead !== null) where.is_read = isRead === 'true';
    if (priority) where.priority = priority;

    // Obtener notificaciones
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { ...where, is_read: false }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        unread_count: unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
```

**`app/api/notifications/create/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, template_name, variables, priority, action_url, action_text, expires_at } = body;

    // Obtener template
    const template = await prisma.notificationTemplate.findUnique({
      where: { name: template_name, is_active: true }
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: { code: 'TEMPLATE_NOT_FOUND', message: 'Template no encontrado' } },
        { status: 404 }
      );
    }

    // Procesar variables en el template
    let title = template.title_template;
    let message = template.message_template;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      title = title.replace(regex, String(value));
      message = message.replace(regex, String(value));
    });

    // Crear notificación
    const notification = await prisma.notification.create({
      data: {
        user_id,
        title,
        message,
        type: template.type,
        category: template.category,
        priority: priority || template.priority,
        action_url,
        action_text,
        metadata: variables,
        expires_at: expires_at ? new Date(expires_at) : null
      }
    });

    return NextResponse.json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } },
      { status: 500 }
    );
  }
}
```

---

## 🎣 **3. Integración en el Frontend**

### **Paso 1: Instalar dependencias**

```bash
npm install date-fns
```

### **Paso 2: Actualizar componentes existentes**

**Actualizar `app/home/page.tsx`:**
```typescript
// Reemplazar el import del hook antiguo
import { useNotificationsV2 } from '@/hooks/useNotificationsV2';

// En el componente
const { unreadCount, hasUnread } = useNotificationsV2();
```

**Actualizar `components/SettingsModal.tsx`:**
```typescript
// Agregar sección de notificaciones
import { useNotificationsV2 } from '@/hooks/useNotificationsV2';

// En el componente
const { settings, updateSettings } = useNotificationsV2();
```

### **Paso 3: Crear notificaciones desde otros componentes**

```typescript
// En cualquier componente donde quieras crear notificaciones
import { useNotificationsV2 } from '@/hooks/useNotificationsV2';

const MyComponent = () => {
  const { createNotification } = useNotificationsV2();

  const handlePedidoCreated = async (pedidoData) => {
    // Crear notificación
    await createNotification({
      template_name: 'pedido_creado',
      variables: {
        pedido_id: pedidoData.id,
        cliente_nombre: pedidoData.cliente.nombre,
        total: pedidoData.total
      },
      action_url: `/pedidos/${pedidoData.id}`,
      action_text: 'Ver Pedido'
    });
  };

  return (
    // Tu componente
  );
};
```

---

## 🔧 **4. Configuración de Producción**

### **Paso 1: Variables de entorno**

```env
# .env.local
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Para emails (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### **Paso 2: Configurar Prisma**

**`prisma/schema.prisma`:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Notification {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  title       String
  message     String
  type        String
  category    String
  isRead      Boolean  @default(false) @map("is_read")
  isArchived  Boolean  @default(false) @map("is_archived")
  priority    String   @default("medium")
  actionUrl   String?  @map("action_url")
  actionText  String?  @map("action_text")
  metadata    Json?
  expiresAt   DateTime? @map("expires_at")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("notifications")
}

model NotificationSettings {
  id                String   @id @default(uuid())
  userId            String   @unique @map("user_id")
  emailEnabled      Boolean  @default(true) @map("email_enabled")
  pushEnabled       Boolean  @default(true) @map("push_enabled")
  soundEnabled      Boolean  @default(true) @map("sound_enabled")
  soundOnHover      Boolean  @default(false) @map("sound_on_hover")
  // ... otros campos
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("notification_settings")
}

model NotificationTemplate {
  id              String   @id @default(uuid())
  name            String   @unique
  titleTemplate   String   @map("title_template")
  messageTemplate String   @map("message_template")
  type            String
  category        String
  priority        String   @default("medium")
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("notification_templates")
}
```

### **Paso 3: Ejecutar migraciones**

```bash
npx prisma generate
npx prisma db push
```

---

## 🎯 **5. Casos de Uso Comunes**

### **Crear notificación de pedido nuevo:**
```typescript
await createNotification({
  template_name: 'pedido_creado',
  variables: {
    pedido_id: '123',
    cliente_nombre: 'Juan Pérez',
    total: 1500.00
  },
  action_url: '/pedidos/123',
  action_text: 'Ver Pedido'
});
```

### **Crear notificación de stock bajo:**
```typescript
await createNotification({
  template_name: 'stock_bajo',
  variables: {
    producto_nombre: 'Tela Premium',
    stock_actual: 5
  },
  action_url: '/stock',
  action_text: 'Gestionar Stock'
});
```

### **Crear notificación de sistema:**
```typescript
await createNotification({
  template_name: 'sistema_mantenimiento',
  variables: {
    fecha: '15/01/2024',
    hora_inicio: '22:00',
    hora_fin: '06:00'
  }
});
```

---

## 🚀 **6. Próximos Pasos**

### **Funcionalidades Avanzadas:**

1. **Notificaciones Push (Web Push):**
   - Implementar Service Worker
   - Configurar VAPID keys
   - Integrar con Firebase Cloud Messaging

2. **Notificaciones por Email:**
   - Configurar nodemailer
   - Crear templates de email
   - Implementar cola de emails

3. **Notificaciones en Tiempo Real:**
   - Integrar Socket.io
   - Implementar WebSockets
   - Notificaciones instantáneas

4. **Analytics de Notificaciones:**
   - Tracking de apertura
   - Métricas de engagement
   - Reportes de efectividad

### **Optimizaciones:**

1. **Caché de Notificaciones:**
   - Redis para caché
   - Optimización de consultas
   - Paginación eficiente

2. **Limpieza Automática:**
   - Cron jobs para limpiar notificaciones antiguas
   - Archivado automático
   - Gestión de espacio

---

## ✅ **Verificación de Implementación**

### **Checklist de Verificación:**

- [ ] Base de datos creada con todas las tablas
- [ ] Templates básicos insertados
- [ ] API endpoints implementados y funcionando
- [ ] Hook `useNotificationsV2` integrado
- [ ] Modal `NotificationsModal` funcionando
- [ ] Componente `NotificationCenter` actualizado
- [ ] Notificaciones se crean correctamente
- [ ] Filtros y búsqueda funcionando
- [ ] Acciones en lote operativas
- [ ] Configuración de usuario guardándose
- [ ] Polling automático activo
- [ ] Sonidos funcionando
- [ ] Responsive design verificado

### **Pruebas Recomendadas:**

1. **Crear notificación de prueba:**
   ```typescript
   await createNotification({
     template_name: 'pedido_creado',
     variables: {
       pedido_id: 'TEST-001',
       cliente_nombre: 'Cliente de Prueba',
       total: 1000.00
     }
   });
   ```

2. **Verificar en el modal:**
   - Abrir modal de notificaciones
   - Verificar que aparece la notificación
   - Probar filtros y búsqueda
   - Marcar como leída
   - Archivar/eliminar

3. **Verificar configuración:**
   - Abrir configuración en el modal
   - Cambiar opciones
   - Verificar que se guardan

---

## 🆘 **Solución de Problemas**

### **Problemas Comunes:**

1. **Error de conexión a base de datos:**
   - Verificar `DATABASE_URL` en `.env`
   - Ejecutar `npx prisma generate`
   - Verificar que las tablas existen

2. **Notificaciones no aparecen:**
   - Verificar que el usuario está autenticado
   - Revisar logs de la API
   - Verificar que el polling está activo

3. **Sonidos no funcionan:**
   - Verificar configuración de sonidos
   - Revisar permisos del navegador
   - Verificar archivos de audio

4. **Modal no se abre:**
   - Verificar que `NotificationsModal` está importado
   - Revisar estado `isOpen`
   - Verificar que no hay errores en consola

### **Logs Útiles:**

```typescript
// Agregar logs para debugging
console.log('Notifications:', notifications);
console.log('Settings:', settings);
console.log('Unread count:', unreadCount);
```

---

¡Con esta implementación tendrás un sistema de notificaciones completo y profesional! 🎉
