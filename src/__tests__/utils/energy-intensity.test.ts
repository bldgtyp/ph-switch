import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('energy-intensity conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 kBtu/ft2 -> kWh/m2 equals ~3.154591186', () => {
    const res = convertUnits(1, 'kbtu_ft2', 'kwh_m2');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(3.154591186, 9);
  });

  test('1 kWh/ft2 -> kBtu/ft2 equals ~3.412141156', () => {
    const res = convertUnits(1, 'kwh_ft2', 'kbtu_ft2');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(3.412141156, 8);
  });

  test('1 kWh/m2 -> kWh/ft2 equals ~0.09290304', () => {
    const res = convertUnits(1, 'kwh_m2', 'kwh_ft2');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.09290304, 9);
  });
});
