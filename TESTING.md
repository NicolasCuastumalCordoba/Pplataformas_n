# Guía de Ejecución de Pruebas - JaveCupos

Esta guía proporciona instrucciones paso a paso para ejecutar el plan de pruebas automatizadas con Playwright.

---

## Requisitos Previos

Asegúrate de tener instalados:
- **Node.js** v18 o superior ([descargar](https://nodejs.org/))
- **npm** (incluido con Node.js)
- **Google Chrome** v124 o superior
- **Git** para control de versiones

## Instalación

1. **Clona o navega al directorio del proyecto:**
   ```bash
   cd "Pplataformas_n-main"
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

   Esto instalará:
   - Playwright (`@playwright/test`)
   - http-server (para servir la aplicación localmente)

---

## Ejecución de Pruebas

### Paso 1: Inicia el Servidor Local

Abre una terminal y ejecuta:
```bash
npm start
```

Verás algo como:
```
Starting up http-server, serving .
Available on:
  http://127.0.0.1:5501
  http://localhost:5501
```

**Deja esta terminal abierta mientras ejecutas las pruebas.**

### Paso 2: Ejecuta las Pruebas (en otra terminal)

En una **nueva terminal**, ejecuta uno de los siguientes comandos:

#### Ejecutar todas las pruebas
```bash
npm test
```

#### Ejecutar pruebas con navegador visible
```bash
npm run test:headed
```
(Recomendado para ver qué está sucediendo)

#### Ejecutar pruebas específicas
```bash
npm run test:auth       # Solo pruebas de autenticación
npm run test:rides      # Solo pruebas de viajes
npm run test:profile    # Solo pruebas de perfil
```

#### Usar la interfaz interactiva de Playwright
```bash
npm run test:ui
```
(Abre una interfaz gráfica donde puedes ejecutar tests interactivamente)

### Paso 3: Visualiza los Resultados

Después de ejecutar las pruebas, puedes ver un reporte detallado:
```bash
npm run test:report
```

Esto abrirá un reporte HTML en tu navegador predeterminado.

---

## Configuración de Pruebas

- **Base URL:** `http://localhost:5501`
- **Navegador:** Google Chrome (Chromium)
- **Modo:** Headless (sin interfaz gráfica) por defecto
- **Timeout por test:** 60 segundos
- **Timeout de acción:** 20 segundos

Ver [playwright.config.js](./playwright.config.js) para detalles de configuración.

---

## Datos de Prueba

Para que las pruebas funcionen, debes tener estas cuentas creadas en Firebase:

| Email | Contraseña | Rol |
|---|---|---|
| `pasajero_test@javerianacali.edu.co` | `Test1234!` | Pasajero |
| `conductor_test@javerianacali.edu.co` | `Test1234!` | Conductor |

**Si no existen:**
1. Ve a la aplicación en `http://localhost:5501`
2. Regístrate manualmente con esos datos
3. Luego podrás ejecutar las pruebas

---

## Solución de Problemas

### "Connection refused" en localhost:5501
- Asegúrate que ejecutaste `npm start` en otra terminal
- Verifica que el puerto 5501 no esté en uso: `netstat -ano | findstr :5501` (Windows)

### Tests fallan con "selector not found"
- Abre `npm run test:headed` para ver qué está pasando en la pantalla
- Verifica que los datos de prueba existan en Firebase

### Timeout en tests
- Aumenta el timeout en `playwright.config.js` si la red es lenta
- Verifica tu conexión a Internet (Firebase es externa)

### Error: "Playwright not installed"
- Ejecuta `npm install` nuevamente

---

## Archivos de Prueba

```
tests/
├── auth.spec.js       # Pruebas de autenticación (login, registro)
├── rides.spec.js      # Pruebas de viajes (búsqueda, reserva, creación)
└── profile.spec.js    # Pruebas de perfil (cambio de rol, tema oscuro)
```

Cada archivo contiene varios casos de prueba (`test(...)`) organizados por módulo.

---

## Documentación Relacionada

- [Plan de Pruebas Completo](./docs/02_plan_de_pruebas.md)
- [Diseño de Pruebas](./docs/03_diseno_pruebas.md)
- [Ejecución y Resultados](./docs/04_ejecucion_pruebas.md)
- [Configuración de Playwright](./playwright.config.js)

---

## Contacto y Soporte

Para preguntas o problemas:
- **QA Lead:** Santiago Carvajal
- **Diseñadora de Pruebas:** Isabella Ramírez
- **Analista Caja Blanca:** Nicolás Cuastumal

Proyecto: JaveCupos - Sistema Inteligente de Carpooling Universitario PUJ Cali
