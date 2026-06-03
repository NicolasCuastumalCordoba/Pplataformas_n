# Diseño de Pruebas – JaveCupos

---

## 1. Técnicas de Diseño Usadas

| Técnica | Descripción | Módulos donde se aplica |
|---|---|---|
| **Partición de equivalencia** | Divide las entradas en clases válidas e inválidas para reducir el número de casos de prueba sin perder cobertura. | Autenticación, Creación de viajes |
| **Análisis de valores límite** | Evalúa los extremos de los rangos de entrada (mínimo, máximo, justo afuera del rango). | Precio del viaje (0, 1, 9999999), Cupos (0, 1, 8, 9) |
| **Tabla de decisión** | Modela combinaciones de condiciones que determinan un resultado. | Reservar viaje (propietario vs pasajero, cupos disponibles vs lleno) |
| **Prueba de transición de estados** | Verifica las transiciones válidas e inválidas entre estados del sistema. | Flujo de estados del viaje: pending → completed / canceled |

---

## 2. Pruebas de Caja Negra – Casos de Prueba

### Módulo: Autenticación

---

| **Caso de Prueba** | **TC-AUTH-001** |
|---|---|
| **Nombre** | Iniciar sesión con credenciales válidas |
| **Objetivo** | Verificar que el sistema permite el acceso a un usuario registrado con email y contraseña correctos, mostrando la pantalla principal de la aplicación. |
| **Técnica de diseño** | Partición de equivalencia – clase válida |
| **Precondiciones** | El usuario `pasajero_test@javerianacali.edu.co` existe en Firebase Auth con contraseña `Test1234!`. La aplicación está corriendo en `http://localhost:5501`. |
| **Valores de entrada** | Email: `pasajero_test@javerianacali.edu.co` / Contraseña: `Test1234!` |
| **Pasos** | 1. Navegar a `http://localhost:5501`. 2. Esperar la pantalla de splash. 3. En la pantalla de login, ingresar el email. 4. Ingresar la contraseña. 5. Hacer clic en el botón "Iniciar sesión". |
| **Resultado esperado** | La aplicación carga la pantalla Home. Se muestra el saludo con el nombre del usuario. La barra de tabs está visible. No aparece ningún mensaje de error. |

---

| **Caso de Prueba** | **TC-AUTH-002** |
|---|---|
| **Nombre** | Intentar iniciar sesión con contraseña incorrecta |
| **Objetivo** | Verificar que el sistema rechaza el acceso cuando la contraseña es incorrecta y muestra un mensaje de error descriptivo. |
| **Técnica de diseño** | Partición de equivalencia – clase inválida |
| **Precondiciones** | El usuario `pasajero_test@javerianacali.edu.co` existe en Firebase Auth. La aplicación está corriendo. |
| **Valores de entrada** | Email: `pasajero_test@javerianacali.edu.co` / Contraseña: `Incorrecta99!` |
| **Pasos** | 1. Navegar a `http://localhost:5501`. 2. En la pantalla de login, ingresar el email. 3. Ingresar la contraseña incorrecta. 4. Hacer clic en "Iniciar sesión". |
| **Resultado esperado** | El sistema permanece en la pantalla de login. Se muestra un toast o mensaje de error: "Contraseña incorrecta". El usuario no accede a la aplicación. |

---

| **Caso de Prueba** | **TC-AUTH-003** |
|---|---|
| **Nombre** | Intentar iniciar sesión con email no registrado |
| **Objetivo** | Verificar que el sistema informa correctamente cuando el email no existe en la base de datos. |
| **Técnica de diseño** | Partición de equivalencia – clase inválida |
| **Precondiciones** | El email `noexiste_xyz@test.com` NO existe en Firebase Auth. |
| **Valores de entrada** | Email: `noexiste_xyz@test.com` / Contraseña: `Test1234!` |
| **Pasos** | 1. Navegar a `http://localhost:5501`. 2. Ingresar el email no registrado. 3. Ingresar cualquier contraseña. 4. Hacer clic en "Iniciar sesión". |
| **Resultado esperado** | El sistema muestra un mensaje de error: "Usuario no encontrado" o "Email no registrado". El usuario no accede a la aplicación. |

