import { initializeConfigurations, resetConfigurations } from '../../config';
import { convertFromInput } from '../../utils/converter';

beforeAll(async () => {
  await initializeConfigurations();
});

afterAll(() => {
  resetConfigurations();
});

describe('integration: parse -> validate -> convert (airflow)', () => {
  test('5 cfm to m3/h (using "to")', async () => {
    const res = await convertFromInput('5 cfm to m3/h');
    expect(res.success).toBe(true);
    // Compute expected value using the configured cfm->m3/s factor to match runtime
    const cfmToM3s = 0.0004719474; // matches src/config/airflow.json
    const expected = 5 * cfmToM3s * 3600; // m3/h
    expect(res.value).toBeCloseTo(expected, 8);
  });

  test('5 cfm to m3/h (using "as")', async () => {
    const res = await convertFromInput('5 cfm as m3/h');
    expect(res.success).toBe(true);
    const cfmToM3s = 0.0004719474;
    const expected = 5 * cfmToM3s * 3600;
    expect(res.value).toBeCloseTo(expected, 8);
  });
});
