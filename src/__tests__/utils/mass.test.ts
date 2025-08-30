import { initializeConfigurations, resetConfigurations } from '../../config';
import { convertUnits } from '../../utils/converter';

beforeAll(async () => {
  await initializeConfigurations();
});

afterAll(() => {
  resetConfigurations();
});

describe('mass conversions', () => {
  test('kg <-> g', () => {
    const a = convertUnits(2, 'kg', 'g');
    expect(a.success).toBe(true);
    expect(a.value).toBeCloseTo(2000, 12);

    const b = convertUnits(500, 'g', 'kg');
    expect(b.success).toBe(true);
    expect(b.value).toBeCloseTo(0.5, 12);
  });

  test('lb <-> kg', () => {
    const a = convertUnits(10, 'lb', 'kg');
    expect(a.success).toBe(true);
    expect(a.value).toBeCloseTo(4.5359237, 8);

    const b = convertUnits(2, 'kg', 'lb');
    expect(b.success).toBe(true);
    expect(b.value).toBeCloseTo(4.40924524, 8);
  });

  test('oz <-> g', () => {
    const a = convertUnits(16, 'oz', 'g');
    expect(a.success).toBe(true);
    expect(a.value).toBeCloseTo(453.59237, 8);
  });

  test('ton-metric <-> lb', () => {
    const a = convertUnits(1, 'ton-metric', 'lb');
    expect(a.success).toBe(true);
    expect(a.value).toBeCloseTo(2204.6226218, 6);
  });

  test('stone <-> lb', () => {
    const a = convertUnits(1, 'stone', 'lb');
    expect(a.success).toBe(true);
    expect(a.value).toBeCloseTo(14, 12);
  });
});
