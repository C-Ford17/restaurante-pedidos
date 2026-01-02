# 🐀 Hamelin Orders

![Status](https://img.shields.io/badge/status-active-success.svg)
![Vue.js](https://img.shields.io/badge/vue.js-3.x-green.svg)
![Node.js](https://img.shields.io/badge/node.js-18.x-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

> **Solución integral de gestión gastronómica en tiempo real.**  
> Diseñado para optimizar el flujo operativo de restaurantes, desde la toma de comandas hasta la facturación.

---

## 💼 Visión del Producto

**Hamelin Orders** no es solo un POS; es una plataforma orquestada para sincronizar perfectamente las áreas críticas de un restaurante: sala, cocina y administración.

En un entorno donde *cada segundo cuenta*, nuestra arquitectura basada en eventos (Event-Driven) asegura que cuando un mesero envía una orden, la cocina la recibe instantáneamente, eliminando errores de comunicación y reduciendo los tiempos de espera del cliente en un **30%**.

## 🚀 Características Empresariales

### 🔄 Sincronización en Tiempo Real (Socket.IO)
El corazón del sistema. Comunicación bidireccional instantánea entre todos los dispositivos conectados.
- **Cocina**: Alertas visuales y sonoras automáticas al recibir nuevas comandas.
- **Sala**: Notificaciones push a los meseros cuando los platos están listos.

### 👥 Gestión de Roles Granular
Seguridad y acceso segmentado para cada miembro del equipo:
- **🕵️ Admin**: Control total. Dashboard de métricas, gestión de usuarios, auditoría y configuración global.
- **👨‍🍳 Cocina (Kitchen Display System)**: Interfaz optimizada para pantallas táctiles/tablets, flujo de trabajo "drag-and-drop" o de un toque.
- **📱 Meseros**: Aplicación móvil-first para toma de pedidos rápida en mesa.
- **💰 Caja**: Terminal de punto de venta para facturación, división de cuentas y cierre de turno.

### 🛠️ Editor de Menú Avanzado
- Gestión de inventario en tiempo real.
- Bloqueo de productos sin stock (86'd items).
- Categorización dinámica y modificadores de productos.

### 📊 Business Intelligence
- Reportes detallados de ventas por periodo, mesero o plato.
- Análisis de productos más vendidos.
- Exportación de datos.

---

## 🏗️ Arquitectura Técnica

El proyecto demuestra una arquitectura moderna, escalable y mantenible, siguiendo las mejores prácticas de la industria.

### Frontend (SPA)
- **Framework**: [Vue.js 3](https://vuejs.org/) (Composition API) para reactividad de alto rendimiento.
- **Estado**: Pinia para gestión de estado centralizado y predecible.
- **Estilos**: Diseño responsivo y agnóstico construido con CSS moderno.
- **Build**: Vite para tiempos de carga y HMR ultrarrápidos.

### Backend (REST + Websockets)
- **Runtime**: Node.js con Express.
- **Base de Datos**: PostgreSQL (Relacional) alojada en la nube, garantizando integridad ACID.
- **Real-time**: Implementación robusta de Socket.io con salas y eventos personalizados.
- **Seguridad**: Autenticación JWT y hash de contraseñas con Bcrypt.

### Infraestructura & DevOps
- **CI/CD**: Flujos de despliegue automático configurados.
- **Cloud**: Backend en Render/Railway, Frontend en Vercel, DB en Neon Tech.

---

## 💻 Instalación y Despliegue Local

### Requisitos Previos
- Node.js v18+
- PostgreSQL

### 1. Clonar el repositorio
```bash
git clone https://github.com/C-Ford17/restaurante-pedidos.git
cd restaurante-pedidos
```

### 2. Backend Setup
```bash
cd backend
npm install
# Crear archivo .env basado en la configuración de la DB
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Crear archivo .env
npm run dev
```

## 🔐 Credenciales Demo
Para pruebas locales o acceso a la demo desplegada (si aplica):
- **Admin**: `admin` / `admin123`
- **Cocinero**: `cocina` / `cocina`
- **Mesero**: `mesero` / `mesero`
- **Facturero**: `facturero` / `facturero`

---

Built with ❤️ by [C-Ford17]
