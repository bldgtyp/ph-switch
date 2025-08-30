import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('pressure conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 inHg -> 3386.39 Pa', () => {
    const res = convertUnits(1, 'inhg', 'pa');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(3386.39, 6);
  });

  test('1 inWC -> 249.0889083 Pa', () => {
    const res = convertUnits(1, 'inwc', 'pa');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(249.0889083, 8);
  });

  test('1 bar -> 100000 Pa', () => {
    const res = convertUnits(1, 'bar', 'pa');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(100000, 6);
  });

  test('1 psi -> 6894.76 Pa', () => {
    const res = convertUnits(1, 'psi', 'pa');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(6894.76, 5);
  });

  test('101325 Pa -> 1 atm', () => {
    const res = convertUnits(101325, 'pa', 'atm');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1, 6);
  });

  test('1 Torr -> 133.322 Pa', () => {
    const res = convertUnits(1, 'torr', 'pa');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(133.322, 6);
  });
});
