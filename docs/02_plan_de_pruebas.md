# Plan de Pruebas – JaveCupos

---

## 1. Nombre del Requerimiento

**Plan de Pruebas para el Sistema JaveCupos**  
Sistema Inteligente de Carpooling Universitario – Pontificia Universidad Javeriana Cali

---

## 2. Fecha de Elaboración

| Campo | Valor |
|---|---|
| Fecha de elaboración | 13 de mayo de 2026 |
| Versión del plan | 1.0 |
| Versión del sistema bajo prueba | JaveCupos v4.0 |

---

## 3. Control de Cambios

| Versión | Fecha | Autor | Descripción del cambio |
|---|---|---|---|
| 1.0 | 2026-05-13 | Santiago Carvajal / Isabella Ramírez / Nicolás Cuastumal | Creación inicial del plan de pruebas |

---

## 4. Contexto Funcional

JaveCupos es una Progressive Web App (PWA) de carpooling desarrollada para la comunidad de la Pontificia Universidad Javeriana Cali. La aplicación conecta conductores que ofrecen cupos en sus vehículos con pasajeros que necesitan transporte hacia o desde el campus.

**Módulos principales bajo prueba:**

| Módulo | Descripción |
|---|---|
| **Autenticación** | Registro, inicio de sesión y cierre de sesión con Firebase Auth. |
| **Búsqueda de viajes** | Filtrado en tiempo real de viajes disponibles por origen/destino. |
| **Reserva de viajes** | Lógica de gestión de cupos, validaciones de reserva y cancelación. |
| **Gestión de viajes (conductor)** | Publicación, completar y cancelar viajes. |
| **Perfil de usuario** | Cambio de rol, modo oscuro y cierre de sesión. |

**Funcionalidades con lógica de negocio (no CRUD) a validar:**
1. Búsqueda y filtrado en tiempo real de viajes (F1).
2. Gestión de cupos y estado de reserva (F2).
3. Flujo de estados del viaje: pending → completed / canceled (F3).

---

## 5. Alcance de las Pruebas

### 5.1 Dentro del alcance

- Pruebas funcionales de caja negra sobre los módulos de Autenticación, Búsqueda, Reserva, Gestión de viajes y Perfil.
- Pruebas de caja blanca sobre las funciones críticas: `bookRide`, `cancelBooking`, `createRide`, `completeRide`, `cancelRide`, `getAvailableRides`.
- Pruebas automatizadas E2E con Playwright sobre los casos de caja negra diseñados.
- Validación de flujos happy path y casos de error / frontera.

### 5.2 Fuera del alcance

- Pruebas de seguridad de Firestore Security Rules (requieren acceso a Firebase Console).
- Pruebas de rendimiento a escala (más de 1000 usuarios concurrentes).
- Pruebas de compatibilidad en navegadores Safari / dispositivos iOS físicos.
- Módulo de administrador (en desarrollo futuro).
- Pruebas de integración con APIs de mapas (Google Maps, solo visualización).

---

## 6. Estrategia de Pruebas

### 6.1 Metodología a trabajar

Se aplicará la metodología **BDD (Behavior Driven Development)** para la descripción de escenarios y **Caja Negra** para el diseño de casos de prueba, utilizando las técnicas:

- **Partición de equivalencia:** Agrupar entradas en clases válidas e inválidas.
- **Análisis de valores límite:** Evaluar los extremos de rangos (ej: 0 cupos, 8 cupos, precio $0).
- **Tabla de decisión:** Para flujos con múltiples condiciones (ej: reservar viaje).

Para pruebas de caja blanca se usará el análisis de **cobertura de sentencias y cobertura de ramas** sobre los módulos JavaScript del proyecto.

### 6.2 Ambientes – Datos – Accesos

| Ambiente | Descripción |
|---|---|
| **Ambiente de desarrollo** | Local en `http://localhost:5501` con servidor HTTP local (ejecutar `npm start`) |
| **Base de datos de pruebas** | Proyecto Firebase "pplataformas" (instancia de prueba/producción compartida) |
| **Navegador** | Google Chrome v124+ (principal), Firefox v125+ (secundario) |
| **Sistema operativo** | Windows 10/11 |
| **Node.js** | v18+ (requerido para ejecutar Playwright y el servidor) |

**Cómo ejecutar las pruebas:**

1. **Iniciar el servidor local:**
   ```bash
   npm start
   ```
   Esto inicia un servidor HTTP en `http://localhost:5501` sirviendo los archivos de la aplicación.

2. **Ejecutar las pruebas (en otra terminal):**
   ```bash
   npm test                    # Ejecutar todas las pruebas
   npm run test:headed         # Ejecutar con navegador visible
   npm run test:auth           # Solo pruebas de autenticación
   npm run test:rides          # Solo pruebas de viajes
   npm run test:profile        # Solo pruebas de perfil
   npm run test:ui             # Interfaz interactiva de Playwright
   ```

