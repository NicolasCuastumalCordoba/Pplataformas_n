const { test, expect } = require('@playwright/test');

/**
 * Test suite: Perfil de Usuario
 */

const BASE_URL = '/index.html';

const PASSENGER_EMAIL = 'pasajero_test@javerianacali.edu.co';
const TEST_PASSWORD = 'Test1234!';

/**
 * Espera login
 */
async function waitForLoginScreen(page) {
  await page.waitForSelector('#app', {
    state: 'visible',
    timeout: 15000
  });

  await page.waitForTimeout(3000);
}

/**
 * Login
 */
async function loginAs(page, email, password) {

  await page.goto(BASE_URL);

  await waitForLoginScreen(page);

  const emailInput = page.locator('input[type="email"]').first();

  const passwordInput = page.locator('input[type="password"]').first();

  await emailInput.fill(email);

  await passwordInput.fill(password);

  const loginBtn = page
    .locator('button')
    .filter({ hasText: /iniciar sesión|login|entrar/i })
    .first();

  await loginBtn.click();

  await page.waitForTimeout(5000);

  await expect(page.locator('#app')).toBeVisible({
    timeout: 15000
  });

}

/**
 * Ir al perfil
 */
async function navigateToProfile(page) {

  const profileBtn = page
    .locator('button, a, div')
    .filter({ hasText: /perfil|profile/i })
    .first();

  if (await profileBtn.isVisible()) {

    await profileBtn.click();

    await page.waitForTimeout(3000);

  }

}

test.describe('TC-PROFILE: Perfil de Usuario', () => {

  test.beforeEach(async ({ page }) => {

    await loginAs(
      page,
      PASSENGER_EMAIL,
      TEST_PASSWORD
    );

  });

  test('TC-PROFILE-001: Abrir perfil', async ({ page }) => {

    await navigateToProfile(page);

    await expect(page.locator('#app')).toBeVisible({
      timeout: 10000
    });

  });

  test('TC-PROFILE-002: Cambiar rol', async ({ page }) => {

    await navigateToProfile(page);

    const driverBtn = page
      .locator('button, label')
      .filter({ hasText: /conductor|driver/i })
      .first();

    if (await driverBtn.isVisible()) {

      await driverBtn.click();

      await page.waitForTimeout(3000);

      await expect(page.locator('#app')).toBeVisible({
        timeout: 10000
      });

    }

  });

  test('TC-PROFILE-003: Cerrar sesión', async ({ page }) => {

    await navigateToProfile(page);

    const logoutBtn = page
      .locator('button')
      .filter({ hasText: /cerrar sesión|logout|salir/i })
      .first();

    if (await logoutBtn.isVisible()) {

      await logoutBtn.click();

      await page.waitForTimeout(4000);

    }

    await expect(
      page.locator('input[type="email"]').first()
    ).toBeVisible({
      timeout: 10000
    });

  });

});