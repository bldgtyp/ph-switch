import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('heat-flow conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 W/K -> 1.895633976 Btu/hr-F', () => {
    const res = convertUnits(1, 'w_k', 'btu_hr_f');
    expect(res.success).toBe(true);
    // 1 W/K = 1/0.527528 Btu/hr-F = 1.895633976 Btu/hr-F
    expect(res.value).toBeCloseTo(1.895633976, 8);
  });

  test('1 Btu/hr-F -> 0.527528 W/K', () => {
    const res = convertUnits(1, 'btu_hr_f', 'w_k');
    expect(res.success).toBe(true);
    // 1 Btu/hr-F = 0.527528 W/K
    expect(res.value).toBeCloseTo(0.527528, 8);
  });

  test('bidirectional conversion - W/K to Btu/hr-F and back', () => {
    const originalValue = 5.5;

    // Convert W/K to Btu/hr-F
    const toBtu = convertUnits(originalValue, 'w_k', 'btu_hr_f');
    expect(toBtu.success).toBe(true);
    expect(toBtu.value).toBeDefined();

    // Convert back to W/K
    const backToWK = convertUnits(toBtu.value!, 'btu_hr_f', 'w_k');
    expect(backToWK.success).toBe(true);
    expect(backToWK.value).toBeCloseTo(originalValue, 6);
  });

  test('bidirectional conversion - Btu/hr-F to W/K and back', () => {
    const originalValue = 2.5;

    // Convert Btu/hr-F to W/K
    const toWK = convertUnits(originalValue, 'btu_hr_f', 'w_k');
    expect(toWK.success).toBe(true);
    expect(toWK.value).toBeDefined();

    // Convert back to Btu/hr-F
    const backToBtu = convertUnits(toWK.value!, 'w_k', 'btu_hr_f');
    expect(backToBtu.success).toBe(true);
    expect(backToBtu.value).toBeCloseTo(originalValue, 6);
  });

  test('verify conversion factor accuracy', () => {
    // Test the exact conversion factors from the prompt
    const res1 = convertUnits(1, 'btu_hr_f', 'w_k');
    expect(res1.success).toBe(true);
    expect(res1.value).toBeCloseTo(0.527528, 6);

    const res2 = convertUnits(1, 'w_k', 'btu_hr_f');
    expect(res2.success).toBe(true);
    expect(res2.value).toBeCloseTo(1.895633976, 6);
  });

  test('conversion with decimal values', () => {
    const res = convertUnits(3.14159, 'w_k', 'btu_hr_f');
    expect(res.success).toBe(true);
    const expected = 3.14159 / 0.527528;
    expect(res.value).toBeCloseTo(expected, 6);
  });
});