3. **Ver reporte de resultados:**
   ```bash
   npm run test:report
   ```

**Datos de prueba:**

| Tipo | Dato |
|---|---|
| Usuario conductor de prueba | `conductor_test@javerianacali.edu.co` / `Test1234!` |
| Usuario pasajero de prueba | `pasajero_test@javerianacali.edu.co` / `Test1234!` |
| Viaje de prueba | Origen: "Campus PUJ", Destino: "Centro Cali", Precio: $5000, Cupos: 3 |

> **Nota:** Los datos de prueba se crean manualmente en Firebase antes de ejecutar las pruebas automatizadas, o mediante scripts de setup en Playwright (`globalSetup`).

**Accesos requeridos:**
- Acceso a Firebase Console (solo para configuración inicial).
- Credenciales de cuentas de prueba.
- Node.js v18+ instalado para ejecutar Playwright.

### 6.3 Estimación de Tiempos

| Actividad | Duración estimada | Responsable |
|---|---|---|
| Diseño de casos de prueba (caja negra) | 4 horas | Isabella Ramírez |
| Diseño de casos de prueba (caja blanca) | 3 horas | Nicolás Cuastumal |
| Implementación de pruebas Playwright | 6 horas | Santiago Carvajal |
| Ejecución de pruebas manuales | 3 horas | Todo el equipo |
| Registro de hallazgos y defectos | 2 horas | Isabella Ramírez |
| Sección de Inteligencia Artificial | 2 horas | Nicolás Cuastumal |
| **Total estimado** | **20 horas** | |

### 6.4 Conformación del Equipo QA – Roles

| Nombre | Rol QA | Responsabilidades |
|---|---|---|
| **Santiago Carvajal** | QA Lead / Automatizador | Coordinación del plan, implementación de pruebas Playwright, revisión de resultados. |
| **Isabella Ramírez** | Diseñadora de Pruebas | Diseño de casos de prueba caja negra, registro de hallazgos y defectos. |
| **Nicolás Cuastumal** | Analista de Caja Blanca / IA | Análisis de código, diseño de pruebas caja blanca, sección de IA. |

### 6.5 Tipos de Pruebas

| Tipo de Prueba | Descripción | Aplicación en JaveCupos |
|---|---|---|
| **Pruebas funcionales (caja negra)** | Verifican el comportamiento del sistema desde la perspectiva del usuario, sin conocer la implementación interna. | Flujos de login, registro, búsqueda, reserva, creación de viajes, gestión de perfil. |
| **Pruebas estructurales (caja blanca)** | Evalúan la lógica interna del código, rutas de ejecución, condiciones y bucles. | Funciones en `rides.js` y `auth.js`: validaciones, flujos de estado, manejo de errores. |
| **Pruebas automatizadas E2E** | Simulan la interacción completa del usuario con el sistema a través del navegador. | Playwright automatiza los casos de caja negra en Chrome. |
| **Pruebas de regresión** | Verifican que cambios en el código no rompan funcionalidades existentes. | Se ejecutan las pruebas automatizadas ante cada cambio significativo. |

### 6.6 Niveles de Pruebas

| Nivel | Descripción | Aplicación |
|---|---|---|
| **Pruebas unitarias** | Verificación de funciones individuales de forma aislada. | Funciones `parseError`, `formatDate`, `badgeHtml` en módulos JS. |
| **Pruebas de integración** | Verificación de la interacción entre módulos. | Integración `auth.js` ↔ Firebase Auth, `rides.js` ↔ Firestore. |
| **Pruebas de sistema (E2E)** | Verificación del sistema completo desde la interfaz de usuario. | Playwright ejecuta flujos completos: login → búsqueda → reserva → cancelación. |
| **Pruebas de aceptación** | Verificación de que el sistema cumple los requisitos del usuario. | Validación con criterios de aceptación definidos en los casos de prueba. |

### 6.7 Riesgos vs Planes de Acción de Mitigación

| ID | Riesgo | Probabilidad | Impacto | Plan de Mitigación |
|---|---|---|---|---|
| R01 | Inestabilidad de la conexión a Firebase durante las pruebas | Media | Alto | Ejecutar pruebas en red estable; usar datos cacheados para pruebas offline. |
| R02 | Cambios en la estructura de Firestore que invaliden los tests | Baja | Alto | Versionar el esquema de datos; actualizar tests ante cambios de modelo. |
| R03 | Timeouts en Playwright por carga lenta de Firebase | Media | Medio | Configurar timeouts de 10s en Playwright; usar `waitForSelector` explícitos. |
| R04 | Datos de prueba contaminados (viajes/usuarios residuales) | Alta | Medio | Script de limpieza de datos antes de cada ejecución de pruebas. |
| R05 | Diferencias de comportamiento entre Chrome y Firefox | Baja | Bajo | Ejecutar suite principal en Chrome; prueba de humo en Firefox. |
| R06 | Firebase Auth bloquea registros masivos de prueba | Media | Medio | Usar cuentas de prueba pre-creadas; evitar crear cuentas en cada ejecución. |

