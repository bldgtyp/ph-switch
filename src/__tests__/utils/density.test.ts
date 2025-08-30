import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('density conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1000 g/m3 -> 1 kg/m3', () => {
    const res = convertUnits(1000, 'g_m3', 'kg_m3');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1, 12);
  });

  test('1 lb/ft3 -> ~16.018463374 kg/m3', () => {
    const res = convertUnits(1, 'lb_ft3', 'kg_m3');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(16.018463373962, 9);
  });

  test('1 lb/in3 -> ~27679.904710192 kg/m3', () => {
    const res = convertUnits(1, 'lb_in3', 'kg_m3');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(27679.904710192, 6);
  });
});
