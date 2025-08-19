import { convertUnits } from './converter';
import { initializeConfigurations } from '../config';

describe('airflow conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });
  test('happy path: 100 cfm to m3/s', () => {
    const res = convertUnits(100, 'cfm', 'm3_s');
    expect(res.success).toBe(true);
    // 1 cfm ≈ 0.0004719474 m3/s, so 100 cfm ≈ 0.04719474 m3/s
    expect(res.value).toBeCloseTo(0.04719474, 8);
    // formattedValue uses 6 decimal places for values >= 0.001, which rounds to 0.047195
    expect(res.formattedValue).toBe('0.047195');
  });

  test('edge case: zero value converts correctly', () => {
    const res = convertUnits(0, 'cfm', 'm3_s');
    expect(res.success).toBe(true);
    expect(res.value).toBe(0);
    expect(res.formattedValue).toBe('0');
  });

  test('edge case: very small m3/s to cfm', () => {
    // Convert a very small base flow to cfm and ensure precision and non-zero reduction
    const tiny = 1e-9; // m3/s
    const res = convertUnits(tiny, 'm3_s', 'cfm');
    expect(res.success).toBe(true);
    // tiny / 0.0004719474 = tiny * (1 / 0.0004719474)
    const expected = tiny / 0.0004719474;
    expect(res.value).toBeCloseTo(expected, 12);
  });
});
