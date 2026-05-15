// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({

  testDir: './tests',

  fullyParallel: false,

  workers: 1,

  timeout: 60000,

  use: {

    baseURL: 'http://127.0.0.1:5501',

    headless: false,

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    actionTimeout: 20000,

    navigationTimeout: 20000

  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]

});