import { convertUnits } from './converter';
import { initializeConfigurations } from '../config';

describe('energy-efficiency conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 Btu/Wh -> W/W equals ~0.293071111', () => {
    const res = convertUnits(1, 'btu_per_wh', 'w_per_w');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.293071111, 9);
  });

  test('1 W/W -> Btu/Wh equals ~3.412141156', () => {
    const res = convertUnits(1, 'w_per_w', 'btu_per_wh');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(3.412141156, 8);
  });

  test('SEER-IP numeric equivalence to Btu/Wh', () => {
    const res = convertUnits(10, 'seer_ip', 'btu_per_wh');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(10, 9); // identity in Btu/Wh space
  });
});
