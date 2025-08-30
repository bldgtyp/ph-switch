import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('heat-flow-2D conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 W/m2-K -> 0.176110159 Btu/hr-ft2-F', () => {
    const res = convertUnits(1, 'w_m2_k', 'btu_hr_ft2_f');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.176110159, 8);
  });

  test('1 Btu/hr-ft2-F -> 5.678264134 W/m2-K', () => {
    const res = convertUnits(1, 'btu_hr_ft2_f', 'w_m2_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(5.678264134, 8);
  });

  test('1 hr-ft2-F/Btu -> 5.678264134 W/m2-K (reciprocal)', () => {
    const res = convertUnits(1, 'hr_ft2_f_btu', 'w_m2_k');
    expect(res.success).toBe(true);
    // 1 hr-ft2-F/Btu = 5.678264134/1 W/m2-K = 5.678264134 W/m2-K
    expect(res.value).toBeCloseTo(5.678264134, 8);
  });

  test('5.678264134 W/m2-K -> 1 hr-ft2-F/Btu (reciprocal)', () => {
    const res = convertUnits(5.678264134, 'w_m2_k', 'hr_ft2_f_btu');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1, 8);
  });

  test('transmittance to resistance conversion', () => {
    // 1 Btu/hr-ft2-F transmittance should give 1 hr-ft2-F/Btu resistance
    const res = convertUnits(1, 'btu_hr_ft2_f', 'hr_ft2_f_btu');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1, 8);
  });

  test('resistance to transmittance conversion', () => {
    // 1 hr-ft2-F/Btu resistance should give 1 Btu/hr-ft2-F transmittance
    const res = convertUnits(1, 'hr_ft2_f_btu', 'btu_hr_ft2_f');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1, 8);
  });
});
