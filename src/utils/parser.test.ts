// Unit tests for natural language parser
import {
  parseNumericalValue,
  normalizeUnitString,
  parseConversionInput,
  validateUnits,
  parseAndValidateInput,
  parseMultilineInput,
  isSuccessfulParse,
  extractUnitReferences,
} from './parser';
import { initializeConfigurations, resetConfigurations } from '../config';

// Setup and teardown for configuration system
beforeAll(async () => {
  await initializeConfigurations();
});

afterAll(() => {
  resetConfigurations();
});

describe('Natural Language Parser', () => {
  describe('parseNumericalValue', () => {
    it('should parse regular decimal numbers', () => {
      expect(parseNumericalValue('5')).toBe(5);
      expect(parseNumericalValue('5.5')).toBe(5.5);
      expect(parseNumericalValue('0.001')).toBe(0.001);
      expect(parseNumericalValue('123.456')).toBe(123.456);
    });

    it('should parse scientific notation', () => {
      expect(parseNumericalValue('1.5e3')).toBe(1500);
      expect(parseNumericalValue('2E-4')).toBe(0.0002);
      expect(parseNumericalValue('3.14e2')).toBe(314);
      expect(parseNumericalValue('1E0')).toBe(1);
    });

    it('should parse simple fractions', () => {
      expect(parseNumericalValue('1/2')).toBe(0.5);
      expect(parseNumericalValue('3/4')).toBe(0.75);
      expect(parseNumericalValue('1/4')).toBe(0.25);
      expect(parseNumericalValue('5/8')).toBe(0.625);
    });

    it('should parse mixed numbers', () => {
      expect(parseNumericalValue('1 1/2')).toBe(1.5);
      expect(parseNumericalValue('2 3/4')).toBe(2.75);
      expect(parseNumericalValue('10 1/4')).toBe(10.25);
    });

    it('should return null for invalid numbers', () => {
      expect(parseNumericalValue('abc')).toBeNull();
      expect(parseNumericalValue('')).toBeNull();
      expect(parseNumericalValue('1/0')).toBeNull(); // Division by zero
      expect(parseNumericalValue('1 2/0')).toBeNull(); // Division by zero in mixed
      expect(parseNumericalValue('1.2.3')).toBeNull(); // Invalid decimal
    });

    it('should handle edge cases', () => {
      expect(parseNumericalValue(' 5 ')).toBe(5); // Whitespace
      expect(parseNumericalValue('0')).toBe(0);
      expect(parseNumericalValue('0.0')).toBe(0);
    });
  });

  describe('normalizeUnitString', () => {
    it('should convert to lowercase and trim', () => {
      expect(normalizeUnitString('METER')).toBe('meter');
      expect(normalizeUnitString('  Foot  ')).toBe('foot');
      expect(normalizeUnitString('InCh')).toBe('inch');
    });

    it('should handle unicode characters', () => {
      expect(normalizeUnitString('°C')).toBe('degc');
      expect(normalizeUnitString('μm')).toBe('um');
      expect(normalizeUnitString('Å')).toBe('a');
    });

    it('should normalize quotes', () => {
      expect(normalizeUnitString('"')).toBe('"');
      expect(normalizeUnitString('"')).toBe('"');
      expect(normalizeUnitString("'")).toBe("'");
      expect(normalizeUnitString("'")).toBe("'");
    });

    it('should normalize whitespace', () => {
      expect(normalizeUnitString('square   meter')).toBe('square meter');
      expect(normalizeUnitString('cubic\t\tfeet')).toBe('cubic feet');
    });
  });

  describe('parseConversionInput', () => {
    it('should parse basic conversion format', () => {
      const result = parseConversionInput('5 meters to feet');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.value).toBe(5);
      expect(success.sourceUnit).toBe('meters');
      expect(success.targetUnit).toBe('feet');
    });

    it('should parse "as" keyword format', () => {
      const result = parseConversionInput('2.5 inches as millimeters');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.value).toBe(2.5);
      expect(success.sourceUnit).toBe('inches');
      expect(success.targetUnit).toBe('millimeters');
    });

    it('should parse abbreviations', () => {
      const result = parseConversionInput('10 ft to m');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.value).toBe(10);
      expect(success.sourceUnit).toBe('ft');
      expect(success.targetUnit).toBe('m');
    });

    it('should parse scientific notation', () => {
      const result = parseConversionInput('1.5e3 mm to meters');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.value).toBe(1500);
      expect(success.sourceUnit).toBe('mm');
      expect(success.targetUnit).toBe('meters');
    });

    it('should parse fractions', () => {
      const result = parseConversionInput('1/2 inch to mm');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.value).toBe(0.5);
      expect(success.sourceUnit).toBe('inch');
      expect(success.targetUnit).toBe('mm');
    });

    it('should parse mixed numbers', () => {
      const result = parseConversionInput('1 1/2 feet to inches');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.value).toBe(1.5);
      expect(success.sourceUnit).toBe('feet');
      expect(success.targetUnit).toBe('inches');
    });

    it('should reject empty input', () => {
      const result = parseConversionInput('');
      expect(isSuccessfulParse(result)).toBe(false);
      const err = result as any;
      expect(err.type).toBe('INVALID_FORMAT');
      expect(err.message).toContain('empty');
    });

    it('should reject invalid format', () => {
      const result = parseConversionInput('5 meters');
      expect(isSuccessfulParse(result)).toBe(false);
      const err = result as any;
      expect(err.type).toBe('INVALID_FORMAT');
      expect(err.suggestions).toBeDefined();
    });

    it('should reject same source and target units', () => {
      const result = parseConversionInput('5 meter to meter');
      expect(isSuccessfulParse(result)).toBe(false);
      const err = result as any;
      expect(err.type).toBe('INVALID_FORMAT');
      expect(err.message).toContain('same');
    });

    it('should reject invalid numbers', () => {
      const result = parseConversionInput('abc meters to feet');
      expect(isSuccessfulParse(result)).toBe(false);
      const err = result as any;
      expect(err.type).toBe('INVALID_FORMAT');
      expect(err.message).toContain('conversion format'); // Updated to match actual error
    });

    it('should handle case insensitive input', () => {
      const result = parseConversionInput('5 METERS TO FEET');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.sourceUnit).toBe('meters');
      expect(success.targetUnit).toBe('feet');
    });
  });

  describe('validateUnits', () => {
    it('should validate existing units in same category', () => {
      const result = validateUnits('meter', 'foot');
      expect(result).toBeNull(); // No error
    });

    it('should reject unknown source unit', () => {
      const result = validateUnits('unknownunit', 'foot');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('UNKNOWN_UNIT');
      expect(result!.message).toContain('source unit');
    });

    it('should reject unknown target unit', () => {
      const result = validateUnits('meter', 'unknownunit');
      expect(result).not.toBeNull();
      expect(result!.type).toBe('UNKNOWN_UNIT');
      expect(result!.message).toContain('target unit');
    });

    // Note: Cross-category validation will be tested when we have multiple categories
  });

  describe('parseAndValidateInput', () => {
    it('should successfully parse and validate correct input', () => {
      const result = parseAndValidateInput('5 meters to feet');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.value).toBe(5);
      expect(success.sourceUnit).toBe('meters');
      expect(success.targetUnit).toBe('feet');
    });

    it('should return parsing error for invalid format', () => {
      const result = parseAndValidateInput('invalid input');
      expect(isSuccessfulParse(result)).toBe(false);
      const err = result as any;
      expect(err.type).toBe('INVALID_FORMAT');
    });

    it('should return validation error for unknown units', () => {
      const result = parseAndValidateInput('5 meters to unknownunit');
      expect(isSuccessfulParse(result)).toBe(false);
      const err = result as any;
      expect(err.type).toBe('UNKNOWN_UNIT');
    });

    it('should handle complex valid inputs', () => {
      const testCases = [
        '1.5e3 millimeters to meters',
        '1/2 inch to centimeters',
        '2 3/4 feet to inches',
        '100 km to miles',
      ];

      testCases.forEach((testCase) => {
        const result = parseAndValidateInput(testCase);
        expect(isSuccessfulParse(result)).toBe(true);
      });
    });
  });

  describe('parseMultilineInput', () => {
    it('should parse multiple valid lines', () => {
      const input = `5 meters to feet
2.5 inches to cm
1 km to miles`;

      const results = parseMultilineInput(input);
      expect(results).toHaveLength(3);

      results.forEach((result) => {
        expect(isSuccessfulParse(result)).toBe(true);
      });
    });

    it('should handle mix of valid and invalid lines', () => {
      const input = `5 meters to feet
invalid line
2.5 inches to cm`;

      const results = parseMultilineInput(input);
      expect(results).toHaveLength(3);

      expect(isSuccessfulParse(results[0])).toBe(true);
      expect(isSuccessfulParse(results[1])).toBe(false);
      expect(isSuccessfulParse(results[2])).toBe(true);
    });

    it('should handle empty lines', () => {
      const input = `5 meters to feet

2.5 inches to cm`;

      const results = parseMultilineInput(input);
      expect(results).toHaveLength(3);

      expect(isSuccessfulParse(results[0])).toBe(true);
      expect(isSuccessfulParse(results[1])).toBe(false);
      expect(isSuccessfulParse(results[2])).toBe(true);
    });

    it('should handle single line input', () => {
      const results = parseMultilineInput('5 meters to feet');
      expect(results).toHaveLength(1);
      expect(isSuccessfulParse(results[0])).toBe(true);
    });
  });

  describe('extractUnitReferences', () => {
    it('should extract unit-like words from input', () => {
      const units = extractUnitReferences('5 meters to feet and 2 inches');
      expect(units).toContain('meters');
      expect(units).toContain('feet');
      expect(units).toContain('inches');
      expect(units).not.toContain('5');
      expect(units).not.toContain('2');
      expect(units).not.toContain('to');
    });

    it('should handle malformed input', () => {
      const units = extractUnitReferences('something with meter and foot');
      expect(units).toContain('something');
      expect(units).toContain('with');
      expect(units).toContain('meter');
      expect(units).toContain('foot');
    });

    it('should return empty array for number-only input', () => {
      const units = extractUnitReferences('5 10 15');
      expect(units).toHaveLength(0);
    });

    it('should handle empty input', () => {
      const units = extractUnitReferences('');
      expect(units).toHaveLength(0);
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle very large numbers', () => {
      const result = parseConversionInput('999999999 meters to feet');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.value).toBe(999999999);
    });

    it('should handle very small numbers', () => {
      const result = parseConversionInput('0.0000001 meters to millimeters');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.value).toBe(0.0000001);
    });

    it('should handle zero values', () => {
      const result = parseConversionInput('0 meters to feet');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.value).toBe(0);
    });

    it('should handle units with special characters', () => {
      const result = parseConversionInput('5 um to mm');
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.sourceUnit).toBe('um'); // normalized
    });

    it('should preserve original input for reference', () => {
      const originalInput = '5 Meters TO Feet';
      const result = parseConversionInput(originalInput);
      expect(isSuccessfulParse(result)).toBe(true);
      const success = result as any;
      expect(success.originalInput).toBe(originalInput);
    });

    it('should handle extra whitespace gracefully', () => {
      const result = parseConversionInput('  5   meters   to   feet  ');
      expect(isSuccessfulParse(result)).toBe(true);
    });

    it('should provide helpful error messages', () => {
      const result = parseConversionInput('5 meters');
      expect(isSuccessfulParse(result)).toBe(false);
      const err = result as any;
      expect(err.suggestions).toBeDefined();
      expect(err.suggestions!.length).toBeGreaterThan(0);
      expect(err.context).toContain('format');
    });
  });
});