### 6.8 Aplicaciones Impactadas / De Consulta

| Aplicación | Tipo | Rol en las pruebas |
|---|---|---|
| **Firebase Authentication** | Servicio externo | Manejo de identidad de usuarios bajo prueba. |
| **Firebase Firestore** | Servicio externo | Base de datos donde se almacenan y consultan viajes y perfiles. |
| **Google Maps (embed)** | Servicio externo | Solo visualización, no se prueba funcionalidad del mapa. |
| **Google Chrome** | Navegador | Ambiente principal de ejecución de pruebas Playwright. |
| **VS Code Live Server** | Herramienta de desarrollo | Servidor local para servir la aplicación durante las pruebas. |

### 6.9 Esquema de Automatización

```
tests/
├── playwright.config.js       # Configuración global: baseURL, timeouts, browsers
├── auth.spec.js               # Tests E2E: Login, Registro, Logout
├── rides.spec.js              # Tests E2E: Búsqueda, Reserva, Creación de viajes
└── profile.spec.js            # Tests E2E: Cambio de rol, modo oscuro, cierre de sesión
```

**Flujo de ejecución automatizada:**
1. Live Server sirve la app en `http://localhost:5501`.
2. Playwright lanza Chrome en modo headless.
3. Cada spec file ejecuta sus tests de forma independiente.
4. Los resultados se exportan en formato HTML (`playwright-report/`).

### 6.10 Herramientas a Utilizar

| Herramienta | Versión | Uso |
|---|---|---|
| **Playwright** | ^1.44.0 | Framework de automatización E2E |
| **http-server** | latest | Servidor HTTP local para servir la aplicación en puerto 5501 |
| **Node.js** | v18+ | Runtime para ejecutar Playwright y http-server |
| **Google Chrome** | 124+ | Navegador de ejecución para pruebas Playwright |
| **VS Code** | 1.89+ | IDE de desarrollo |
| **Firebase Console** | Web | Gestión de datos de prueba |
| **Git** | 2.40+ | Control de versiones |

### 6.11 Roadmap de Trabajo

| Semana | Actividad |
|---|---|
| Semana 1 | Análisis del sistema, identificación de funcionalidades, diseño de casos de prueba caja negra |
| Semana 2 | Diseño de casos de prueba caja blanca, análisis de cobertura de código |
| Semana 3 | Implementación de pruebas automatizadas con Playwright |
| Semana 4 | Ejecución de pruebas (manuales y automatizadas), registro de hallazgos |
| Semana 5 | Análisis de resultados, sección IA, preparación de presentación final |

### 6.12 Acuerdos de Equipo

1. Cada integrante debe revisar y aprobar los casos de prueba antes de ejecutarlos.
2. Todo defecto encontrado se documenta en el formato establecido (ID, severidad, pasos para reproducir, resultado esperado vs obtenido).
3. Los tests automatizados deben pasar localmente antes de considerarse como entregable.
4. Se usará Git para versionar tanto el código de la aplicación como los scripts de prueba.
5. Las reuniones de sincronización del equipo QA se realizan dos veces por semana.
6. Cualquier cambio en el alcance debe ser aprobado por el QA Lead.

### 6.13 Criterios de Entrada y de Salida

**Criterios de Entrada (para iniciar las pruebas):**

| Criterio | Estado requerido |
|---|---|
| La aplicación JaveCupos debe estar desplegada y accesible localmente. | Cumplido |
| Los datos de prueba (cuentas y viajes de prueba) deben estar creados en Firebase. | Pendiente por ejecutor |
| El ambiente de pruebas (Node.js, Playwright, Chrome) debe estar instalado y configurado. | Pendiente por ejecutor |
| El plan de pruebas debe haber sido revisado y aprobado por el equipo. | Cumplido |

**Criterios de Salida (para dar por finalizada la ejecución):**

| Criterio | Umbral |
|---|---|
| Porcentaje de casos de prueba ejecutados | ≥ 90% |
| Porcentaje de casos que pasan (PASS) | ≥ 80% |
| Defectos críticos (bloquean flujo principal) abiertos | 0 defectos críticos sin resolver |
| Pruebas automatizadas Playwright en estado PASS | ≥ 75% |
| Reporte de hallazgos documentado | 100% completado |

---

*Plan de pruebas elaborado por el equipo JaveCupos – PUJ Cali, 2026.*
