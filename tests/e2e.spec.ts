import { test, expect } from '@playwright/test';

test('home loads and health endpoint works', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/ZOXAA/i);

  const resp = await page.request.get('/api/health');
  expect(resp.ok()).toBeTruthy();
  const json = await resp.json();
  expect(json.status).toBe('OK');
});
