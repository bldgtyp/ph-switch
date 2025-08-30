import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('humidity conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1000 g/kg -> 1 kg/kg', () => {
    const res = convertUnits(1000, 'g_kg', 'kg_kg');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1, 12);
  });

  test('1 lb/lb -> 1 kg/kg (via 0.001 factor)', () => {
    const res = convertUnits(1, 'lb_lb', 'kg_kg');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.001, 12);
  });

  test('1 kg/kg -> 1000 g/kg', () => {
    const res = convertUnits(1, 'kg_kg', 'g_kg');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1000, 12);
  });
});
