// Unit tests for area conversions
import { convertUnits, convertFromInput } from './converter';
import { initializeConfigurations, resetConfigurations } from '../config';

beforeAll(async () => {
  await initializeConfigurations();
});

afterAll(() => {
  resetConfigurations();
});

describe('Area conversions', () => {
  it('should convert 1 m2 to cm2', () => {
    const result = convertUnits(1, 'm2', 'cm2');
    expect(result.success).toBe(true);
    // 1 m^2 = 10,000 cm^2
    expect(result.value).toBeCloseTo(10000, 6);
    expect(result.formattedValue).toBeDefined();
  });

  it('should convert 1 cm2 to m2', () => {
    const result = convertUnits(10000, 'cm2', 'm2');
    expect(result.success).toBe(true);
    expect(result.value).toBeCloseTo(1, 6);
  });

  it('should convert 1 acre to m2', () => {
    const result = convertUnits(1, 'acre', 'm2');
    expect(result.success).toBe(true);
    // acre = 4046.8564224 m^2
    expect(result.value).toBeCloseTo(4046.8564224, 6);
  });

  it('should handle natural-language input for area', async () => {
    const r1 = await convertFromInput('1 m2 to cm2');
    expect(r1.success).toBe(true);
    expect(r1.value).toBeCloseTo(10000, 6);

    const r2 = await convertFromInput('1 acre to m2');
    expect(r2.success).toBe(true);
    expect(r2.value).toBeCloseTo(4046.8564224, 6);
  });
});
