# JaveCupos 🚗

> **Sistema de Carpooling Universitario – Pontificia Universidad Javeriana Cali**  
> Progressive Web App (PWA) · Firebase · Playwright · v4.0

[![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow)](https://github.com/NicolasCuastumalCordoba/Pplataformas_n)
[![Licencia](https://img.shields.io/badge/licencia-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org)
[![Playwright](https://img.shields.io/badge/playwright-1.44+-purple)](https://playwright.dev)

---

## ¿Qué es JaveCupos?

JaveCupos es una plataforma web de carpooling exclusiva para la comunidad de la Pontificia Universidad Javeriana Cali. Conecta **conductores** que ofrecen puestos en su vehículo con **pasajeros** que necesitan transporte hacia o desde el campus, reduciendo costos de movilidad, descongestión vehicular y emisiones de CO₂.

La aplicación corre como **PWA instalable**, con interfaz estilo aplicación móvil, modo oscuro/claro persistente, y sincronización en tiempo real a través de Firebase Firestore.

🌐 **Demo desplegada:** [pplataformas-n.vercel.app](https://pplataformas-n.vercel.app)  
📁 **Repositorio:** [github.com/NicolasCuastumalCordoba/Pplataformas_n](https://github.com/NicolasCuastumalCordoba/Pplataformas_n)

---

## Tabla de contenidos

1. [Funcionalidades](#funcionalidades)
2. [Roles de usuario](#roles-de-usuario)
3. [Arquitectura y stack técnico](#arquitectura-y-stack-técnico)
4. [Modelo de datos (Firestore)](#modelo-de-datos-firestore)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Instalación y ejecución local](#instalación-y-ejecución-local)
7. [Pruebas automatizadas con Playwright](#pruebas-automatizadas-con-playwright)
8. [Resultados de pruebas](#resultados-de-pruebas)
9. [Defectos conocidos](#defectos-conocidos)
10. [Documentación del curso](#documentación-del-curso)
11. [Autores](#autores)

---

## Funcionalidades

### Funcionalidades con lógica de negocio

**F1 – Búsqueda y filtrado en tiempo real**  
El campo de búsqueda filtra dinámicamente los viajes disponibles evaluando simultáneamente origen y destino (case-insensitive). Solo muestra viajes con estado `pending` y fecha mayor o igual al día actual. Usa listeners `onSnapshot` de Firestore para actualizarse sin recargar la página.

**F2 – Gestión de cupos y reservas**  
Al reservar, se decrementa `availableSeats` y se agrega el `uid` del pasajero al arreglo `passengers[]`. El sistema valida que el usuario no haya reservado ya el viaje, que el conductor no pueda reservar su propio viaje, y que no haya cupos disponibles iguales a 0. Al cancelar la reserva, el proceso se revierte atómicamente.

**F3 – Flujo de estados del viaje**  
Un viaje recorre el ciclo `pending → completed / canceled`. Solo el conductor dueño puede marcarlo como completado o cancelarlo. Los viajes en estado `completed` o `canceled` desaparecen automáticamente de la búsqueda general.

### Operaciones CRUD complementarias

| Operación | Descripción |
|---|---|
| Registro de usuario | Email, contraseña, nombre y rol inicial |
| Perfil de usuario | Consulta y actualización desde Firestore |
| Cambio de rol | Pasajero ↔ Conductor desde el perfil |
| Publicar viaje | Origen, destino, fecha, hora, precio y cupos |
| Listar viajes | Disponibles, propios y reservados |
| Cancelar / completar viaje | Cambio de estado con validaciones de rol |

### Características adicionales de la PWA

- Pantalla splash animada al iniciar
- Modo claro/oscuro con persistencia en `localStorage`
- Service Worker para cacheo de activos estáticos
- Instalable desde Chrome/Edge como app nativa
- Diseño responsive adaptado a móvil y escritorio

---

## Roles de usuario

| Rol | Capacidades |
|---|---|
| **Pasajero** | Buscar viajes, filtrar por origen/destino, reservar, cancelar reserva |
| **Conductor** | Publicar viajes, completar viaje, cancelar viaje, ver sus pasajeros |
| **Administrador** | Gestión extendida de la plataforma *(en desarrollo futuro)* |

> Un mismo usuario puede cambiar entre Pasajero y Conductor desde su pantalla de perfil en cualquier momento.

---

## Arquitectura y stack técnico

```
┌─────────────────────────────────────────────────────┐
│                  NAVEGADOR / PWA                    │
│                                                     │
│  index.html  ←→  app.js  ←→  auth.js               │
│       ↕               ↕           ↕                 │
│  style.css        rides.js     ui.js                │
│       ↕               ↕                             │
│  Service Worker   firebase-config.js                │
│  (sw.js)               ↕                            │
└───────────────────────────────────────────────────── │
                          ↕
              ┌───────────────────────┐
              │       FIREBASE        │
              │  ├── Authentication   │
              │  └── Firestore DB     │
              └───────────────────────┘
```

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript ES Modules |
| Backend / BaaS | Firebase 11.0.0 (Firestore + Auth) |
| Patrón de UI | SPA con navegación por tabs |
| PWA | Service Worker + Web App Manifest |
| Almacenamiento local | `localStorage` (tema oscuro/claro) |
| Testing | Playwright 1.44+ (E2E automatizado) |

---

## Modelo de datos (Firestore)

### Colección `users`

```json
{
  "uid": "string",
  "name": "string",
  "email": "string",
  "role": "passenger | driver | admin",
  "createdAt": "timestamp"
}
```

### Colección `rides`

```json
{
  "origin": "string",
  "destination": "string",
  "date": "string (YYYY-MM-DD)",
  "time": "string (HH:MM)",
  "price": "number",
  "seats": "number",
  "availableSeats": "number",
  "status": "pending | completed | canceled",
  "createdBy": "string (uid del conductor)",
  "driverName": "string",
  "driverEmail": "string",
  "passengers": "string[] (array de uid)",
  "description": "string",
  "createdAt": "timestamp"
}
```

---

## Estructura del proyecto

```
Pplataformas_n-main/
│
├── index.html              # Shell de la SPA (contiene todos los "screens" ocultos)
├── manifest.json           # Configuración de la PWA (nombre, iconos, colores)
├── sw.js                   # Service Worker: caché de activos estáticos
├── package.json            # Dependencias de desarrollo (Playwright)
├── playwright.config.js    # Configuración de Playwright (baseURL, timeouts, browser)
│
├── css/
│   └── style.css           # Estilos globales, sistema de temas claro/oscuro, animaciones
│
├── js/
│   ├── firebase-config.js  # Inicialización de Firebase (app, db, auth)
│   ├── auth.js             # Login, registro, logout con Firebase Auth
│   ├── rides.js            # Lógica de negocio: bookRide, cancelBooking,
│   │                       # createRide, completeRide, cancelRide, getAvailableRides
│   ├── ui.js               # Utilidades de UI: toasts, modales, render de ride-cards
│   └── app.js              # Controlador principal: navegación SPA, listeners de eventos
│
├── icons/
│   ├── icon-192.png        # Ícono PWA 192×192
│   └── icon-512.png        # Ícono PWA 512×512
│
├── docs/                   # Documentación académica del proyecto
│   ├── 01_descripcion_sistema.md
│   ├── 02_plan_de_pruebas.md
│   ├── 03_diseno_pruebas.md
│   ├── 04_ejecucion_pruebas.md
│   └── 05_inteligencia_artificial.md
│
├── tests/                  # Suites de pruebas automatizadas con Playwright
│   ├── auth.spec.js        # TC-AUTH-001 a TC-AUTH-006
│   ├── rides.spec.js       # TC-SEARCH, TC-BOOK, TC-RIDE
│   └── profile.spec.js     # TC-PROFILE-001 a TC-PROFILE-003
│
├── playwright-report/      # Reporte HTML generado por Playwright (auto-generado)
└── test-results/           # Artefactos de pruebas fallidas: capturas, videos (auto-generado)
```

---

## Instalación y ejecución local

### Requisitos previos

- [Visual Studio Code](https://code.visualstudio.com/) con la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- [Node.js](https://nodejs.org/) v18 o superior (solo para pruebas con Playwright)
- Navegador moderno: Chrome 90+, Firefox 88+, Edge 90+ o Safari 14+
- Conexión a internet (requerida para Firebase Auth y Firestore)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/NicolasCuastumalCordoba/Pplataformas_n.git
cd Pplataformas_n-main

# 2. Abrir en VS Code
code .
```

Luego, iniciar la aplicación con Live Server:
- Clic derecho sobre `index.html` → **"Open with Live Server"**
- O usar el atajo `Alt+L` `Alt+O`

> ⚠️ **Importante:** La aplicación debe correr en `http://127.0.0.1:5501` (puerto configurado en `.vscode/settings.json`). Cualquier otro puerto hará que las pruebas de Playwright fallen porque `playwright.config.js` apunta a ese `baseURL`.

---

## Pruebas automatizadas con Playwright

Las pruebas cubren los módulos de Autenticación, Búsqueda, Reservas, Gestión de viajes y Perfil. Se ejecutan contra la app corriendo localmente con Live Server.

### Instalación de dependencias de testing

```bash
npm install
npx playwright install chromium
```

### Cuentas de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Pasajero | `pasajero_test@javerianacali.edu.co` | `Test1234!` |
| Conductor | `conductor_test@javerianacali.edu.co` | `Test1234!` |

> Estas cuentas deben existir previamente en el proyecto Firebase configurado en `firebase-config.js`.

### Comandos disponibles

```bash
# Ejecutar todas las pruebas (headless)
npm test

# Ejecutar con el navegador visible
npm run test:headed

# Abrir la interfaz gráfica de Playwright
npm run test:ui

# Ver el reporte HTML de la última ejecución
npm run test:report

# Ejecutar solo un módulo específico
npm run test:auth
npm run test:rides
npm run test:profile
```

### Configuración de Playwright (`playwright.config.js`)

| Parámetro | Valor | Descripción |
|---|---|---|
| `baseURL` | `http://127.0.0.1:5501` | URL de Live Server |
| `headless` | `false` | Corre con navegador visible |
| `timeout` | 60 000 ms | Timeout global por test |
| `actionTimeout` | 20 000 ms | Timeout por acción/click |
| `video` | `retain-on-failure` | Graba video solo en fallos |
| `screenshot` | `only-on-failure` | Captura pantalla en fallos |
| `workers` | 1 | Tests en serie (no paralelo) |
| `browser` | Chromium | Único navegador configurado |

### Estructura de los tests

Cada suite reutiliza funciones helper que simplifican el setup:

```javascript
// Helper compartido: esperar que la pantalla de login esté lista
async function waitForLoginScreen(page) { ... }

// Helper compartido: iniciar sesión con email y contraseña
async function loginAs(page, email, password) { ... }

// Helper de rides.spec.js: navegar a búsqueda de viajes
async function navigateToSearch(page) { ... }

// Helper de profile.spec.js: navegar al perfil
async function navigateToProfile(page) { ... }
```

Los tests esperan tiempos generosos (`waitForTimeout`) para absorber la latencia de Firebase Auth, que es asíncrona y usa WebSockets/gRPC, no peticiones HTTP convencionales.

---

## Resultados de pruebas

Ejecución realizada el **13 de mayo de 2026** sobre JaveCupos v4.0, ambiente local.

| Métrica | Valor |
|---|---|
| Total de casos ejecutados | 29 |
| ✅ PASS | 24 |
| ❌ FAIL | 4 |
| ⚠️ BLOQUEADOS | 1 |
| **Porcentaje de éxito** | **82.76%** |
| Defectos encontrados | 4 (1 crítico, 2 mayores, 1 menor) |

### Resumen por módulo

| Módulo | Casos | PASS | FAIL |
|---|---|---|---|
| Autenticación (TC-AUTH) | 6 | 5 | 1 |
| Búsqueda (TC-SEARCH) | 3 | 3 | 0 |
| Reservas (TC-BOOK) | 3 | 2 | 1 |
| Gestión de viajes conductor (TC-RIDE) | 4 | 3 | 1 |
| Perfil de usuario (TC-PROFILE) | 3 | 3 | 0 |
| Caja blanca (CB) | 10 | 8 | 1 + 1 bloq. |

---

## Defectos conocidos

| ID | Severidad | Módulo | Descripción |
|---|---|---|---|
| DEF-001 | Mayor | Auth | No hay validación de formato de email en el frontend antes de llamar a Firebase. El error que retorna Firebase es genérico e insuficiente para el usuario. |
| DEF-002 | Mayor | Reservas | Al cancelar una reserva, `availableSeats` se actualiza correctamente en Firestore, pero la UI no refleja el cambio sin navegar manualmente. |
| DEF-003 | Crítico | Gestión viajes | El sistema permite publicar viajes con precio `$0`. No existe validación en el frontend para precio > 0. |
| DEF-004 | Menor | Búsqueda | La comparación de fechas en `getAvailableRides` usa strings. Si la fecha está en formato `YYYY-M-D` en lugar de `YYYY-MM-DD` (sin padding de ceros), la comparación lexicográfica falla y viajes pasados pueden aparecer como disponibles. |

---

## Documentación del curso

Este proyecto es un entregable del curso **Modelado, Verificación y Pruebas** (Ingeniería de Sistemas – PUJ Cali, 2026). La carpeta `docs/` contiene la documentación completa:

| Archivo | Contenido |
|---|---|
| `01_descripcion_sistema.md` | Descripción técnica del sistema, arquitectura, modelo de datos y requisitos del entorno |
| `02_plan_de_pruebas.md` | Plan de pruebas: alcance, estrategia (BDD + caja negra + caja blanca), criterios de entrada/salida |
| `03_diseno_pruebas.md` | Diseño detallado de los 29 casos de prueba con precondiciones, pasos y resultados esperados |
| `04_ejecucion_pruebas.md` | Reporte de ejecución real: resultados por caso, hallazgos y ficha de cada defecto |
| `05_inteligencia_artificial.md` | Análisis del uso de IA (Claude, ChatGPT) en el proyecto: beneficios, limitaciones y lecciones aprendidas |

---

## Autores

| Nombre | Rol |
|---|---|
| Santiago Carvajal | Desarrollador / Tester |
| Isabella Ramírez | Desarrolladora / Tester |
| Nicolás Cuastumal | Desarrollador / Tester |

Estudiantes de Ingeniería en Sistemas y Computación  
Pontificia Universidad Javeriana Cali · 2026

---

*Proyecto académico desarrollado para el curso Modelado, Verificación y Pruebas – PUJ Cali.*
