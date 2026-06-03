# Documento de Descripción del Sistema – JaveCupos

---

## 1. Información General del Proyecto

| Campo | Detalle |
|---|---|
| **Nombre del software** | JaveCupos |
| **Tipo de sistema** | Plataforma de carpooling universitario (PWA – Progressive Web App) |
| **Integrantes del equipo** | Santiago Carvajal, Isabella Ramírez, Nicolás Cuastumal |
| **Programa académico** | Ingeniería de Sistemas – Pontificia Universidad Javeriana Cali |
| **URL del repositorio** | https://github.com/NicolasCuastumalCordoba/Pplataformas_n |
| **URL de la aplicación** | Ejecutar localmente con Live Server en `http://localhost:5501/index.html` |
| **URL de la web** | https://pplataformas-n.vercel.app |
| **Versión actual** | 4.0 |
| **Fecha de elaboración** | 2026-05-13 |

---

## 2. Descripción del Sistema

### 2.1 ¿Qué problema resuelve el software?

JaveCupos aborda la problemática de movilidad que enfrentan los estudiantes y docentes de la Pontificia Universidad Javeriana Cali. Muchos miembros de la comunidad universitaria realizan trayectos similares desde y hacia el campus, pero lo hacen en vehículos individuales, generando:

- Alto costo de transporte para estudiantes.
- Congestión vehicular en los accesos al campus.
- Huella de carbono innecesaria por uso individual del automóvil.
- Dificultad para coordinar viajes compartidos sin una plataforma centralizada.

JaveCupos proporciona un espacio digital donde conductores ofrecen puestos disponibles en sus vehículos y pasajeros los reservan, conectando a la comunidad javeriana de forma segura, sencilla y en tiempo real.

### 2.2 ¿Quiénes son los usuarios del sistema?

El sistema contempla tres roles de usuario:

| Rol | Descripción |
|---|---|
| **Pasajero** | Miembro de la comunidad PUJ que busca y reserva cupos en viajes publicados. Puede ver viajes disponibles, filtrar por origen/destino, reservar y cancelar su reserva. |
| **Conductor** | Miembro de la comunidad PUJ que posee vehículo propio. Puede publicar viajes con ruta, horario, precio y cupos disponibles; marcar viajes como completados o cancelarlos. |
| **Administrador** | Rol con permisos extendidos para gestión de la plataforma (contemplado en el modelo de datos, en expansión futura). |

Un mismo usuario puede cambiar su rol entre Pasajero y Conductor desde su perfil en cualquier momento.

### 2.3 ¿Qué valor ofrece la aplicación?

| Valor | Descripción |
|---|---|
| **Ahorro económico** | Pasajeros comparten el costo del combustible con el conductor. |
| **Comodidad** | Interfaz móvil intuitiva con actualización en tiempo real de viajes disponibles. |
| **Sostenibilidad** | Reducción de vehículos en circulación, disminuyendo emisiones de CO₂. |
| **Comunidad** | Exclusivo para miembros PUJ Cali, generando confianza entre usuarios. |
| **Disponibilidad** | Funciona como PWA instalable, con soporte offline para activos estáticos. |

---

## 3. Funcionalidades del Sistema

### 3.1 Funcionalidades con lógica de negocio (No CRUD)

> Estas tres funcionalidades superan el requisito mínimo del curso (al menos 3 funcionalidades con lógica de negocio).

#### F1 – Búsqueda y filtrado en tiempo real de viajes
- El sistema filtra dinámicamente los viajes disponibles a medida que el usuario escribe en el campo de búsqueda.
- La lógica evalúa simultáneamente origen y destino (búsqueda case-insensitive).
- Solo muestra viajes con estado `pending` y fecha mayor o igual a hoy.
- Utiliza listeners de Firestore (`onSnapshot`) para actualizar la lista sin recargar la página.

