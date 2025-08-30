import { convertUnits } from '../../utils/converter';
import { initializeConfigurations } from '../../config';

describe('speed conversions', () => {
  beforeAll(async () => {
    await initializeConfigurations();
  });

  test('1 m/s -> 3.6 kph', () => {
    const res = convertUnits(1, 'm_s', 'kph');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(3.6, 12);
  });

  test('36 kph -> 10 m/s', () => {
    const res = convertUnits(36, 'kph', 'm_s');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(10, 12);
  });

  test('1 mph -> 0.44704 m/s', () => {
    const res = convertUnits(1, 'mph', 'm_s');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.44704, 8);
  });

  test('1 ft/min -> 0.00508 m/s', () => {
    const res = convertUnits(1, 'ft_min', 'm_s');
    expect(res.success).toBe(true);
    expect(res.value).toBeCloseTo(0.00508, 9);
  });
});
