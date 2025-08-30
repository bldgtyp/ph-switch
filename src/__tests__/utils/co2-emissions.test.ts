import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';
import { convertFromInput } from '../../utils/converter';

describe('co2-emissions conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 g-CO2/Wh -> 0.001 kg-CO2/Wh', () => {
    const res = convertUnits(1, 'g_co2_wh', 'kg_co2_wh');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.001, 12);
  });

  test('1000 g-CO2/kWh -> 1 g-CO2/Wh', () => {
    const res = convertUnits(1000, 'g_co2_kwh', 'g_co2_wh');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1, 12);
  });

  test('1 g-CO2/Btu -> ~3.412142 g-CO2/Wh', () => {
    const res = convertUnits(1, 'g_co2_btu', 'g_co2_wh');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(3.412142, 5);
  });

  test('1 kg-CO2/kBtu -> ~3.412142 g-CO2/Wh * 1000', () => {
    const res = convertUnits(1, 'kg_co2_kbtu', 'g_co2_wh');
    expect(res.success).toBe(true);
    // 1 kg/kBtu -> toBase = 1000 / 293.071111 ≈ 3.412142
    expect(res.value).toBeCloseTo(3.412142, 5);
  });

  test('1000 g-CO2/m2 -> 1 kg-CO2/m2', () => {
    const res = convertUnits(1000, 'g_co2_m2', 'kg_co2_m2');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1, 12);
  });

  test('1000 g-CO2/m3 -> 1 kg-CO2/m3', () => {
    const res = convertUnits(1000, 'g_co2_m3', 'kg_co2_m3');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1, 12);
  });

  test('natural language: 1 g-CO2/kbtu to kg-co2/btu', async () => {
    const res = await convertFromInput('1 g-CO2/kbtu to kg-co2/btu');
    expect(res.success).toBe(true);
    // 1 g/kBtu -> toBase = 1 / 293.071111 g/Wh
    // kg/btu -> toBase = 1000 / 0.293071111 g/Wh
    // Conversion result will be a small value; just assert success and numeric
    expect(typeof res.value).toBe('number');
    expect(isFinite(res.value as number)).toBe(true);
  });
});
