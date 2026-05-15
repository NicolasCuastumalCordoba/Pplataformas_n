# Ejecución de Pruebas – JaveCupos

---

## 1. Reporte de Resultados de Ejecución

**Fecha de ejecución:** 13 de mayo de 2026  
**Ambiente:** Local – `http://localhost:5501`  
**Navegador:** Google Chrome 124.0.6367.82  
**Ejecutado por:** Equipo JaveCupos (Santiago Carvajal, Isabella Ramírez, Nicolás Cuastumal)  
**Versión del sistema:** JaveCupos v4.0

---

### 1.1 Resumen Ejecutivo

| Métrica | Valor |
|---|---|
| Total de casos ejecutados | 29 |
| Casos PASS (exitosos) | 24 |
| Casos FAIL (fallidos) | 4 |
| Casos BLOQUEADOS | 1 |
| Porcentaje de éxito | 82.76% |
| Defectos encontrados | 4 |
| Defectos críticos | 1 |
| Defectos mayores | 2 |
| Defectos menores | 1 |

---

### 1.2 Resultados por Caso de Prueba – Caja Negra

#### Módulo: Autenticación

| ID | Nombre | Resultado | Observaciones |
|---|---|---|---|
| TC-AUTH-001 | Iniciar sesión con credenciales válidas | ✅ PASS | El sistema redirige correctamente al Home tras un login exitoso. |
| TC-AUTH-002 | Intentar iniciar sesión con contraseña incorrecta | ✅ PASS | Muestra toast de error "Contraseña incorrecta". |
| TC-AUTH-003 | Intentar iniciar sesión con email no registrado | ✅ PASS | Muestra mensaje "Usuario no encontrado". |
| TC-AUTH-004 | Intentar iniciar sesión con formato de email inválido | ❌ FAIL | **DEF-001:** El sistema realiza la llamada a Firebase sin validar el formato del email localmente. Firebase retorna un error genérico que no es suficientemente descriptivo para el usuario. |
| TC-AUTH-005 | Registrar nuevo usuario con datos válidos | ✅ PASS | Cuenta creada exitosamente, perfil en Firestore generado, Home cargado. |
| TC-AUTH-006 | Intentar registrar usuario con contraseña < 6 caracteres | ✅ PASS | Firebase Auth rechaza la solicitud y el sistema muestra el mensaje de error. |

#### Módulo: Búsqueda de Viajes

| ID | Nombre | Resultado | Observaciones |
|---|---|---|---|
| TC-SEARCH-001 | Buscar viaje por origen existente | ✅ PASS | El filtro funciona correctamente, case-insensitive. |
| TC-SEARCH-002 | Buscar viaje con término sin resultados | ✅ PASS | Se muestra el estado vacío con ícono y texto "Sin viajes disponibles". |
| TC-SEARCH-003 | Limpiar búsqueda y ver todos los viajes | ✅ PASS | Al borrar el campo, se restauran todos los viajes disponibles. |

#### Módulo: Reserva de Viajes (Pasajero)

| ID | Nombre | Resultado | Observaciones |
|---|---|---|---|
| TC-BOOK-001 | Reservar un viaje disponible exitosamente | ✅ PASS | El cupo se actualiza en tiempo real. El botón cambia a "Cancelar reserva". |
| TC-BOOK-002 | Intentar reservar el propio viaje publicado | ✅ PASS | Las opciones de conductor (Completar/Cancelar) sustituyen el botón de reserva. |
| TC-BOOK-003 | Cancelar una reserva de viaje | ❌ FAIL | **DEF-002:** Tras cancelar la reserva, el `availableSeats` se incrementa correctamente, pero la UI no refleja el cambio inmediatamente sin refrescar la pantalla. Se requiere navegación manual para ver el estado actualizado. |

#### Módulo: Gestión de Viajes (Conductor)

| ID | Nombre | Resultado | Observaciones |
|---|---|---|---|
| TC-RIDE-001 | Crear un viaje con datos válidos | ✅ PASS | El viaje aparece en el Home en tiempo real. Modal de éxito mostrado. |
| TC-RIDE-002 | Intentar crear un viaje con precio igual a cero | ❌ FAIL | **DEF-003:** El sistema no valida que el precio sea mayor a 0 en el frontend. Se puede publicar un viaje con precio $0, lo cual es un dato inválido de negocio. |
| TC-RIDE-003 | Marcar un viaje como completado | ✅ PASS | El estado cambia a `completed`. El viaje desaparece de la lista de disponibles. |
| TC-RIDE-004 | Cancelar un viaje publicado | ✅ PASS | El estado cambia a `canceled`. El viaje ya no aparece en búsquedas. |

#### Módulo: Perfil de Usuario

