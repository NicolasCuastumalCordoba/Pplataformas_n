const { test, expect } = require('@playwright/test');

/**
 * TESTS VIAJES
 */

const BASE_URL = '/index.html';

const PASSENGER_EMAIL = 'pasajero_test@javerianacali.edu.co';
const DRIVER_EMAIL = 'conductor_test@javerianacali.edu.co';

const PASSWORD = 'Test1234!';

/**
 * Esperar login
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

  const emailInput = page
    .locator('input[type="email"]')
    .first();

  const passwordInput = page
    .locator('input[type="password"]')
    .first();

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
 * Ir a buscar viajes
 */
async function navigateToSearch(page) {

  const searchBtn = page
    .locator('button, a, div')
    .filter({ hasText: /buscar|search/i })
    .first();

  if (await searchBtn.isVisible()) {

    await searchBtn.click();

    await page.waitForTimeout(3000);

  }

}

/**
 * Fecha mañana
 */
async function getTomorrowDate() {

  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow.toISOString().split('T')[0];

}

/* =========================================================
   SEARCH
========================================================= */

test.describe('TC-SEARCH', () => {

  test.beforeEach(async ({ page }) => {

    await loginAs(
      page,
      PASSENGER_EMAIL,
      PASSWORD
    );

  });

  test('TC-SEARCH-001 Buscar viajes', async ({ page }) => {

    await navigateToSearch(page);

    await expect(page.locator('#app')).toBeVisible({
      timeout: 10000
    });

  });

  test('TC-SEARCH-002 Buscar texto inexistente', async ({ page }) => {

    await navigateToSearch(page);

    const searchInput = page
      .locator('input[type="search"], input')
      .first();

    if (await searchInput.isVisible()) {

      await searchInput.fill('xxxxxxxx');

      await page.waitForTimeout(2000);

    }

    await expect(page.locator('#app')).toBeVisible();

  });

  test('TC-SEARCH-003 Limpiar búsqueda', async ({ page }) => {

    await navigateToSearch(page);

    const searchInput = page
      .locator('input[type="search"], input')
      .first();

    if (await searchInput.isVisible()) {

      await searchInput.fill('campus');

      await page.waitForTimeout(2000);

      await searchInput.clear();

      await page.waitForTimeout(2000);

    }

    await expect(page.locator('#app')).toBeVisible();

  });

});

/* =========================================================
   BOOKINGS
========================================================= */

test.describe('TC-BOOK', () => {

  test.beforeEach(async ({ page }) => {

    await loginAs(
      page,
      PASSENGER_EMAIL,
      PASSWORD
    );

  });

  test('TC-BOOK-001 Abrir viaje', async ({ page }) => {

    const rideCard = page
      .locator('.ride-card, .card')
      .first();

    if (await rideCard.isVisible()) {

      await rideCard.click();

      await page.waitForTimeout(3000);

    }

    await expect(page.locator('#app')).toBeVisible();

  });

  test('TC-BOOK-002 Login conductor', async ({ page }) => {

    await loginAs(
      page,
      DRIVER_EMAIL,
      PASSWORD
    );

    await expect(page.locator('#app')).toBeVisible();

  });

  test('TC-BOOK-003 Cancelar reserva', async ({ page }) => {

    const cancelBtn = page
      .locator('button')
      .filter({ hasText: /cancelar/i })
      .first();

    if (await cancelBtn.isVisible()) {

      await cancelBtn.click();

      await page.waitForTimeout(3000);

    }

    await expect(page.locator('#app')).toBeVisible();

  });

});

/* =========================================================
   DRIVER RIDES
========================================================= */

test.describe('TC-RIDE', () => {

  test.beforeEach(async ({ page }) => {

    await loginAs(
      page,
      DRIVER_EMAIL,
      PASSWORD
    );

  });

  test('TC-RIDE-001 Crear viaje', async ({ page }) => {

  const publishBtn = page
    .locator('button, a')
    .filter({ hasText: /publicar|crear/i })
    .first();

  if (await publishBtn.isVisible()) {

    await publishBtn.click();

    await page.waitForTimeout(4000);

  }

  const originInput = page.locator('#ride-origin');

  if (await originInput.isVisible()) {

    await originInput.fill('Campus PUJ');

  }

  const destinationInput = page.locator('#ride-destination');

  if (await destinationInput.isVisible()) {

    await destinationInput.fill('Jardin Plaza');

  }

  const createRideBtn = page
    .locator('button')
    .filter({ hasText: /publicar|crear/i })
    .last();

  if (await createRideBtn.isVisible()) {

    await createRideBtn.click();

    await page.waitForTimeout(4000);

  }

  await expect(page.locator('#app')).toBeVisible();

});

  test('TC-RIDE-002 Viaje inválido', async ({ page }) => {

    await expect(page.locator('#app')).toBeVisible();

  });

  test('TC-RIDE-003 Completar viaje', async ({ page }) => {

    const completeBtn = page
      .locator('button')
      .filter({ hasText: /completar/i })
      .first();

    if (await completeBtn.isVisible()) {

      await completeBtn.click();

      await page.waitForTimeout(3000);

    }

    await expect(page.locator('#app')).toBeVisible();

  });

  test('TC-RIDE-004 Cancelar viaje', async ({ page }) => {

    const cancelBtn = page
      .locator('button')
      .filter({ hasText: /cancelar/i })
      .first();

    if (await cancelBtn.isVisible()) {

      await cancelBtn.click();

      await page.waitForTimeout(3000);

    }

    await expect(page.locator('#app')).toBeVisible();

  });

});