#### F2 – Gestión de cupos y estado de reserva
- Al reservar un viaje, el sistema decrementa `availableSeats` y agrega el `uid` del pasajero al arreglo `passengers[]`.
- Valida que el usuario no haya reservado ya el mismo viaje.
- Valida que el conductor no pueda reservar su propio viaje.
- Cuando `availableSeats === 0`, el viaje cambia de estado visual a "Lleno" y bloquea nuevas reservas.
- Al cancelar una reserva, el sistema incrementa `availableSeats` y elimina el pasajero del arreglo.

#### F3 – Flujo de estados del viaje
- Un viaje atraviesa un ciclo de vida controlado: `pending` → `completed` / `canceled`.
- Solo el conductor dueño del viaje puede marcarlo como completado o cancelarlo.
- Las transiciones de estado están protegidas por validaciones de rol y propiedad.
- El cambio de estado afecta la visibilidad del viaje en las listas (los viajes completados/cancelados no aparecen en la búsqueda general).

### 3.2 Operaciones CRUD (complementarias)

| Operación | Descripción |
|---|---|
| Crear usuario | Registro con email, contraseña, nombre y rol. |
| Leer usuarios | Consulta de perfil propio desde Firestore. |
| Actualizar rol | Cambio de rol pasajero ↔ conductor. |
| Crear viaje | Publicación de nuevo viaje por conductor. |
| Leer viajes | Listado de viajes disponibles, propios y reservados. |
| Cancelar / completar viaje | Actualización de estado del viaje. |

---

## 4. Arquitectura Técnica

### 4.1 Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript ES Modules |
| **Backend / BaaS** | Firebase (Firestore + Authentication) |
| **Patrón de UI** | SPA (Single Page Application) con navegación por tabs |
| **PWA** | Service Worker, Web App Manifest, caché estático |
| **Almacenamiento local** | localStorage (tema oscuro/claro) |

### 4.2 Estructura de archivos

```
Pplataformas_n-main/
├── index.html              # Shell de la SPA
├── manifest.json           # Configuración PWA
├── sw.js                   # Service Worker (caché)
├── css/
│   └── style.css           # Estilos globales + sistema de temas
├── js/
│   ├── firebase-config.js  # Inicialización Firebase
│   ├── auth.js             # Módulo de autenticación
│   ├── rides.js            # Módulo de gestión de viajes
│   ├── ui.js               # Utilidades de UI (toast, modal, cards)
│   └── app.js              # Controlador principal de la SPA
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── docs/                   # Documentación del proyecto (entregables del curso)
└── tests/                  # Pruebas automatizadas con Playwright
```

### 4.3 Modelo de datos (Firestore)

**Colección `users`:**
```
{
  uid: string,
  name: string,
  email: string,
  role: "passenger" | "driver" | "admin",
  createdAt: timestamp
}
```

**Colección `rides`:**
```
{
  origin: string,
  destination: string,
  date: string (YYYY-MM-DD),
  time: string (HH:MM),
  price: number,
  seats: number,
  availableSeats: number,
  status: "pending" | "completed" | "canceled",
  createdBy: string (uid),
  driverName: string,
  driverEmail: string,
  passengers: string[] (array de uid),
  description: string,
  createdAt: timestamp
}
```

---

## 5. Requisitos del Entorno de Ejecución

| Requisito | Detalle |
|---|---|
| Navegador moderno | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| Editor recomendado | Visual Studio Code con extensión Live Server |
| Puerto de ejecución | `5501` (configurado en `.vscode/settings.json`) |
| Conexión a internet | Requerida para Firebase (Auth + Firestore) |
| Node.js | v18+ (requerido para pruebas Playwright) |

---

## 6. Instrucciones de Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/NicolasCuastumalCordoba/Pplataformas_n
cd Pplataformas_n-main

# 2. Abrir en VS Code
code .

# 3. Instalar Live Server (si no está instalado)
# Extensions → buscar "Live Server" → Install

# 4. Iniciar la aplicación
# Clic derecho en index.html → "Open with Live Server"
# O presionar Alt+L Alt+O

# 5. Instalar dependencias de pruebas (Playwright)
npm install
npx playwright install chromium
```

---

*Documento elaborado para el curso Modelado, Verificación y Pruebas – PUJ Cali, 2026.*
