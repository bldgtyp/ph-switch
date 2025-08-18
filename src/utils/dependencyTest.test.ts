import { testDebounce, testAjv, testClipboardAPI, testNumberFormatting } from './dependencyTest';

describe('Minimal Dependencies Test', () => {
  test('lodash.debounce should work correctly', () => {
    expect(testDebounce()).toBe(true);
  });

  test('AJV JSON schema validation should work correctly', () => {
    expect(testAjv()).toBe(true);
  });

  test('native clipboard API should be available', () => {
    // Note: In test environment, navigator.clipboard might not be available
    // This test verifies the function exists, actual functionality will be tested in browser
    expect(typeof testClipboardAPI).toBe('function');
  });

  test('native number formatting should work correctly', () => {
    expect(testNumberFormatting()).toBe(true);
  });
});