---

| **Caso de Prueba** | **TC-AUTH-004** |
|---|---|
| **Nombre** | Intentar iniciar sesión con formato de email inválido |
| **Objetivo** | Verificar que el sistema valida el formato del email antes de enviar la solicitud a Firebase. |
| **Técnica de diseño** | Análisis de valores límite – fuera del formato válido |
| **Precondiciones** | La aplicación está corriendo. |
| **Valores de entrada** | Email: `noesun-email` / Contraseña: `Test1234!` |
| **Pasos** | 1. Navegar a `http://localhost:5501`. 2. Ingresar el email con formato inválido. 3. Ingresar la contraseña. 4. Hacer clic en "Iniciar sesión". |
| **Resultado esperado** | El sistema muestra un mensaje de error indicando que el email no tiene formato válido. No se realiza ninguna llamada a Firebase. |

---

| **Caso de Prueba** | **TC-AUTH-005** |
|---|---|
| **Nombre** | Registrar nuevo usuario con datos válidos |
| **Objetivo** | Verificar que el sistema crea exitosamente una cuenta nueva y redirige al usuario a la pantalla principal. |
| **Técnica de diseño** | Partición de equivalencia – clase válida |
| **Precondiciones** | El email `nuevo_usuario_test@javerianacali.edu.co` no existe en Firebase. La aplicación está corriendo. |
| **Valores de entrada** | Nombre: `Usuario Test`, Email: `nuevo_usuario_test@javerianacali.edu.co`, Contraseña: `Test1234!`, Rol: Pasajero |
| **Pasos** | 1. Navegar a `http://localhost:5501`. 2. Hacer clic en "Crear cuenta" / "Registrarse". 3. Ingresar nombre completo. 4. Ingresar email válido. 5. Ingresar contraseña. 6. Seleccionar rol "Pasajero". 7. Hacer clic en "Crear cuenta". |
| **Resultado esperado** | Se crea la cuenta en Firebase Auth. Se crea el perfil en Firestore. El sistema redirige al Home. Se muestra el saludo con el nombre ingresado. |

---

| **Caso de Prueba** | **TC-AUTH-006** |
|---|---|
| **Nombre** | Intentar registrar usuario con contraseña menor a 6 caracteres |
| **Objetivo** | Verificar que el sistema rechaza contraseñas demasiado cortas según las reglas de Firebase Auth. |
| **Técnica de diseño** | Análisis de valores límite – valor debajo del mínimo |
| **Precondiciones** | La aplicación está corriendo. |
| **Valores de entrada** | Nombre: `Test`, Email: `test_short@test.com`, Contraseña: `12345` (5 caracteres) |
| **Pasos** | 1. Ir a la pantalla de registro. 2. Completar nombre y email válido. 3. Ingresar contraseña de 5 caracteres. 4. Hacer clic en "Crear cuenta". |
| **Resultado esperado** | El sistema muestra un error: "La contraseña debe tener al menos 6 caracteres". No se crea la cuenta. |

---

### Módulo: Búsqueda de Viajes

---

| **Caso de Prueba** | **TC-SEARCH-001** |
|---|---|
| **Nombre** | Buscar viaje por origen existente |
| **Objetivo** | Verificar que el filtro muestra únicamente los viajes cuyo origen coincide (parcialmente o total) con el término buscado. |
| **Técnica de diseño** | Partición de equivalencia – clase válida |
| **Precondiciones** | El usuario está autenticado. Existe al menos un viaje con origen "Campus PUJ" en estado `pending`. |
| **Valores de entrada** | Término de búsqueda: `Campus` |
| **Pasos** | 1. Desde el Home, hacer clic en "Buscar" o ir a la pantalla de búsqueda. 2. Escribir `Campus` en el campo de búsqueda. 3. Observar los resultados. |
| **Resultado esperado** | Solo se muestran viajes cuyo origen o destino contenga "campus" (sin distinción de mayúsculas). Los viajes que no coinciden desaparecen de la lista. |

