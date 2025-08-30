import { initializeConfigurations, resetConfigurations } from '../../config';
import { convertUnits } from '../../utils/converter';

beforeAll(async () => {
  await initializeConfigurations();
});

afterAll(() => {
  resetConfigurations();
});

describe('power conversions', () => {
  test('W <-> kW', () => {
    const a = convertUnits(1500, 'w', 'kw');
    expect(a.success).toBe(true);
    expect(a.value).toBeCloseTo(1.5, 12);

    const b = convertUnits(2, 'kw', 'w');
    expect(b.success).toBe(true);
    expect(b.value).toBeCloseTo(2000, 12);
  });

  test('BTU/hr <-> W', () => {
    const a = convertUnits(12000, 'btu/hr', 'w');
    expect(a.success).toBe(true);
    // 1 BTU/hr = 0.29307107 W, so 12000 BTU/hr = 3516.85284 W
    expect(a.value).toBeCloseTo(3516.85284, 6);
  });

  test('ton-cooling <-> kW', () => {
    const a = convertUnits(1, 'ton-cooling', 'kw');
    expect(a.success).toBe(true);
    // 1 ton = 3516.85284 W = 3.51685284 kW
    expect(a.value).toBeCloseTo(3.51685284, 8);
  });
});
