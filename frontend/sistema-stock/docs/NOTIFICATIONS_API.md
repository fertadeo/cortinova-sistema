# Sistema de Notificaciones - API Endpoints

## Base URL
```
/api/notifications
```

## Endpoints

### 1. Obtener Notificaciones del Usuario

```http
GET /api/notifications
```

**Query Parameters:**
- `page` (number): Página actual (default: 1)
- `limit` (number): Elementos por página (default: 20)
- `type` (string): Filtrar por tipo (info, success, warning, error, system)
- `category` (string): Filtrar por categoría (pedido, cliente, stock, presupuesto, sistema, general)
- `is_read` (boolean): Filtrar por leídas/no leídas
- `priority` (string): Filtrar por prioridad (low, medium, high, urgent)
- `sort` (string): Ordenar por (created_at, priority, type) (default: created_at)
- `order` (string): Orden (asc, desc) (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title": "Nuevo Pedido #123",
        "message": "Se ha creado un nuevo pedido para Juan Pérez",
        "type": "success",
        "category": "pedido",
        "is_read": false,
        "is_archived": false,
        "priority": "medium",
        "action_url": "/pedidos/123",
        "action_text": "Ver Pedido",
        "metadata": {
          "pedido_id": "123",
          "cliente_nombre": "Juan Pérez",
          "total": 1500.00
        },
        "expires_at": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "unread_count": 12
  }
}
```

### 2. Obtener Notificación por ID

```http
GET /api/notifications/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "uuid",
      "title": "Nuevo Pedido #123",
      "message": "Se ha creado un nuevo pedido para Juan Pérez",
      "type": "success",
      "category": "pedido",
      "is_read": false,
      "is_archived": false,
      "priority": "medium",
      "action_url": "/pedidos/123",
      "action_text": "Ver Pedido",
      "metadata": {
        "pedido_id": "123",
        "cliente_nombre": "Juan Pérez",
        "total": 1500.00
      },
      "expires_at": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 3. Marcar Notificación como Leída

```http
PATCH /api/notifications/{id}/read
```

**Response:**
```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

### 4. Marcar Múltiples Notificaciones como Leídas

```http
PATCH /api/notifications/read-multiple
```

**Body:**
```json
{
  "notification_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 notificaciones marcadas como leídas"
}
```

### 5. Marcar Todas las Notificaciones como Leídas

```http
PATCH /api/notifications/read-all
```

**Response:**
```json
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas"
}
```

### 6. Archivar Notificación

```http
PATCH /api/notifications/{id}/archive
```

**Response:**
```json
{
  "success": true,
  "message": "Notificación archivada"
}
```

### 7. Eliminar Notificación

```http
DELETE /api/notifications/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Notificación eliminada"
}
```

### 8. Obtener Configuración de Notificaciones

```http
GET /api/notifications/settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "id": "uuid",
      "user_id": "user_uuid",
      "email_enabled": true,
      "push_enabled": true,
      "sound_enabled": true,
      "sound_on_hover": false,
      "email_info": true,
      "email_success": true,
      "email_warning": true,
      "email_error": true,
      "email_system": true,
      "push_info": true,
      "push_success": true,
      "push_warning": true,
      "push_error": true,
      "push_system": true,
      "email_pedidos": true,
      "email_clientes": true,
      "email_stock": true,
      "email_presupuestos": true,
      "email_sistema": true,
      "push_pedidos": true,
      "push_clientes": true,
      "push_stock": true,
      "push_presupuestos": true,
      "push_sistema": true,
      "digest_frequency": "immediate",
      "quiet_hours_start": "22:00:00",
      "quiet_hours_end": "08:00:00",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 9. Actualizar Configuración de Notificaciones

```http
PUT /api/notifications/settings
```

**Body:**
```json
{
  "email_enabled": true,
  "push_enabled": true,
  "sound_enabled": true,
  "sound_on_hover": false,
  "email_info": true,
  "email_success": true,
  "email_warning": true,
  "email_error": true,
  "email_system": true,
  "push_info": true,
  "push_success": true,
  "push_warning": true,
  "push_error": true,
  "push_system": true,
  "email_pedidos": true,
  "email_clientes": true,
  "email_stock": true,
  "email_presupuestos": true,
  "email_sistema": true,
  "push_pedidos": true,
  "push_clientes": true,
  "push_stock": true,
  "push_presupuestos": true,
  "push_sistema": true,
  "digest_frequency": "immediate",
  "quiet_hours_start": "22:00:00",
  "quiet_hours_end": "08:00:00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuración actualizada correctamente"
}
```

### 10. Crear Notificación (Interno)

```http
POST /api/notifications/create
```

**Body:**
```json
{
  "user_id": "user_uuid",
  "template_name": "pedido_creado",
  "variables": {
    "pedido_id": "123",
    "cliente_nombre": "Juan Pérez",
    "total": 1500.00
  },
  "priority": "medium",
  "action_url": "/pedidos/123",
  "action_text": "Ver Pedido",
  "expires_at": "2024-02-15T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "uuid",
      "title": "Nuevo Pedido #123",
      "message": "Se ha creado un nuevo pedido para Juan Pérez con un total de $1500.00",
      "type": "success",
      "category": "pedido",
      "priority": "medium",
      "action_url": "/pedidos/123",
      "action_text": "Ver Pedido"
    }
  }
}
```

### 11. Obtener Estadísticas de Notificaciones

```http
GET /api/notifications/stats
```

**Query Parameters:**
- `period` (string): Período (today, week, month, year) (default: week)

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 45,
      "unread": 12,
      "archived": 8,
      "by_type": {
        "info": 15,
        "success": 20,
        "warning": 8,
        "error": 2,
        "system": 0
      },
      "by_category": {
        "pedido": 25,
        "cliente": 10,
        "stock": 5,
        "presupuesto": 3,
        "sistema": 2,
        "general": 0
      },
      "by_priority": {
        "low": 10,
        "medium": 25,
        "high": 8,
        "urgent": 2
      }
    }
  }
}
```

## Códigos de Error

```json
{
  "success": false,
  "error": {
    "code": "NOTIFICATION_NOT_FOUND",
    "message": "Notificación no encontrada",
    "details": "La notificación con ID 'uuid' no existe"
  }
}
```

**Códigos de Error Comunes:**
- `NOTIFICATION_NOT_FOUND`: Notificación no encontrada
- `INVALID_NOTIFICATION_DATA`: Datos de notificación inválidos
- `TEMPLATE_NOT_FOUND`: Template de notificación no encontrado
- `USER_NOT_FOUND`: Usuario no encontrado
- `PERMISSION_DENIED`: Sin permisos para acceder a la notificación
- `INVALID_SETTINGS`: Configuración inválida
