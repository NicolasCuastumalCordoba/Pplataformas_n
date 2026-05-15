# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.js >> TC-AUTH: Módulo de Autenticación >> TC-AUTH-006: Registrar usuario con contraseña corta
- Location: tests\auth.spec.js:132:1

# Error details

```
TimeoutError: locator.click: Timeout 20000ms exceeded.
Call log:
  - waiting for locator('#show-register')

```

# Page snapshot

```yaml
- generic [ref=e10]:
  - generic [ref=e11]:
    - img [ref=e12]
    - generic [ref=e16]: JaveCupos
  - heading "Bienvenido de vuelta" [level=1] [ref=e17]
  - paragraph [ref=e18]: Inicia sesión para continuar
  - generic [ref=e19]:
    - button "Iniciar sesión" [ref=e20] [cursor=pointer]
    - button "Crear cuenta" [ref=e21] [cursor=pointer]
  - generic [ref=e22]:
    - generic [ref=e23]:
      - generic [ref=e24]: Correo electrónico
      - textbox "tu@correo.com" [ref=e25]
    - generic [ref=e26]:
      - generic [ref=e27]: Contraseña
      - generic [ref=e28]:
        - textbox "••••••••" [ref=e29]
        - button "👁" [ref=e30] [cursor=pointer]
    - button "Iniciar sesión" [ref=e31] [cursor=pointer]
```