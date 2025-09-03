# Sistema de Notificaciones - Estructura de Base de Datos

## Tabla: notifications

```sql
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
```

## Tabla: notification_settings

```sql
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
```

## Tabla: notification_templates

```sql
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

## Ejemplos de Templates

```sql
INSERT INTO notification_templates (name, title_template, message_template, type, category, priority) VALUES
('pedido_creado', 'Nuevo Pedido #{pedido_id}', 'Se ha creado un nuevo pedido para {cliente_nombre} con un total de ${total}', 'success', 'pedido', 'medium'),
('pedido_completado', 'Pedido Completado #{pedido_id}', 'El pedido para {cliente_nombre} ha sido completado exitosamente', 'success', 'pedido', 'medium'),
('stock_bajo', 'Stock Bajo - {producto_nombre}', 'El producto {producto_nombre} tiene stock bajo ({stock_actual} unidades)', 'warning', 'stock', 'high'),
('stock_agotado', 'Stock Agotado - {producto_nombre}', 'El producto {producto_nombre} se ha agotado completamente', 'error', 'stock', 'urgent'),
('cliente_nuevo', 'Nuevo Cliente Registrado', 'Se ha registrado un nuevo cliente: {cliente_nombre}', 'info', 'cliente', 'low'),
('presupuesto_aprobado', 'Presupuesto Aprobado #{presupuesto_id}', 'El presupuesto para {cliente_nombre} ha sido aprobado', 'success', 'presupuesto', 'medium'),
('sistema_mantenimiento', 'Mantenimiento Programado', 'El sistema estará en mantenimiento el {fecha} de {hora_inicio} a {hora_fin}', 'warning', 'sistema', 'high');
```

## Índices Recomendados

```sql
-- Para consultas frecuentes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_category ON notifications(user_id, category);
CREATE INDEX idx_notifications_user_priority ON notifications(user_id, priority);
CREATE INDEX idx_notifications_expired ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Para limpieza automática
CREATE INDEX idx_notifications_old ON notifications(created_at) WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```
