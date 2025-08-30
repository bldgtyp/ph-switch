import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('heat-flow-1D conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 W/m-K -> 0.577789236 Btu/hr-ft-F', () => {
    const res = convertUnits(1, 'w_m_k', 'btu_hr_ft_f');
    expect(res.success).toBe(true);
    // 1 W/m-K = 1/1.730734908 Btu/hr-ft-F = 0.577789236 Btu/hr-ft-F
    expect(res.value).toBeCloseTo(0.577789236, 8);
  });

  test('1 Btu/hr-ft-F -> 1.730734908 W/m-K', () => {
    const res = convertUnits(1, 'btu_hr_ft_f', 'w_m_k');
    expect(res.success).toBe(true);
    // 1 Btu/hr-ft-F = 1.730734908 W/m-K
    expect(res.value).toBeCloseTo(1.730734908, 8);
  });

  test('1 hr-ft2-F/Btu-in -> W/m-K (reciprocal)', () => {
    const res = convertUnits(1, 'hr_ft2_f_btu_in', 'w_m_k');
    expect(res.success).toBe(true);
    // 1 hr-ft2-F/Btu-in = (1 / (1 * 12)) * 1.730734908 W/m-K
    const expected = (1 / (1 * 12)) * 1.730734908;
    expect(res.value).toBeCloseTo(expected, 4);
  });

  test('W/m-K -> hr-ft2-F/Btu-in (reciprocal)', () => {
    const inputValue = (1 / 12) * 1.730734908; // Calculate the actual W/m-K value from 1 hr-ft2-F/Btu-in
    const res = convertUnits(inputValue, 'w_m_k', 'hr_ft2_f_btu_in');
    expect(res.success).toBe(true);
    // Should convert back to ~1 hr-ft2-F/Btu-in
    expect(res.value).toBeCloseTo(1, 4);
  });

  test('conductivity to resistivity conversion', () => {
    const res = convertUnits(1, 'btu_hr_ft_f', 'hr_ft2_f_btu_in');
    expect(res.success).toBe(true);
    // 1 Btu/hr-ft-F = 1.730734908 W/m-K 
    // Using fromBase: 1 / ((x * 0.577789236) * 12)
    // So: 1 / ((1.730734908 * 0.577789236) * 12)
    const expected = 1 / ((1.730734908 * 0.577789236) * 12);
    expect(res.value).toBeCloseTo(expected, 6);
  });

  test('resistivity to conductivity conversion', () => {
    const res = convertUnits(1, 'hr_ft2_f_btu_in', 'btu_hr_ft_f');
    expect(res.success).toBe(true);
    // 1 hr-ft2-F/Btu-in -> W/m-K -> Btu/hr-ft-F
    // toBase: (1 / (1 * 12)) * 1.730734908 = W/m-K value
    // then W/m-K to Btu/hr-ft-F: W/m-K / 1.730734908
    const wMkValue = (1 / 12) * 1.730734908;
    const expected = wMkValue / 1.730734908;
    expect(res.value).toBeCloseTo(expected, 6);
  });
});
