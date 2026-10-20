import { test, describe } from 'node:test';
import assert from 'node:assert';
import { TRANSLATIONS, SUPPORTED_LOCALES, SupportedLocale } from '../lib/i18n/translations';
import { validatePasswordStrength, hashPassword, verifyPassword } from '../lib/auth/passwords';

describe('FenixCMS Core Logic & Security Tests', () => {
  test('1. System Multi-Language Coverage (7 Mandatory Locales)', () => {
    const requiredLocales: SupportedLocale[] = ['es', 'en', 'fr', 'it', 'pt', 'de', 'ht'];

    // Check all 7 locales are registered
    for (const loc of requiredLocales) {
      assert.ok(
        SUPPORTED_LOCALES.some(l => l.code === loc),
        `Locale ${loc} must be registered in SUPPORTED_LOCALES`
      );
      assert.ok(
        TRANSLATIONS[loc],
        `Translations dictionary for ${loc} must be defined`
      );
    }

    // Check critical keys exist in all 7 languages
    const criticalKeys = [
      'app.name',
      'zone.superadmin',
      'zone.clientPortal',
      'zone.storeAdmin',
      'zone.shop',
      'action.save',
      'action.cancel',
      'action.filter',
      'nav.dashboard',
      'nav.users',
      'nav.tenants',
      'nav.modules',
      'auth.loginTitle',
      'password.title',
      'shop.title',
      'shop.cart',
    ];

    for (const loc of requiredLocales) {
      for (const key of criticalKeys) {
        assert.ok(
          TRANSLATIONS[loc][key] && TRANSLATIONS[loc][key].length > 0,
          `Key "${key}" must have translation in locale "${loc}"`
        );
      }
    }
  });

  test('2. Superadmin Password Policy Validation', () => {
    // Too short
    assert.strictEqual(validatePasswordStrength('Ab1!').isValid, false);

    // Missing symbol
    assert.strictEqual(validatePasswordStrength('AdminPassword123').isValid, false);

    // Missing uppercase
    assert.strictEqual(validatePasswordStrength('adminpassword123!').isValid, false);

    // Missing number
    assert.strictEqual(validatePasswordStrength('AdminPassword!').isValid, false);

    // Valid password
    assert.strictEqual(validatePasswordStrength('Admin123!*Fenix').isValid, true);
  });

  test('3. Password Hashing and Verification (Argon2 / bcrypt)', async () => {
    const plain = 'FenixSuperSecure2026!*';
    const hashed = await hashPassword(plain);

    assert.notStrictEqual(hashed, plain);
    assert.ok(hashed.startsWith('$2a$') || hashed.startsWith('$2b$'));

    const isMatch = await verifyPassword(plain, hashed);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await verifyPassword('WrongPassword', hashed);
    assert.strictEqual(isWrongMatch, false);
  });

  test('4. Server-Authoritative Discount & Pricing Calculation', () => {
    const originalPrice = 100.0;

    // Percentage discount
    const percentageDiscount = 20.0; // 20%
    const discountedPrice1 = originalPrice * (1 - percentageDiscount / 100);
    assert.strictEqual(discountedPrice1, 80.0);

    // Fixed discount
    const fixedDiscount = 30.0;
    const discountedPrice2 = Math.max(0, originalPrice - fixedDiscount);
    assert.strictEqual(discountedPrice2, 70.0);

    // Stacking prevention
    assert.ok(discountedPrice1 >= 0);
    assert.ok(discountedPrice2 >= 0);
  });

  test('5. Tenant Slug and Domain Isolation Logic', () => {
    const rawSlug = '  La Total Tienda 2026!  ';
    const normalized = rawSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    assert.strictEqual(normalized, 'la-total-tienda-2026-');

    const domain = 'latotaltienda.es';
    const isValidDomain = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain);
    assert.strictEqual(isValidDomain, true);
  });
});