---

| **Caso de Prueba** | **TC-SEARCH-002** |
|---|---|
| **Nombre** | Buscar viaje con término sin resultados |
| **Objetivo** | Verificar que el sistema muestra el estado vacío cuando ningún viaje coincide con el término buscado. |
| **Técnica de diseño** | Partición de equivalencia – clase inválida |
| **Precondiciones** | El usuario está autenticado. La aplicación tiene viajes disponibles. |
| **Valores de entrada** | Término de búsqueda: `xzxzxzxzxz` (cadena sin coincidencias) |
| **Pasos** | 1. Ir a la pantalla de búsqueda. 2. Escribir `xzxzxzxzxz` en el campo. 3. Observar los resultados. |
| **Resultado esperado** | La lista de viajes queda vacía. Se muestra un mensaje o ícono de estado vacío ("Sin resultados" o similar). |

---

| **Caso de Prueba** | **TC-SEARCH-003** |
|---|---|
| **Nombre** | Limpiar búsqueda y ver todos los viajes |
| **Objetivo** | Verificar que al borrar el término de búsqueda se restauran todos los viajes disponibles. |
| **Técnica de diseño** | Prueba de transición de estados |
| **Precondiciones** | El usuario realizó una búsqueda previa y hay viajes disponibles. |
| **Valores de entrada** | Borrar el campo de búsqueda (dejar vacío). |
| **Pasos** | 1. Con un término activo en el buscador, borrar todo el texto. 2. Observar la lista de resultados. |
| **Resultado esperado** | Se muestran nuevamente todos los viajes disponibles en el sistema. |

---

### Módulo: Reserva de Viajes (Pasajero)

---

| **Caso de Prueba** | **TC-BOOK-001** |
|---|---|
| **Nombre** | Reservar un viaje disponible exitosamente |
| **Objetivo** | Verificar que un pasajero puede reservar un cupo en un viaje con asientos disponibles y que el contador de cupos se actualiza correctamente. |
| **Técnica de diseño** | Partición de equivalencia – clase válida / Tabla de decisión |
| **Precondiciones** | Usuario autenticado con rol `pasajero`. Existe un viaje con estado `pending` y al menos 1 cupo disponible, publicado por otro usuario (no el pasajero). |
| **Valores de entrada** | Seleccionar el viaje "Campus PUJ → Centro Cali". |
| **Pasos** | 1. Desde el Home, seleccionar un viaje disponible. 2. Ver el detalle del viaje. 3. Hacer clic en "Reservar". 4. Confirmar la reserva en el modal. 5. Observar el resultado. |
| **Resultado esperado** | La reserva se registra en Firestore. El `availableSeats` del viaje disminuye en 1. El botón cambia a "Cancelar reserva". Se muestra un mensaje de éxito. |

---

| **Caso de Prueba** | **TC-BOOK-002** |
|---|---|
| **Nombre** | Intentar reservar el propio viaje publicado |
| **Objetivo** | Verificar que el sistema impide que un conductor reserve su propio viaje. |
| **Técnica de diseño** | Tabla de decisión – condición: usuario es el creador del viaje |
| **Precondiciones** | Usuario autenticado con rol `conductor`. El usuario tiene al menos un viaje publicado (es el `createdBy`). |
| **Valores de entrada** | Seleccionar el viaje propio. |
| **Pasos** | 1. Ir a la lista de viajes disponibles. 2. Seleccionar un viaje creado por el propio usuario. 3. Verificar las opciones disponibles en la pantalla de detalle. |
| **Resultado esperado** | El botón "Reservar" no está disponible. El sistema muestra las opciones de conductor (Completar / Cancelar). No es posible reservar el propio viaje. |

---

