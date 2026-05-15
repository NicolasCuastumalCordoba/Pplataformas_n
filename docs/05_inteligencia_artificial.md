# Inteligencia Artificial en el Proyecto JaveCupos

---

## 1. Resultados del Uso de la IA en el Proyecto

A lo largo del desarrollo y las fases de prueba del sistema JaveCupos, el equipo utilizó herramientas de Inteligencia Artificial (IA) como asistente para distintas actividades. A continuación se detallan los resultados obtenidos.

---

### 1.1 Generación de Casos de Prueba

**Herramienta utilizada:** Claude (Anthropic) / ChatGPT  
**Actividad:** Se utilizó la IA para proponer casos de prueba de caja negra y caja blanca a partir de la descripción de los módulos del sistema.

**Resultados obtenidos:**
- La IA generó una primera versión de 15 casos de prueba en menos de 5 minutos, cubriendo los módulos de autenticación y búsqueda de viajes.
- Sugirió técnicas de diseño específicas (partición de equivalencia, análisis de valores límite) para cada tipo de funcionalidad.
- Identificó escenarios de borde que el equipo no había considerado inicialmente, como el caso de un conductor intentando reservar su propio viaje (TC-BOOK-002) o la inconsistencia de formato de fecha en Firestore (DEF-004).
- El equipo revisó y refinó los casos generados, ajustando las precondiciones y valores de entrada a los datos reales del ambiente de prueba.

**Aporte cuantificable:**
- Tiempo estimado de diseño manual de casos: 8 horas.
- Tiempo con asistencia de IA: 3 horas (incluida revisión y ajuste).
- **Reducción de tiempo: ~62%.**

---

### 1.2 Análisis de Código (Caja Blanca)

**Herramienta utilizada:** Claude (Anthropic)  
**Actividad:** Se le proporcionó a la IA el código de los módulos `rides.js` y `auth.js` para que identificara caminos de ejecución, condiciones y complejidad ciclomática.

**Resultados obtenidos:**
- La IA trazó correctamente el grafo de flujo de la función `bookRide`, identificando los 4 caminos independientes y calculando la complejidad ciclomática (V(G) = 4).
- Sugirió los 4 casos de prueba mínimos para cobertura total de ramas de `bookRide`.
- Identificó que la validación de campos vacíos en `createRide` estaba delegada a `app.js` y no en el módulo de negocio, lo que representa una separación de responsabilidades débil.
- Señaló que la comparación de fechas con strings puede ser problemática en `getAvailableRides`, lo que llevó al hallazgo DEF-004.

**Aporte cuantificable:**
- El análisis manual de cobertura hubiera tomado aproximadamente 4 horas.
- Con IA: 1.5 horas.
- **Reducción de tiempo: ~62%.**

---

### 1.3 Generación de Scripts de Automatización (Playwright)

**Herramienta utilizada:** Claude (Anthropic)  
**Actividad:** Se usó la IA para generar el esqueleto inicial de los archivos de prueba Playwright (`auth.spec.js`, `rides.spec.js`, `profile.spec.js`) y la configuración `playwright.config.js`.

**Resultados obtenidos:**
- La IA generó scripts funcionales con la estructura correcta de Playwright (`test.describe`, `test.beforeEach`, `expect`, `page.goto`, `page.fill`, etc.).
- Incluyó manejo adecuado de esperas (`waitForSelector`, `waitForTimeout`) para adaptarse a los tiempos de carga de Firebase.
- El equipo tuvo que ajustar los selectores CSS y los textos de los mensajes para que coincidieran exactamente con la implementación de `ui.js`.
- Los scripts generados por IA redujeron significativamente el tiempo de implementación.

**Aporte cuantificable:**
- Implementación manual estimada de los 3 spec files: 8 horas.
- Con IA: 2.5 horas (generación + ajuste de selectores).
- **Reducción de tiempo: ~69%.**

---

### 1.4 Documentación del Proyecto

**Herramienta utilizada:** Claude (Anthropic)  
**Actividad:** Se usó la IA para estructurar y completar los documentos del entregable del curso (descripción del sistema, plan de pruebas, diseño de pruebas, reporte de ejecución).

**Resultados obtenidos:**
- La IA generó documentos completos con el formato exigido por el curso (tablas, secciones, criterios de entrada/salida, roadmap).
- El contenido fue revisado y validado por el equipo para garantizar que refleja con precisión el sistema real.
- Se redujo el tiempo de redacción técnica considerablemente, permitiendo al equipo enfocarse en el análisis y la ejecución.

---

### 1.5 Resumen de Beneficios Obtenidos

