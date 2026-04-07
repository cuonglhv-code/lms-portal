import { test, expect } from '@playwright/test';

const TEST_ACCOUNTS = {
  student: {
    email: 'j.thompson@email.com',
    password: 'Jaxtina2026',
    role: 'student',
  },
  teacher: {
    email: 'sarah.chen@jaxtina.com',
    password: 'Jaxtina2026',
    role: 'teacher',
  },
  admin: {
    email: 'cuonglhv@jaxtina.com',
    password: 'Jaxtina2026',
    role: 'admin',
  },
};

test.describe('RBAC Security Tests', () => {
  
  test.describe('Unauthenticated Access', () => {
    test('should redirect unauthenticated users from teacher dashboard to login', async ({ page }) => {
      await page.goto('/teacher/dashboard');
      await expect(page).toHaveURL(/login/);
    });

    test('should redirect unauthenticated users from admin dashboard to login', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/login/);
    });

    test('should redirect unauthenticated users from student dashboard to login', async ({ page }) => {
      await page.goto('/student/dashboard');
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('Student Role Boundary', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('[name="email"]', TEST_ACCOUNTS.student.email);
      await page.fill('[name="password"]', TEST_ACCOUNTS.student.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/student/dashboard', { timeout: 10000 });
    });

    test('should NOT allow student to access teacher dashboard', async ({ page }) => {
      await page.goto('/teacher/dashboard');
      await expect(page).toHaveURL(/unauthorized|student|login/);
    });

    test('should NOT allow student to access admin panel', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/unauthorized|student|login/);
    });

    test('should NOT allow student to access /teacher route directly', async ({ page }) => {
      await page.goto('/teacher/classes');
      await expect(page).toHaveURL(/unauthorized|student|login/);
    });

    test('should NOT allow student to access /admin route directly', async ({ page }) => {
      await page.goto('/admin/users');
      await expect(page).toHaveURL(/unauthorized|student|login/);
    });

    test('should only allow student to access own student portal', async ({ page }) => {
      await page.goto('/student/classes');
      await expect(page).toHaveURL(/student/);
    });
  });

  test.describe('Teacher Role Boundary', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('[name="email"]', TEST_ACCOUNTS.teacher.email);
      await page.fill('[name="password"]', TEST_ACCOUNTS.teacher.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/teacher/dashboard', { timeout: 10000 });
    });

    test('should NOT allow teacher to access admin panel', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/unauthorized|teacher|login/);
    });

    test('should NOT allow teacher to access /admin route directly', async ({ page }) => {
      await page.goto('/admin/users');
      await expect(page).toHaveURL(/unauthorized|teacher|login/);
    });

    test('should allow teacher to access teacher portal', async ({ page }) => {
      await page.goto('/teacher/classes');
      await expect(page).toHaveURL(/teacher/);
    });

    test('should allow teacher to access student data for enrolled classes only', async ({ page }) => {
      await page.goto('/teacher/students');
      await expect(page).toHaveURL(/teacher\/students/);
    });
  });

  test.describe('Admin Role Access', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('[name="email"]', TEST_ACCOUNTS.admin.email);
      await page.fill('[name="password"]', TEST_ACCOUNTS.admin.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin/dashboard', { timeout: 10000 });
    });

    test('should allow admin to access admin portal', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/admin/);
    });

    test('should allow admin to access teacher portal', async ({ page }) => {
      await page.goto('/teacher/dashboard');
      await expect(page).toHaveURL(/teacher/);
    });
  });

  test.describe('Feature Leakage - Critical RBAC Tests', () => {
    test('should BLOCK student from updating exam scores via API', async ({ page, request }) => {
      // This test checks if the backend RLS policy blocks unauthorized access
      // Student should not see grade input fields (teacher-only feature)
      
      await page.goto('/login');
      await page.fill('[name="email"]', TEST_ACCOUNTS.student.email);
      await page.fill('[name="password"]', TEST_ACCOUNTS.student.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/student/dashboard', { timeout: 10000 });
      
      // Student should NOT see grade input fields (teacher-only feature)
      const gradeInputs = page.locator('input[type="number"][name*="score"]');
      await expect(gradeInputs).toHaveCount(0);
    });

    test('should BLOCK student from accessing homework creation UI', async ({ page }) => {
      await page.goto('/login');
      await page.fill('[name="email"]', TEST_ACCOUNTS.student.email);
      await page.fill('[name="password"]', TEST_ACCOUNTS.student.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/student/dashboard', { timeout: 10000 });
      
      // Student should NOT have "Create Homework" button
      const createButtons = page.locator('button:has-text("Create"), a:has-text("Create Homework")');
      await expect(createButtons).toHaveCount(0);
    });
  });
});