| **Caso de Prueba** | **TC-BOOK-003** |
|---|---|
| **Nombre** | Cancelar una reserva de viaje |
| **Objetivo** | Verificar que un pasajero puede cancelar su reserva y que el cupo se libera correctamente. |
| **Técnica de diseño** | Prueba de transición de estados |
| **Precondiciones** | Usuario autenticado con rol `pasajero` y con una reserva activa en algún viaje. |
| **Valores de entrada** | Viaje previamente reservado. |
| **Pasos** | 1. Ir a "Mis Viajes" → pestaña de reservas. 2. Seleccionar el viaje reservado. 3. Hacer clic en "Cancelar reserva". 4. Confirmar en el modal. |
| **Resultado esperado** | La reserva se elimina de Firestore. El `availableSeats` aumenta en 1. El botón vuelve a ser "Reservar". Se muestra un mensaje de éxito. |

---

### Módulo: Gestión de Viajes (Conductor)

---

| **Caso de Prueba** | **TC-RIDE-001** |
|---|---|
| **Nombre** | Crear un viaje con datos válidos |
| **Objetivo** | Verificar que un conductor puede publicar un viaje con todos los campos requeridos y que aparece en la lista de viajes disponibles. |
| **Técnica de diseño** | Partición de equivalencia – clase válida |
| **Precondiciones** | Usuario autenticado con rol `conductor`. La pantalla "Publicar" está visible en la barra de tabs. |
| **Valores de entrada** | Origen: `Campus PUJ Cali`, Destino: `Centro Comercial Jardín Plaza`, Fecha: mañana (fecha futura válida), Hora: `07:30`, Precio: `5000`, Cupos: `3`, Descripción: `Viaje directo sin paradas.` |
| **Pasos** | 1. Ir a la pantalla "Publicar". 2. Completar todos los campos del formulario. 3. Hacer clic en "Publicar viaje". |
| **Resultado esperado** | El viaje se crea en Firestore con estado `pending`. Aparece en la lista de viajes del Home. Se muestra un modal de éxito. El conductor es redirigido al Home. |

---

| **Caso de Prueba** | **TC-RIDE-002** |
|---|---|
| **Nombre** | Intentar crear un viaje con precio igual a cero |
| **Objetivo** | Verificar que el sistema no permite publicar un viaje con precio $0 (valor límite inválido). |
| **Técnica de diseño** | Análisis de valores límite – valor mínimo inválido |
| **Precondiciones** | Usuario autenticado con rol `conductor`. |
| **Valores de entrada** | Origen: `Campus PUJ`, Destino: `Centro`, Fecha: mañana, Hora: `08:00`, Precio: `0`, Cupos: `2` |
| **Pasos** | 1. Ir a la pantalla "Publicar". 2. Completar todos los campos con precio = 0. 3. Hacer clic en "Publicar viaje". |
| **Resultado esperado** | El sistema muestra un mensaje de error indicando que el precio debe ser mayor a 0. El viaje no se crea en Firestore. |

---

| **Caso de Prueba** | **TC-RIDE-003** |
|---|---|
| **Nombre** | Marcar un viaje como completado |
| **Objetivo** | Verificar que el conductor puede cambiar el estado de su viaje de `pending` a `completed`. |
| **Técnica de diseño** | Prueba de transición de estados |
| **Precondiciones** | Usuario autenticado como conductor. El conductor tiene al menos un viaje en estado `pending`. |
| **Valores de entrada** | Seleccionar un viaje propio en estado `pending`. |
| **Pasos** | 1. Ir a "Mis Viajes" → pestaña de viajes publicados. 2. Seleccionar un viaje en estado `pending`. 3. Hacer clic en "Completar viaje". 4. Confirmar en el modal. |
| **Resultado esperado** | El estado del viaje cambia a `completed` en Firestore. El viaje deja de aparecer en la lista de viajes disponibles. Se muestra un mensaje de éxito. |

---

| **Caso de Prueba** | **TC-RIDE-004** |
|---|---|
| **Nombre** | Cancelar un viaje publicado |
| **Objetivo** | Verificar que el conductor puede cancelar su viaje y que este deja de estar disponible para reservas. |
| **Técnica de diseño** | Prueba de transición de estados |
| **Precondiciones** | Usuario autenticado como conductor. El conductor tiene al menos un viaje en estado `pending`. |
| **Valores de entrada** | Seleccionar un viaje propio en estado `pending`. |
| **Pasos** | 1. Ir al detalle del viaje propio. 2. Hacer clic en "Cancelar viaje". 3. Confirmar la acción. |
| **Resultado esperado** | El estado cambia a `canceled` en Firestore. El viaje desaparece de la lista de disponibles. Se muestra confirmación al conductor. |