| ID | Nombre | Resultado | Observaciones |
|---|---|---|---|
| TC-PROFILE-001 | Cambiar rol de pasajero a conductor | ✅ PASS | El tab "Publicar" aparece al cambiar a conductor. |
| TC-PROFILE-002 | Activar modo oscuro desde el perfil | ✅ PASS | El tema cambia inmediatamente y persiste en localStorage tras recargar. |
| TC-PROFILE-003 | Cerrar sesión desde el perfil | ✅ PASS | La sesión se cierra y el sistema muestra la pantalla de login. |

---

### 1.3 Resultados por Caso de Prueba – Caja Blanca

| ID | Nombre | Resultado | Observaciones |
|---|---|---|---|
| CB-BR-01 | `bookRide`: createdBy === uid | ✅ PASS | El error se lanza correctamente. |
| CB-BR-02 | `bookRide`: uid ya en passengers[] | ✅ PASS | El error se lanza correctamente. |
| CB-BR-03 | `bookRide`: availableSeats <= 0 | ✅ PASS | El error se lanza correctamente. |
| CB-BR-04 | `bookRide`: reserva exitosa | ✅ PASS | Firestore actualizado correctamente. |
| CB-CR-01 | `createRide`: datos válidos | ✅ PASS | Viaje creado exitosamente. |
| CB-CR-02 | `createRide`: campo vacío | ⚠️ BLOQUEADO | No existe validación explícita en el módulo `rides.js`; la validación ocurre en `app.js` antes de llamar a `createRide`. Se requiere revisar si la cobertura es adecuada. |
| CB-CR-03 | `createRide`: usuario passenger | ✅ PASS | El tab "Publicar" está oculto para pasajeros. |
| CB-GAR-01 | `getAvailableRides`: viajes pending futuros | ✅ PASS | Retorna la lista correctamente. |
| CB-GAR-02 | `getAvailableRides`: sin viajes pending | ✅ PASS | Retorna lista vacía. |
| CB-GAR-03 | `getAvailableRides`: viajes pending con fecha pasada | ❌ FAIL | **DEF-004:** La query filtra por `date >= today` usando strings. En ciertos formatos de fecha, la comparación lexicográfica puede fallar (ej: `2026-1-5` vs `2026-01-05`). Se recomienda estandarizar el formato de fecha a `YYYY-MM-DD` con padding de ceros. |

---

## 2. Documentación de Hallazgos y Defectos Encontrados

### DEF-001 – Validación de formato de email ausente en frontend

| Campo | Detalle |
|---|---|
| **ID del defecto** | DEF-001 |
| **Caso de prueba relacionado** | TC-AUTH-004 |
| **Severidad** | Mayor |
| **Prioridad** | Media |
| **Módulo afectado** | `js/app.js` – flujo de login |
| **Descripción** | El sistema no valida el formato del email antes de enviarlo a Firebase Auth. Cuando el usuario ingresa un email con formato inválido (ej: `noesun-email`), Firebase retorna un error con código `auth/invalid-email`, pero el mensaje mostrado al usuario puede ser genérico o poco comprensible. |
| **Pasos para reproducir** | 1. Ir a la pantalla de login. 2. Ingresar `noesun-email` en el campo de email. 3. Ingresar cualquier contraseña. 4. Hacer clic en "Iniciar sesión". |
| **Resultado obtenido** | El mensaje de error es genérico o no suficientemente descriptivo. |
| **Resultado esperado** | El sistema debe validar el formato del email localmente con una expresión regular antes de llamar a Firebase, mostrando un mensaje claro: "El email no tiene un formato válido." |
| **Recomendación de corrección** | Agregar validación de regex de email en el evento de submit del formulario de login, antes de llamar a `login()`. |

---

### DEF-002 – UI no se actualiza tras cancelar reserva sin navegar

| Campo | Detalle |
|---|---|
| **ID del defecto** | DEF-002 |
| **Caso de prueba relacionado** | TC-BOOK-003 |
| **Severidad** | Mayor |
| **Prioridad** | Alta |
| **Módulo afectado** | `js/app.js` – pantalla de detalle de viaje |
| **Descripción** | Cuando un pasajero cancela su reserva, la operación se completa correctamente en Firestore (el `uid` se elimina del arreglo `passengers[]` y `availableSeats` incrementa). Sin embargo, el botón de la pantalla de detalle sigue mostrando "Cancelar reserva" en lugar de cambiar a "Reservar". La UI solo se actualiza si el usuario navega hacia atrás y vuelve a abrir el detalle del viaje. |
| **Pasos para reproducir** | 1. Iniciar sesión como pasajero con una reserva activa. 2. Abrir el detalle del viaje reservado. 3. Hacer clic en "Cancelar reserva" y confirmar. 4. Observar el botón sin navegar. |
| **Resultado obtenido** | El botón permanece como "Cancelar reserva" después de la cancelación exitosa. |
| **Resultado esperado** | Después de cancelar, el botón debe actualizarse inmediatamente a "Reservar", reflejando el nuevo estado del viaje. |
| **Recomendación de corrección** | Después de `cancelBooking()`, recargar los datos del viaje llamando a `getRideById(rideId)` y re-renderizar la sección de botones de acción en la pantalla de detalle. |

