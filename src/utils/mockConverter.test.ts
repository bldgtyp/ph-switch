import {
  mockConvert,
  mockParseInput,
  mockConvertInput,
  MockConversionErrorType,
} from './mockConverter';

describe('Mock Converter', () => {
  describe('mockConvert', () => {
    test('should convert meters to feet correctly', () => {
      const result = mockConvert(1, 'meter', 'foot');
      expect(result.success).toBe(true);
      expect(result.value).toBe('3.281');
      expect(result.rawValue).toBeCloseTo(3.28084, 5);
      expect(result.sourceUnit).toBe('meter');
      expect(result.targetUnit).toBe('foot');
    });

    test('should convert feet to inches correctly', () => {
      const result = mockConvert(2, 'foot', 'inch');
      expect(result.success).toBe(true);
      expect(result.value).toBe('24.000');
      expect(result.rawValue).toBe(24);
    });

    test('should handle unit aliases correctly', () => {
      const result = mockConvert(100, 'cm', 'm');
      expect(result.success).toBe(true);
      expect(result.value).toBe('1.000');
      expect(result.rawValue).toBe(1);
    });

    test('should format large numbers with comma separators', () => {
      const result = mockConvert(1, 'kilometer', 'millimeter');
      expect(result.success).toBe(true);
      expect(result.value).toBe('1,000,000.000');
      expect(result.rawValue).toBe(1000000);
    });

    test('should handle decimal values correctly', () => {
      const result = mockConvert(2.5, 'meter', 'centimeter');
      expect(result.success).toBe(true);
      expect(result.value).toBe('250.000');
      expect(result.rawValue).toBe(250);
    });

    test('should return error for unknown source unit', () => {
      const result = mockConvert(1, 'unknown', 'meter');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(MockConversionErrorType.UNKNOWN_UNIT);
      expect(result.error?.message).toContain('Unknown unit');
      expect(result.error?.suggestions).toBeDefined();
    });

    test('should return error for unknown target unit', () => {
      const result = mockConvert(1, 'meter', 'unknown');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(MockConversionErrorType.UNKNOWN_UNIT);
      expect(result.error?.message).toContain('Unknown unit');
    });

    test('should provide unit suggestions for similar units', () => {
      const result = mockConvert(1, 'mtr', 'foot');
      expect(result.success).toBe(false);
      expect(result.error?.suggestions).toEqual(
        expect.arrayContaining(['m'])
      );
      expect(result.error?.suggestions).toHaveLength(3);
    });
  });

  describe('mockParseInput', () => {
    test('should parse "X unit to Y unit" format correctly', () => {
      const result = mockParseInput('5 meters to feet');
      expect(result.success).toBe(true);
      expect(result.value).toBe(5);
      expect(result.fromUnit).toBe('meters');
      expect(result.toUnit).toBe('feet');
    });

    test('should parse "X unit as Y unit" format correctly', () => {
      const result = mockParseInput('10 ft as inches');
      expect(result.success).toBe(true);
      expect(result.value).toBe(10);
      expect(result.fromUnit).toBe('ft');
      expect(result.toUnit).toBe('inches');
    });

    test('should handle decimal values', () => {
      const result = mockParseInput('2.5 inches to millimeters');
      expect(result.success).toBe(true);
      expect(result.value).toBe(2.5);
      expect(result.fromUnit).toBe('inches');
      expect(result.toUnit).toBe('millimeters');
    });

    test('should handle case insensitive input', () => {
      const result = mockParseInput('100 CM TO M');
      expect(result.success).toBe(true);
      expect(result.value).toBe(100);
      expect(result.fromUnit).toBe('cm');
      expect(result.toUnit).toBe('m');
    });

    test('should handle extra whitespace', () => {
      const result = mockParseInput('  3  meters   to   feet  ');
      expect(result.success).toBe(true);
      expect(result.value).toBe(3);
      expect(result.fromUnit).toBe('meters');
      expect(result.toUnit).toBe('feet');
    });

    test('should return error for invalid format', () => {
      const result = mockParseInput('5 meters');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(MockConversionErrorType.INVALID_FORMAT);
      expect(result.error?.message).toContain('Invalid format');
    });

    test('should return error for invalid number', () => {
      const result = mockParseInput('abc meters to feet');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(MockConversionErrorType.INVALID_VALUE);
      expect(result.error?.message).toContain('Invalid number');
    });

    test('should handle empty input', () => {
      const result = mockParseInput('');
      expect(result.success).toBe(false);
    });

    test('should handle whitespace-only input', () => {
      const result = mockParseInput('   ');
      expect(result.success).toBe(false);
    });
  });

  describe('mockConvertInput', () => {
    test('should parse and convert input successfully', () => {
      const result = mockConvertInput('5 meters to feet');
      expect(result.success).toBe(true);
      expect(result.value).toBe('16.404');
      expect(result.rawValue).toBeCloseTo(16.4042, 4);
    });

    test('should handle complete conversion flow with aliases', () => {
      const result = mockConvertInput('100 cm to m');
      expect(result.success).toBe(true);
      expect(result.value).toBe('1.000');
      expect(result.rawValue).toBe(1);
    });

    test('should return parse error for invalid format', () => {
      const result = mockConvertInput('invalid input');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(MockConversionErrorType.INVALID_FORMAT);
    });

    test('should return conversion error for unknown units', () => {
      const result = mockConvertInput('5 unknown to feet');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(MockConversionErrorType.UNKNOWN_UNIT);
    });

    test('should handle complex engineering scenarios', () => {
      // Test realistic engineering conversion
      const result = mockConvertInput('2.5 inches to millimeters');
      expect(result.success).toBe(true);
      expect(result.value).toBe('63.500');
      expect(result.rawValue).toBe(63.5);
    });
  });

  describe('number formatting', () => {
    test('should always show 3 decimal places', () => {
      const result = mockConvert(1, 'meter', 'meter');
      expect(result.success).toBe(true);
      expect(result.value).toBe('1.000');
    });

    test('should format thousands with commas', () => {
      const result = mockConvert(1, 'mile', 'millimeter');
      expect(result.success).toBe(true);
      expect(result.value).toContain(',');
      expect(result.rawValue).toBeGreaterThan(1000000);
    });

    test('should handle very small numbers', () => {
      const result = mockConvert(1, 'millimeter', 'kilometer');
      expect(result.success).toBe(true);
      expect(result.value).toBe('0.000');
      expect(result.rawValue).toBe(0.000001);
    });
  });

  describe('unit alias support', () => {
    test('should support meter aliases', () => {
      expect(mockConvert(1, 'm', 'foot').success).toBe(true);
      expect(mockConvert(1, 'metre', 'foot').success).toBe(true);
      expect(mockConvert(1, 'meters', 'foot').success).toBe(true);
    });

    test('should support foot aliases', () => {
      expect(mockConvert(1, 'ft', 'meter').success).toBe(true);
      expect(mockConvert(1, 'feet', 'meter').success).toBe(true);
    });

    test('should support inch aliases', () => {
      expect(mockConvert(1, 'in', 'meter').success).toBe(true);
      expect(mockConvert(1, 'inches', 'meter').success).toBe(true);
    });

    test('should support centimeter aliases', () => {
      expect(mockConvert(1, 'cm', 'meter').success).toBe(true);
      expect(mockConvert(1, 'centimeters', 'meter').success).toBe(true);
    });
  });
});
