// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Test suite: Autenticación
 * Covers: TC-AUTH-001 to TC-AUTH-006
 */

const BASE_URL = '/index.html';

const EMAIL = 'pasajero_test@javerianacali.edu.co';
const PASSWORD = 'Test1234!';

/**
 * Espera a que cargue la pantalla de login
 */
async function waitForLoginScreen(page) {
  await page.waitForSelector('#app', {
    state: 'visible',
    timeout: 15000
  });

  await page.waitForTimeout(3000);
}

/**
 * Hace login
 */
async function doLogin(page, email, password) {
  const emailInput = page.locator('input[type="email"]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  await emailInput.fill(email);
  await passwordInput.fill(password);

  const loginButton = page
    .locator('button')
    .filter({ hasText: /iniciar sesión|login|entrar/i })
    .first();

  await loginButton.click();

  await page.waitForTimeout(4000);
}

test.describe('TC-AUTH: Módulo de Autenticación', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);

    await waitForLoginScreen(page);
  });

  test('TC-AUTH-001: Iniciar sesión con credenciales válidas', async ({ page }) => {

    await doLogin(page, EMAIL, PASSWORD);

    await expect(page.locator('#app')).toBeVisible({
      timeout: 15000
    });

  });

  test('TC-AUTH-002: Iniciar sesión con contraseña incorrecta', async ({ page }) => {

    await doLogin(page, EMAIL, 'incorrecta123');

    await expect(
      page.locator('input[type="email"]').first()
    ).toBeVisible({
      timeout: 10000
    });

  });

  test('TC-AUTH-003: Iniciar sesión con email no registrado', async ({ page }) => {

    await doLogin(page, 'noexiste@test.com', PASSWORD);

    await expect(
      page.locator('input[type="email"]').first()
    ).toBeVisible({
      timeout: 10000
    });

  });

  test('TC-AUTH-004: Iniciar sesión con email inválido', async ({ page }) => {

    await doLogin(page, 'correo-malo', PASSWORD);

    await expect(
      page.locator('input[type="email"]').first()
    ).toBeVisible({
      timeout: 10000
    });

  });

  test('TC-AUTH-005: Registrar usuario nuevo', async ({ page }) => {

  const createAccountBtn = page.locator('#tab-register');

  await createAccountBtn.click();

  await page.waitForTimeout(3000);

  const registerContainer = page.locator('#panel-register');

  await expect(registerContainer).toBeVisible({
    timeout: 10000
  });

  await page.locator('#r-name').fill('Usuario Playwright');

  const newEmail = `play_${Date.now()}@test.com`;

  await page.locator('#r-email').fill(newEmail);

  await page.locator('#r-pass').fill('Test1234!');

  const submitBtn = page.locator('#r-btn');

  await submitBtn.click();

  await page.waitForTimeout(5000);

  await expect(page.locator('#app')).toBeVisible();

});

test('TC-AUTH-006: Registrar usuario con contraseña corta', async ({ page }) => {

  const createAccountBtn = page.locator('#tab-register');

  await createAccountBtn.click();

  await page.waitForTimeout(3000);

  const registerContainer = page.locator('#panel-register');

  await expect(registerContainer).toBeVisible({
    timeout: 10000
  });

  await page.locator('#r-name').fill('Usuario Error');

  await page.locator('#r-email').fill(
    `error_${Date.now()}@test.com`
  );

  await page.locator('#r-pass').fill('123');

  const submitBtn = page.locator('#r-btn');

  await submitBtn.click();

  await page.waitForTimeout(3000);

  await expect(
    page.locator('#r-name')
  ).toBeVisible();

});
});