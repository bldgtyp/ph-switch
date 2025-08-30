import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('heat-capacity-by-volume conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 Btu/ft3-F -> 0.067066112 MJ/m3-K', () => {
    const res = convertUnits(1, 'btu_ft3_f', 'mj_m3_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.067066112, 12);
  });

  test('1 Wh/ft3-F -> 0.22883904 MJ/m3-K', () => {
    const res = convertUnits(1, 'wh_ft3_f', 'mj_m3_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.22883904, 12);
  });

  test('1 MJ/m3-K -> 4.369883733 Wh/ft3-F', () => {
    const res = convertUnits(1, 'mj_m3_k', 'wh_ft3_f');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(4.369883733, 6);
  });

  test('1 MJ/m3-K -> 14.91066014 Btu/ft3-F', () => {
    const res = convertUnits(1, 'mj_m3_k', 'btu_ft3_f');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(14.91066014, 6);
  });
});
