# cortinova-sistema

Sistema de *Gestion de Stock* y *Control de Precios* para la empresa *Cortinova*, dedicado al rubro de cortinería y decoración de interiores. 
Proyecto realizado en Nextjs con Node js + Express. 
 
# Proyecto de Next.js con Node.js y MySQL

Este proyecto combina un frontend construido con Next.js y un backend desarrollado con Node.js, utilizando MySQL como base de datos. A continuación, encontrarás las instrucciones para instalar, configurar y ejecutar el proyecto en un entorno local.

---

## Requisitos previos

1. **Node.js**: Asegúrate de tener instalada la versión LTS más reciente de Node.js.
   - [Descargar Node.js](https://nodejs.org/)
2. **MySQL**: Asegúrate de tener MySQL instalado y en ejecución en tu máquina.
   - [Descargar MySQL](https://dev.mysql.com/downloads/installer/)
3. **Git**: Necesario para clonar el repositorio.
   - [Descargar Git](https://git-scm.com/)

---

## Instalación

### 1. Clonar el repositorio

```bash
# Clona este repositorio en tu máquina local
git clone https://github.com/tu-usuario/tu-repositorio.git

# Navega al directorio del proyecto
cd tu-repositorio
```

### 2. Instalar dependencias

#### Frontend (Next.js)
```bash
cd frontend
npm install
```

#### Backend (Node.js)
```bash
cd backend
npm install
```

---

## Configuración

### 1. Variables de entorno

Crea los archivos `.env` en las carpetas `frontend` y `backend` con la configuración necesaria.

#### **Frontend (`frontend/.env`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

#### **Backend (`backend/.env`):**
```env
PORT=8080
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_de_la_base_de_datos
JWT_SECRET=una_clave_secreta
```

### 2. Configurar la base de datos

1. Inicia sesión en MySQL:
   ```bash
   mysql -u tu_usuario -p
   ```
2. Crea la base de datos:
   ```sql
   CREATE DATABASE nombre_de_la_base_de_datos;
   ```
3. (Opcional) Importa un archivo de estructura o datos si está incluido:
   ```bash
   mysql -u tu_usuario -p nombre_de_la_base_de_datos < ruta/al/archivo.sql
   ```

---

## Ejecución

### 1. Iniciar el backend

```bash
cd backend
npm run dev
```
El backend estará disponible en: `http://localhost:8080`

### 2. Iniciar el frontend

En otra terminal, ejecuta:

```bash
cd frontend
npm run dev
```
El frontend estará disponible en: `http://localhost:3000`

---

## Estructura del proyecto

```
raiz-del-proyecto/
├── backend/         # Código del backend con Node.js y Express
├── frontend/        # Código del frontend con Next.js
├── README.md        # Documentación del proyecto
```

---

## Scripts disponibles

### Backend
- `npm run dev`: Inicia el servidor en modo desarrollo.
- `npm run build`: Construye el servidor para producción.
- `npm start`: Inicia el servidor en modo producción.

### Frontend
- `npm run dev`: Inicia el servidor de desarrollo de Next.js.
- `npm run build`: Construye el proyecto para producción.
- `npm start`: Sirve la aplicación construida.

---

## Contribución

1. Crea un fork del repositorio.
2. Crea una nueva rama:
   ```bash
   git checkout -b nombre-de-tu-rama
   ```
3. Realiza tus cambios y haz un commit:
   ```bash
   git commit -m "Descripción de tus cambios"
   ```
4. Haz un push a la rama:
   ```bash
   git push origin nombre-de-tu-rama
   ```
5. Abre un Pull Request.

---

## Licencia

Este proyecto está bajo la licencia [MIT](./LICENSE).
