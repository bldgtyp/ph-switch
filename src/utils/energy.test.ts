import { initializeConfigurations, resetConfigurations } from '../config';
import { convertUnits } from './converter';

beforeAll(async () => {
  await initializeConfigurations();
});

afterAll(() => {
  resetConfigurations();
});

describe('energy conversions', () => {
  test('kWh <-> J', () => {
    const a = convertUnits(1, 'kwh', 'joule');
    expect(a.success).toBe(true);
    expect(a.value).toBeCloseTo(3600000, 8);

    const b = convertUnits(3600000, 'joule', 'kwh');
    expect(b.success).toBe(true);
    expect(b.value).toBeCloseTo(1, 8);
  });

  test('BTU <-> kWh', () => {
    const a = convertUnits(1000, 'btu', 'kwh');
    expect(a.success).toBe(true);
    // 1 BTU = 1055.05585262 J -> 1000 BTU = 1,055,055.85262 J -> /3.6e6 = 0.29307107 kWh
    expect(a.value).toBeCloseTo(0.29307107, 8);
  });

  test('calorie <-> joule', () => {
    const a = convertUnits(100, 'calorie', 'joule');
    expect(a.success).toBe(true);
    expect(a.value).toBeCloseTo(418.4, 6);
  });

  test('therm <-> kBtu', () => {
    const a = convertUnits(1, 'therm', 'kbtu');
    expect(a.success).toBe(true);
    // 1 therm = 100,000 BTU = 100,000 / 1000 kBtu = 100 kBtu
    expect(a.value).toBeCloseTo(100, 6);
  });
});