| Actividad | Sin IA (estimado) | Con IA (real) | Reducción |
|---|---|---|---|
| Diseño de casos de prueba | 8 h | 3 h | 62% |
| Análisis de caja blanca | 4 h | 1.5 h | 62% |
| Scripts Playwright | 8 h | 2.5 h | 69% |
| Documentación | 6 h | 2 h | 67% |
| **Total** | **26 h** | **9 h** | **~65%** |

---

## 2. Desafíos de la IA

A pesar de los beneficios obtenidos, el equipo identificó varios desafíos y limitaciones en el uso de herramientas de IA durante el proyecto.

---

### 2.1 Alucinaciones y Errores de Código

**Desafío:** En varias ocasiones, la IA generó código de Playwright o fragmentos de JavaScript que parecían correctos sintácticamente pero no funcionaban en el contexto real de la aplicación.

**Ejemplos concretos:**
- La IA generó selectores CSS que no existían en el HTML real de `index.html` (ej: `[data-testid="login-button"]` cuando el botón no tiene ese atributo).
- Sugirió importar módulos de Node.js en el contexto del navegador, confundiendo el entorno de ejecución de Playwright con el del navegador.
- Propuso un `page.waitForNavigation()` después de hacer clic en "Iniciar sesión", cuando la app es una SPA y no realiza navegación tradicional.

**Mitigación:** El equipo siempre revisó el código generado manualmente antes de ejecutarlo, y lo probó en el ambiente real antes de incluirlo en el entregable.

---

### 2.2 Falta de Contexto Sobre Firebase y SPAs

**Desafío:** La IA no tiene acceso directo al código del proyecto ni al estado actual de Firebase. Sus sugerencias sobre cómo esperar a que Firebase autentique un usuario o cómo manejar listeners de Firestore en pruebas E2E fueron imprecisas en algunos casos.

**Ejemplos concretos:**
- Sugirió usar `page.waitForResponse()` para interceptar llamadas a Firebase, sin considerar que Firebase usa WebSockets y gRPC, no peticiones HTTP convencionales.
- No comprendió inicialmente la diferencia entre el tiempo de inicialización de Firebase Auth (asíncrono) y el tiempo de render del DOM.

**Mitigación:** El equipo complementó el uso de la IA con la documentación oficial de Playwright y Firebase, adaptando las sugerencias al comportamiento real de la aplicación.

---

### 2.3 Confianza Excesiva en Salidas de IA

**Desafío:** Algunos integrantes del equipo tendieron a aceptar los casos de prueba generados por IA sin revisión crítica, lo que habría llevado a documentar casos de prueba incorrectos o incompletos.

**Lección aprendida:** La IA es una herramienta de apoyo, no un reemplazo del criterio del tester. Cada caso de prueba generado automáticamente debe ser validado por un profesional con conocimiento del dominio del sistema.

---

### 2.4 Limitaciones de Contexto en Conversaciones Largas

**Desafío:** En sesiones de trabajo extendidas con la IA, esta perdía contexto de las interacciones anteriores y volvía a proponer soluciones ya descartadas o repreguntaba sobre requisitos ya explicados.

**Mitigación:** El equipo dividió el uso de la IA en sesiones cortas y temáticas (una sesión para caja negra, otra para caja blanca, otra para Playwright), proporcionando contexto fresco en cada una.

---

### 2.5 Tabla Resumen de Desafíos

| Desafío | Frecuencia | Impacto | Mitigación |
|---|---|---|---|
| Alucinaciones en código / selectores incorrectos | Alta | Medio | Revisión manual obligatoria de todo código generado |
| Desconocimiento de Firebase / SPA | Media | Medio | Complementar con documentación oficial |
| Confianza excesiva sin revisión crítica | Media | Alto | Política de revisión por pares de casos generados por IA |
| Pérdida de contexto en sesiones largas | Alta | Bajo | Sesiones cortas y temáticas con contexto fresco |

---

## 3. Conclusión sobre el Uso de IA

El uso de Inteligencia Artificial durante el proyecto JaveCupos resultó ser **altamente beneficioso** en términos de productividad y cobertura de pruebas. La reducción estimada del 65% en horas de trabajo para las actividades de diseño y documentación permitió al equipo dedicar más tiempo al análisis crítico, la ejecución real de pruebas y la identificación de defectos genuinos.

Sin embargo, es fundamental comprender que la IA opera como un **asistente experto generalista**, no como un experto en el sistema específico bajo prueba. Su valor máximo se alcanza cuando se combina con el conocimiento del equipo sobre el negocio, la arquitectura y el contexto de la aplicación.

**Recomendación para futuros proyectos:** Establecer un proceso de "revisión humana obligatoria" para toda salida generada por IA antes de ser incorporada al entregable oficial, especialmente en casos de prueba y scripts de automatización.

---

*Sección de Inteligencia Artificial elaborada por el equipo JaveCupos – PUJ Cali, 2026.*
