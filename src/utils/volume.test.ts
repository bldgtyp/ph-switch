// Unit tests for volume conversions
import { convertUnits, convertFromInput } from './converter';
import { initializeConfigurations, resetConfigurations } from '../config';

beforeAll(async () => {
  await initializeConfigurations();
});

afterAll(() => {
  resetConfigurations();
});

describe('Volume conversions', () => {
  it('should convert 1 m3 to cm3', () => {
    const result = convertUnits(1, 'm3', 'cm3');
    expect(result.success).toBe(true);
    // 1 m^3 = 1,000,000 cm^3
    expect(result.value).toBeCloseTo(1000000, 6);
    expect(result.formattedValue).toBeDefined();
  });

  it('should convert 1 gallon to L', () => {
    const result = convertUnits(1, 'gallon', 'L');
    expect(result.success).toBe(true);
    // 1 US gallon = 3.785411784 liters
    expect(result.value).toBeCloseTo(3.785411784, 9);
  });

  it('should handle natural-language input for volume', async () => {
    const r1 = await convertFromInput('1 m3 to cm3');
    expect(r1.success).toBe(true);
    expect(r1.value).toBeCloseTo(1000000, 6);

    const r2 = await convertFromInput('1 gallon to L');
    expect(r2.success).toBe(true);
    expect(r2.value).toBeCloseTo(3.785411784, 9);
  });
});
