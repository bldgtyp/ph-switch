import { convertUnits } from './converter';
import { initializeConfigurations } from '../config';

describe('power-intensity conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 Btu/hr-ft2 -> W/m2 equals ~3.154591186', () => {
    const res = convertUnits(1, 'btu_hr_ft2', 'w_m2');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(3.154591186, 9);
  });

  test('1 W/ft2 -> Btu/hr-ft2 equals ~3.154591186 (scaled)', () => {
    const res = convertUnits(1, 'w_ft2', 'btu_hr_ft2');
    expect(res.success).toBe(true);
    // 1 W/ft2 -> m2 base: 10.76391042 W/m2; then to Btu/hr-ft2 factor: /3.154591186
    const expected = 10.76391042 / 3.154591186;
    expect(res.value).toBeCloseTo(expected, 9);
  });

  test('kBtu/hr-ft2 -> kW/m2 equivalence', () => {
    const res = convertUnits(1, 'kbtu_hr_ft2', 'kw_m2');
    expect(res.success).toBe(true);
    // 1 kBtu/hr-ft2 = 1000 * 3.154591186 W/m2 = 3154.591186 W/m2 = 3.154591186 kW/m2
    expect(res.value).toBeCloseTo(3.154591186, 9);
  });
});
