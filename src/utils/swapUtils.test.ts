import { swapUnitsInInput, canSwapUnits } from './swapUtils';

describe('Swap Utilities', () => {
  describe('swapUnitsInInput', () => {
    test('swaps units in simple conversion', () => {
      const input = '13 meters as feet';
      const result = swapUnitsInInput(input);

      expect(result).toBe('42.65 feet as meters');
    });

    test('swaps units with "to" keyword', () => {
      const input = '5 km to miles';
      const result = swapUnitsInInput(input);

      expect(result).toBe('3.107 miles to kilometers');
    });

    test('swaps units with decimal values', () => {
      const input = '3.5 feet as meters';
      const result = swapUnitsInInput(input);

      expect(result).toBe('1.067 meters as feet');
    });

    test('handles abbreviations correctly', () => {
      const input = '100 cm to inches';
      const result = swapUnitsInInput(input);

      expect(result).toBe('39.37 inches to centimeters');
    });

    test('returns original input for invalid format', () => {
      const input = 'invalid input';
      const result = swapUnitsInInput(input);

      expect(result).toBe('invalid input');
    });

    test('returns original input for unparseable units', () => {
      const input = '13 unknown as invalid';
      const result = swapUnitsInInput(input);

      expect(result).toBe('13 unknown as invalid');
    });
  });

  describe('canSwapUnits', () => {
    test('returns true for valid conversion input', () => {
      const input = '13 meters as feet';
      const result = canSwapUnits(input);

      expect(result).toBe(true);
    });

    test('returns true for input with "to" keyword', () => {
      const input = '5 km to miles';
      const result = canSwapUnits(input);

      expect(result).toBe(true);
    });

    test('returns false for invalid format', () => {
      const input = 'invalid input';
      const result = canSwapUnits(input);

      expect(result).toBe(false);
    });

    test('returns false for incomplete input', () => {
      const input = '13 meters';
      const result = canSwapUnits(input);

      expect(result).toBe(false);
    });

    test('returns false for unknown units', () => {
      const input = '13 unknown as invalid';
      const result = canSwapUnits(input);

      expect(result).toBe(false);
    });
  });
});