---

### DEF-003 – Precio de $0 es aceptado al crear un viaje

| Campo | Detalle |
|---|---|
| **ID del defecto** | DEF-003 |
| **Caso de prueba relacionado** | TC-RIDE-002 |
| **Severidad** | Menor |
| **Prioridad** | Baja |
| **Módulo afectado** | `js/app.js` – formulario de creación de viaje |
| **Descripción** | El formulario de creación de viaje no valida que el precio ingresado sea mayor a 0. Un conductor puede publicar un viaje con precio $0, lo que es inconsistente con el modelo de negocio (carpooling implica compartir costos). |
| **Pasos para reproducir** | 1. Iniciar sesión como conductor. 2. Ir a "Publicar". 3. Completar todos los campos con precio = 0. 4. Hacer clic en "Publicar viaje". |
| **Resultado obtenido** | El viaje se crea exitosamente con precio $0. |
| **Resultado esperado** | El sistema debe mostrar un error: "El precio debe ser mayor a $0" y no permitir la publicación. |
| **Recomendación de corrección** | Agregar validación `if (price <= 0)` en el handler del formulario de publicación en `app.js`, antes de llamar a `createRide()`. |

---

### DEF-004 – Comparación de fechas puede fallar con formato inconsistente

| Campo | Detalle |
|---|---|
| **ID del defecto** | DEF-004 |
| **Caso de prueba relacionado** | CB-GAR-03 |
| **Severidad** | Mayor |
| **Prioridad** | Alta |
| **Módulo afectado** | `js/rides.js` – función `getAvailableRides` / `listenAvailableRides` |
| **Descripción** | La consulta a Firestore filtra viajes usando `where('date', '>=', today)` donde `today` es un string en formato `YYYY-MM-DD`. Si algún viaje fue guardado con formato de fecha inconsistente (sin padding de ceros, ej: `2026-1-5` en lugar de `2026-01-05`), la comparación lexicográfica de strings puede producir resultados incorrectos, mostrando u ocultando viajes de manera errónea. |
| **Pasos para reproducir** | 1. En Firebase Firestore, crear manualmente un viaje con `date: "2026-1-5"` (sin padding). 2. Ejecutar la app con fecha actual mayor a esa. 3. Verificar si el viaje aparece o no en la lista de disponibles. |
| **Resultado obtenido** | El viaje puede aparecer incorrectamente en la lista de disponibles aunque su fecha ya pasó, o puede no aparecer aunque la fecha sea futura. |
| **Resultado esperado** | Todos los viajes con fecha pasada deben excluirse de la lista, independientemente del formato. |
| **Recomendación de corrección** | Estandarizar el guardado de fechas en `createRide()` usando `new Date(date).toISOString().split('T')[0]` para garantizar el formato `YYYY-MM-DD` con padding. |

---

## 3. Tabla Resumen de Defectos

| ID | Descripción breve | Severidad | Prioridad | Estado | Módulo |
|---|---|---|---|---|---|
| DEF-001 | Validación de formato email ausente en frontend | Mayor | Media | Abierto | `app.js` |
| DEF-002 | UI no actualiza botón tras cancelar reserva | Mayor | Alta | Abierto | `app.js` |
| DEF-003 | Precio $0 es aceptado en creación de viaje | Menor | Baja | Abierto | `app.js` |
| DEF-004 | Comparación de fechas inconsistente en Firestore | Mayor | Alta | Abierto | `rides.js` |

---

## 4. Cobertura de Pruebas Alcanzada

| Módulo | Casos diseñados | Casos ejecutados | PASS | FAIL | Cobertura |
|---|---|---|---|---|---|
| Autenticación | 6 | 6 | 5 | 1 | 100% |
| Búsqueda | 3 | 3 | 3 | 0 | 100% |
| Reserva de viajes | 3 | 3 | 2 | 1 | 100% |
| Gestión de viajes | 4 | 4 | 3 | 1 | 100% |
| Perfil | 3 | 3 | 3 | 0 | 100% |
| Caja blanca | 10 | 10 | 8 | 1 | 100% |
| **Total** | **29** | **29** | **24** | **4** | **100%** |

> 1 caso bloqueado (CB-CR-02) no se contabiliza como FAIL sino como pendiente de revisión de diseño de prueba.

---

*Reporte de ejecución elaborado por el equipo JaveCupos – PUJ Cali, 2026.*
