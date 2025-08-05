import {
  convertUnits,
  findUnit,
  parseInput,
  calculatePrecision,
  canConvert,
} from '../utils/conversions';
import { lengthUnits } from '../data/units';
import { ConversionRequest } from '../types/units';

describe('Unit Conversion System', () => {
  describe('findUnit', () => {
    test('should find unit by exact name', () => {
      const unit = findUnit('meter');
      expect(unit).toBeDefined();
      expect(unit?.id).toBe('meter');
    });

    test('should find unit by symbol', () => {
      const unit = findUnit('m');
      expect(unit).toBeDefined();
      expect(unit?.id).toBe('meter');
    });

    test('should find unit by alias case-insensitive', () => {
      const unit = findUnit('FEET');
      expect(unit).toBeDefined();
      expect(unit?.id).toBe('foot');
    });

    test('should find unit with plural form', () => {
      const unit = findUnit('meters');
      expect(unit).toBeDefined();
      expect(unit?.id).toBe('meter');
    });

    test('should return undefined for unknown unit', () => {
      const unit = findUnit('unknown');
      expect(unit).toBeUndefined();
    });

    test('should handle whitespace', () => {
      const unit = findUnit('  foot  ');
      expect(unit).toBeDefined();
      expect(unit?.id).toBe('foot');
    });
  });

  describe('convertUnits', () => {
    test('should convert meters to feet correctly', () => {
      const request: ConversionRequest = {
        value: 1,
        sourceUnitId: 'meter',
        targetUnitId: 'foot',
      };

      const result = convertUnits(request);
      expect(result.originalValue).toBe(1);
      expect(result.convertedValue).toBeCloseTo(3.281, 3);
      expect(result.sourceUnit.id).toBe('meter');
      expect(result.targetUnit.id).toBe('foot');
    });

    test('should convert feet to meters correctly', () => {
      const request: ConversionRequest = {
        value: 3.281,
        sourceUnitId: 'foot',
        targetUnitId: 'meter',
      };

      const result = convertUnits(request);
      expect(result.convertedValue).toBeCloseTo(1, 3);
    });

    test('should handle same unit conversion', () => {
      const request: ConversionRequest = {
        value: 5,
        sourceUnitId: 'meter',
        targetUnitId: 'meter',
      };

      const result = convertUnits(request);
      expect(result.convertedValue).toBe(5);
    });

    test('should convert kilometers to miles', () => {
      const request: ConversionRequest = {
        value: 1,
        sourceUnitId: 'kilometer',
        targetUnitId: 'mile',
      };

      const result = convertUnits(request);
      expect(result.convertedValue).toBeCloseTo(0.621, 3);
    });

    test('should convert inches to centimeters', () => {
      const request: ConversionRequest = {
        value: 1,
        sourceUnitId: 'inch',
        targetUnitId: 'centimeter',
      };

      const result = convertUnits(request);
      expect(result.convertedValue).toBeCloseTo(2.54, 2);
    });

    test('should throw error for non-existent source unit', () => {
      const request: ConversionRequest = {
        value: 1,
        sourceUnitId: 'nonexistent',
        targetUnitId: 'meter',
      };

      expect(() => convertUnits(request)).toThrow('Unit not found');
    });

    test('should throw error for non-existent target unit', () => {
      const request: ConversionRequest = {
        value: 1,
        sourceUnitId: 'meter',
        targetUnitId: 'nonexistent',
      };

      expect(() => convertUnits(request)).toThrow('Unit not found');
    });
  });

  describe('calculatePrecision', () => {
    test('should return appropriate precision for large kilometer values', () => {
      const kmUnit = lengthUnits.find((u) => u.id === 'kilometer')!;
      expect(calculatePrecision(1500, kmUnit)).toBe(0);
      expect(calculatePrecision(150, kmUnit)).toBe(1);
      expect(calculatePrecision(15, kmUnit)).toBe(2);
      expect(calculatePrecision(1.5, kmUnit)).toBe(3);
    });

    test('should return appropriate precision for small millimeter values', () => {
      const mmUnit = lengthUnits.find((u) => u.id === 'millimeter')!;
      expect(calculatePrecision(1500, mmUnit)).toBe(0);
      expect(calculatePrecision(150, mmUnit)).toBe(1);
      expect(calculatePrecision(15, mmUnit)).toBe(2);
      expect(calculatePrecision(1.5, mmUnit)).toBe(3);
      expect(calculatePrecision(0.5, mmUnit)).toBe(4);
    });

    test('should return appropriate precision for medium values', () => {
      const meterUnit = lengthUnits.find((u) => u.id === 'meter')!;
      expect(calculatePrecision(1500, meterUnit)).toBe(0);
      expect(calculatePrecision(150, meterUnit)).toBe(1);
      expect(calculatePrecision(15, meterUnit)).toBe(2);
      expect(calculatePrecision(1.5, meterUnit)).toBe(3);
      expect(calculatePrecision(0.5, meterUnit)).toBe(4);
    });
  });

  describe('parseInput', () => {
    test('should parse valid input with "as" keyword', () => {
      const result = parseInput('13 meters as feet');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(13);
      expect(result.sourceUnit).toBe('meters');
      expect(result.targetUnit).toBe('feet');
      expect(result.keyword).toBe('as');
    });

    test('should parse valid input with "to" keyword', () => {
      const result = parseInput('5.5 km to miles');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(5.5);
      expect(result.sourceUnit).toBe('km');
      expect(result.targetUnit).toBe('miles');
      expect(result.keyword).toBe('to');
    });

    test('should handle decimal values', () => {
      const result = parseInput('3.14 meters as feet');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(3.14);
    });

    test('should handle case-insensitive keywords', () => {
      const result = parseInput('10 meters AS feet');
      expect(result.isValid).toBe(true);
      expect(result.keyword).toBe('as');
    });

    test('should handle extra whitespace', () => {
      const result = parseInput('  10   meters   as   feet  ');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(10);
      expect(result.sourceUnit).toBe('meters');
      expect(result.targetUnit).toBe('feet');
    });

    test('should reject empty input', () => {
      const result = parseInput('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input is empty');
    });

    test('should reject invalid format', () => {
      const result = parseInput('invalid input');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid format');
    });

    test('should reject values below minimum', () => {
      const result = parseInput('0.0001 meters as feet');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain(
        'Value must be between 0.001 and 999,999,999'
      );
    });

    test('should reject values above maximum', () => {
      const result = parseInput('1000000000 meters as feet');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain(
        'Value must be between 0.001 and 999,999,999'
      );
    });

    test('should accept minimum valid value', () => {
      const result = parseInput('0.001 meters as feet');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0.001);
    });

    test('should accept maximum valid value', () => {
      const result = parseInput('999999999 meters as feet');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(999999999);
    });
  });

  describe('canConvert', () => {
    test('should allow conversion between units in same category', () => {
      const meterUnit = lengthUnits.find((u) => u.id === 'meter')!;
      const footUnit = lengthUnits.find((u) => u.id === 'foot')!;
      expect(canConvert(meterUnit, footUnit)).toBe(true);
    });

    test('should allow conversion between any length units', () => {
      const allPairs = [];
      for (let i = 0; i < lengthUnits.length; i++) {
        for (let j = 0; j < lengthUnits.length; j++) {
          allPairs.push([lengthUnits[i], lengthUnits[j]]);
        }
      }

      allPairs.forEach(([unit1, unit2]) => {
        expect(canConvert(unit1, unit2)).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {
    test('should complete full conversion workflow', () => {
      // Parse input
      const parsed = parseInput('13 meters as feet');
      expect(parsed.isValid).toBe(true);

      // Find units
      const sourceUnit = findUnit(parsed.sourceUnit);
      const targetUnit = findUnit(parsed.targetUnit);
      expect(sourceUnit).toBeDefined();
      expect(targetUnit).toBeDefined();

      // Check if conversion is possible
      expect(canConvert(sourceUnit!, targetUnit!)).toBe(true);

      // Perform conversion
      const request: ConversionRequest = {
        value: parsed.value,
        sourceUnitId: sourceUnit!.id,
        targetUnitId: targetUnit!.id,
      };

      const result = convertUnits(request);
      expect(result.convertedValue).toBeCloseTo(42.65, 2);
    });

    test('should handle real-world conversion examples', () => {
      const testCases = [
        { input: '1 mile as kilometers', expected: 1.609344 },
        { input: '100 centimeters as meters', expected: 1 },
        { input: '12 inches as feet', expected: 1 },
        { input: '1000 millimeters as meters', expected: 1 },
        { input: '1 yard as feet', expected: 3 },
      ];

      testCases.forEach((testCase) => {
        const parsed = parseInput(testCase.input);
        expect(parsed.isValid).toBe(true);

        const sourceUnit = findUnit(parsed.sourceUnit);
        const targetUnit = findUnit(parsed.targetUnit);

        const request: ConversionRequest = {
          value: parsed.value,
          sourceUnitId: sourceUnit!.id,
          targetUnitId: targetUnit!.id,
        };

        const result = convertUnits(request);
        expect(result.convertedValue).toBeCloseTo(testCase.expected, 3);
      });
    });
  });
});
