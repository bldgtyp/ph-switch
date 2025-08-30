import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('heat-capacity-by-mass conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 Btu/lb-F -> 4186.800585 J/kg-K', () => {
    const res = convertUnits(1, 'btu_lb_f', 'j_kg_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(4186.800585, 9);
  });

  test('1 J/kg-K -> 0.0002388458633 Btu/lb-F', () => {
    const res = convertUnits(1, 'j_kg_k', 'btu_lb_f');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.0002388458633, 12);
  });

  test('1 kBtu/lb-F -> 4186800.585 J/kg-K', () => {
    const res = convertUnits(1, 'kbtu_lb_f', 'j_kg_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(4186800.585, 6);
  });

  test('1 kJ/kg-K -> 1000 J/kg-K', () => {
    const res = convertUnits(1, 'kj_kg_k', 'j_kg_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1000, 12);
  });

  test('1 Wh/kg-K -> 3600 J/kg-K', () => {
    const res = convertUnits(1, 'wh_kg_k', 'j_kg_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(3600, 12);
  });

  test('1 kWh/kg-K -> 3600000 J/kg-K', () => {
    const res = convertUnits(1, 'kwh_kg_k', 'j_kg_k');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(3600000, 6);
  });
});