---

### Módulo: Perfil de Usuario

---

| **Caso de Prueba** | **TC-PROFILE-001** |
|---|---|
| **Nombre** | Cambiar rol de pasajero a conductor |
| **Objetivo** | Verificar que el usuario puede cambiar su rol desde la pantalla de perfil y que la interfaz se actualiza acorde al nuevo rol. |
| **Técnica de diseño** | Prueba de transición de estados |
| **Precondiciones** | Usuario autenticado con rol `passenger`. |
| **Valores de entrada** | Acción: seleccionar "Conductor" en el selector de rol. |
| **Pasos** | 1. Ir a la pantalla de Perfil (tab de perfil). 2. Localizar la opción de cambio de rol. 3. Seleccionar "Conductor". 4. Confirmar el cambio. 5. Observar la interfaz. |
| **Resultado esperado** | El rol en Firestore cambia a `driver`. Aparece el tab "Publicar" en la barra de navegación. El badge de rol en la pantalla de perfil se actualiza a "Conductor". |

---

| **Caso de Prueba** | **TC-PROFILE-002** |
|---|---|
| **Nombre** | Activar modo oscuro desde el perfil |
| **Objetivo** | Verificar que el interruptor de modo oscuro cambia el tema visual de la aplicación y persiste el estado en localStorage. |
| **Técnica de diseño** | Partición de equivalencia – clase válida |
| **Precondiciones** | Usuario autenticado. La aplicación está en modo claro (por defecto). |
| **Valores de entrada** | Acción: activar el toggle de "Modo oscuro". |
| **Pasos** | 1. Ir a la pantalla de Perfil. 2. Localizar el toggle de "Modo oscuro". 3. Activarlo. 4. Observar el cambio visual. 5. Recargar la página y verificar que el estado persiste. |
| **Resultado esperado** | La aplicación cambia su esquema de colores a oscuro inmediatamente. El valor `jv-theme` en localStorage se actualiza a `dark`. Al recargar, la aplicación permanece en modo oscuro. |

---

| **Caso de Prueba** | **TC-PROFILE-003** |
|---|---|
| **Nombre** | Cerrar sesión desde el perfil |
| **Objetivo** | Verificar que el usuario puede cerrar sesión y el sistema lo redirige a la pantalla de login. |
| **Técnica de diseño** | Partición de equivalencia – clase válida |
| **Precondiciones** | Usuario autenticado. |
| **Valores de entrada** | Acción: clic en "Cerrar sesión" y confirmar. |
| **Pasos** | 1. Ir a la pantalla de Perfil. 2. Hacer clic en "Cerrar sesión". 3. Confirmar en el modal de confirmación. |
| **Resultado esperado** | La sesión de Firebase se cierra. El sistema muestra la pantalla de login. El usuario no puede ver contenido protegido sin autenticarse nuevamente. |

---

## 3. Pruebas de Caja Blanca – Análisis del Código

### 3.1 Función `bookRide` (rides.js)

**Descripción:** Reserva un cupo en un viaje. Contiene lógica de negocio con múltiples condiciones.

**Código analizado:**
```javascript
export async function bookRide(rideId) {
  const user = currentUser();
  const rideRef = doc(db, 'rides', rideId);
  const ride = (await getDoc(rideRef)).data();

  // Validación 1: No puede reservar su propio viaje
  if (ride.createdBy === user.uid) throw new Error("No puedes reservar tu propio viaje");
  
  // Validación 2: No puede reservar dos veces
  if (ride.passengers.includes(user.uid)) throw new Error("Ya tienes una reserva en este viaje");
  
  // Validación 3: Debe haber cupos disponibles
  if (ride.availableSeats <= 0) throw new Error("No hay cupos disponibles");

  await updateDoc(rideRef, {
    passengers: arrayUnion(user.uid),
    availableSeats: increment(-1)
  });
}
```

