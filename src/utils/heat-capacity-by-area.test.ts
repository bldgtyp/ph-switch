import { convertUnits } from './converter';
import { initializeConfigurations } from '../config';

describe('heat-capacity-by-area conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 Btu/ft2-F -> 5.678264134 Wh/m2-K', () => {
    const res = convertUnits(1, 'btu_ft2_f', 'wh_m2_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(5.678264134, 10);
  });

  test('1 Wh/ft2-F -> 19.37503875 Wh/m2-K', () => {
    const res = convertUnits(1, 'wh_ft2_f', 'wh_m2_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(19.37503875, 10);
  });

  test('1 Wh/m2-K -> 0.176110159 Btu/ft2-F', () => {
    const res = convertUnits(1, 'wh_m2_k', 'btu_ft2_f');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.176110159, 9);
  });
});
