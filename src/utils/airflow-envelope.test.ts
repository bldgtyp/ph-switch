import { convertUnits } from './converter';
import { initializeConfigurations } from '../config';

describe('airflow-envelope conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 cfm/ft2 -> m3/hr/m2 equals 18.288', () => {
    const res = convertUnits(1, 'cfm_ft2', 'm3_hr_m2');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(18.288, 10);
  });

  test('1 l/s-m2 -> m3/hr/m2 equals 3.6', () => {
    const res = convertUnits(1, 'l_s_m2', 'm3_hr_m2');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(3.6, 10);
  });

  test('1 cfm/ft2 -> cfm/m2 equals ~10.76391', () => {
    const res = convertUnits(1, 'cfm_ft2', 'cfm_m2');
    expect(res.success).toBe(true);
    // 1 per ft2 -> per m2 should be ~10.7639104167
    expect(res.value).toBeCloseTo(10.7639104167, 8);
  });
});