**Grafo de flujo:**

```
  INICIO
    │
    ▼
[¿createdBy === uid?] ──SÍ──► LANZAR ERROR "propio viaje" ──► FIN
    │ NO
    ▼
[¿uid en passengers[]?] ──SÍ──► LANZAR ERROR "ya reservado" ──► FIN
    │ NO
    ▼
[¿availableSeats <= 0?] ──SÍ──► LANZAR ERROR "sin cupos" ──► FIN
    │ NO
    ▼
[updateDoc: +passenger, -1 seat]
    │
    ▼
   FIN
```

**Complejidad ciclomática:** V(G) = 4 aristas independientes → **4 casos de prueba mínimos**

**Casos de prueba de caja blanca para `bookRide`:**

| ID | Camino | Condiciones | Resultado esperado |
|---|---|---|---|
| CB-BR-01 | Camino 1 | `createdBy === uid` → true | Error: "No puedes reservar tu propio viaje" |
| CB-BR-02 | Camino 2 | `createdBy !== uid`, `uid en passengers[]` → true | Error: "Ya tienes una reserva en este viaje" |
| CB-BR-03 | Camino 3 | `createdBy !== uid`, no en passengers, `availableSeats <= 0` | Error: "No hay cupos disponibles" |
| CB-BR-04 | Camino 4 | Todas las condiciones falsas, cupos disponibles | Reserva exitosa, Firestore actualizado |

**Cobertura:** 4/4 caminos → **100% de cobertura de sentencias y ramas**

---

### 3.2 Función `createRide` (rides.js)

**Descripción:** Crea un nuevo viaje en Firestore con validación básica de datos.

**Caminos identificados:**
1. Datos completos válidos → crea el viaje exitosamente.
2. Algún campo requerido vacío → lanza error de validación.
3. Usuario no autenticado → lanza error de sesión.

**Casos de prueba de caja blanca para `createRide`:**

| ID | Camino | Condición | Resultado esperado |
|---|---|---|---|
| CB-CR-01 | Camino 1 | Todos los campos válidos, usuario autenticado como driver | Viaje creado en Firestore con status `pending` |
| CB-CR-02 | Camino 2 | Campo `origin` vacío | Error de validación |
| CB-CR-03 | Camino 3 | Usuario con rol `passenger` intenta crear | Flujo bloqueado por UI (botón no disponible) |

---

### 3.3 Función `getAvailableRides` (rides.js)

**Descripción:** Consulta los viajes con estado `pending` y fecha >= hoy.

**Condiciones de la consulta:**
- `where('status', '==', 'pending')`
- `where('date', '>=', today)`
- `orderBy('date')`

**Casos de prueba de caja blanca:**

| ID | Camino | Condición | Resultado esperado |
|---|---|---|---|
| CB-GAR-01 | Camino 1 | Hay viajes pending con fecha hoy o futura | Retorna lista con los viajes |
| CB-GAR-02 | Camino 2 | No hay viajes pending | Retorna lista vacía |
| CB-GAR-03 | Camino 3 | Hay viajes pending con fecha pasada | NO se incluyen en los resultados |

---

## 4. Resumen de Casos de Prueba

| Categoría | Cantidad de casos |
|---|---|
| Caja negra – Autenticación | 6 |
| Caja negra – Búsqueda de viajes | 3 |
| Caja negra – Reserva de viajes | 3 |
| Caja negra – Gestión de viajes (conductor) | 4 |
| Caja negra – Perfil de usuario | 3 |
| **Total caja negra** | **19** |
| Caja blanca – `bookRide` | 4 |
| Caja blanca – `createRide` | 3 |
| Caja blanca – `getAvailableRides` | 3 |
| **Total caja blanca** | **10** |
| **TOTAL GENERAL** | **29** |

---

*Documento de diseño de pruebas elaborado por el equipo JaveCupos – PUJ Cali, 2026.*
