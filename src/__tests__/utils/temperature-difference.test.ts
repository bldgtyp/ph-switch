import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('temperature-difference conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 delta-F -> 0.555555556 delta-K', () => {
    const res = convertUnits(1, 'delta_f', 'delta_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.555555556, 9);
  });

  test('1 delta-K -> 1 delta-C', () => {
    const res = convertUnits(1, 'delta_k', 'delta_c');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1, 12);
  });

  test('10 delta-F -> 5.55555556 delta-C', () => {
    const res = convertUnits(10, 'delta_f', 'delta_c');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(5.55555556, 8);
  });
});
