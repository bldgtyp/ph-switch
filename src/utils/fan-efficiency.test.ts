import { convertUnits } from './converter';
import { initializeConfigurations } from '../config';

describe('fan-efficiency conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 W/cfm -> 0.588577779 Wh/m3', () => {
    const res = convertUnits(1, 'w_cfm', 'wh_m3');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.588577779, 12);
  });

  test('1 Wh/m3 -> 1.699010796 W/cfm', () => {
    const res = convertUnits(1, 'wh_m3', 'w_cfm');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1.699010796, 8);
  });

  test('1 J/L -> 0.2777777777777778 Wh/m3', () => {
    const res = convertUnits(1, 'j_l', 'wh_m3');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.2777777777777778, 12);
  });

  test('1 kWh/m3 -> 1000 Wh/m3', () => {
    const res = convertUnits(1, 'kwh_m3', 'wh_m3');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(1000, 12);
  });

  test('1 W/cfh -> 35.31466674 Wh/m3', () => {
    const res = convertUnits(1, 'w_cfh', 'wh_m3');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(35.31466674, 8);
  });
});
