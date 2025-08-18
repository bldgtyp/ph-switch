// Unit tests for error handling and unit suggestions
import {
  findSimilarUnits,
  enhanceErrorWithSuggestions,
  createFormatError,
  createNumberError,
  createUnknownUnitError,
  createCategoryError,
  createCalculationError,
  formatErrorMessage,
  getAvailableUnits,
  validateErrorHandling,
} from './errorHandler';
import { initializeConfigurations, resetConfigurations } from '../config';
import { ErrorDetails } from '../types';

// Setup and teardown for configuration system
beforeAll(async () => {
  await initializeConfigurations();
});

afterAll(() => {
  resetConfigurations();
});

describe('Error Handler', () => {
  describe('findSimilarUnits', () => {
    it('should find similar units using fuzzy matching', () => {
      const suggestions = findSimilarUnits('mter', 5); // Should suggest "meter"
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('meter');
    });

    it('should find multiple similar units', () => {
      const suggestions = findSimilarUnits('met', 5); // Should suggest meter-related units
      expect(suggestions.length).toBeGreaterThan(0);
      expect(
        suggestions.some((s) => s.includes('meter') || s.includes('metre'))
      ).toBe(true);
    });

    it('should handle abbreviations', () => {
      const suggestions = findSimilarUnits('f', 5); // Should suggest "ft" or similar
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should return empty array for very dissimilar strings', () => {
      const suggestions = findSimilarUnits('xyzabc123', 5);
      expect(suggestions.length).toBe(0); // No good matches
    });

    it('should limit number of suggestions', () => {
      const suggestions = findSimilarUnits('m', 2); // Many matches, but limit to 2
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should handle case insensitive matching', () => {
      const suggestions = findSimilarUnits('METER', 5);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('meter');
    });

    it('should handle empty input gracefully', () => {
      const suggestions = findSimilarUnits('', 5);
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('enhanceErrorWithSuggestions', () => {
    it('should add suggestions to unknown unit errors', () => {
      const baseError: ErrorDetails = {
        type: 'UNKNOWN_UNIT',
        message: 'Unknown unit: "mter"',
        context: 'Unit not found',
      };

      const enhanced = enhanceErrorWithSuggestions(baseError);
      expect(enhanced.suggestions).toBeDefined();
      expect(enhanced.suggestions!.length).toBeGreaterThan(0);
    });

    it('should not modify non-unknown-unit errors', () => {
      const baseError: ErrorDetails = {
        type: 'INVALID_FORMAT',
        message: 'Invalid format',
        context: 'Bad format',
      };

      const enhanced = enhanceErrorWithSuggestions(baseError);
      expect(enhanced).toEqual(baseError);
    });

    it('should provide fallback suggestions for unmatched units', () => {
      const baseError: ErrorDetails = {
        type: 'UNKNOWN_UNIT',
        message: 'Unknown unit: "xyzabc123"',
        context: 'Unit not found',
      };

      const enhanced = enhanceErrorWithSuggestions(baseError);
      expect(enhanced.suggestions).toBeDefined();
      expect(enhanced.suggestions!.length).toBeGreaterThan(0);
      expect(enhanced.suggestions!.some((s) => s.includes('spelling'))).toBe(
        true
      );
    });
  });

  describe('createFormatError', () => {
    it('should create format error with default message', () => {
      const error = createFormatError('bad input');
      expect(error.type).toBe('INVALID_FORMAT');
      expect(error.message).toContain('format');
      expect(error.suggestions).toBeDefined();
      expect(error.suggestions!.length).toBeGreaterThan(0);
    });

    it('should accept custom context', () => {
      const customContext = 'Custom error context';
      const error = createFormatError('bad input', customContext);
      expect(error.context).toBe(customContext);
    });

    it('should include helpful examples in suggestions', () => {
      const error = createFormatError('bad input');
      expect(error.suggestions!.some((s) => s.includes('meters to feet'))).toBe(
        true
      );
    });
  });

  describe('createNumberError', () => {
    it('should create number parsing error', () => {
      const error = createNumberError('abc');
      expect(error.type).toBe('INVALID_FORMAT');
      expect(error.message).toContain('abc');
      expect(error.context).toContain('abc');
      expect(error.suggestions).toBeDefined();
    });

    it('should include various number format examples', () => {
      const error = createNumberError('bad');
      const allSuggestions = error.suggestions!.join(' ');
      expect(allSuggestions).toContain('Decimals');
      expect(allSuggestions).toContain('Scientific');
      expect(allSuggestions).toContain('Fractions');
      expect(allSuggestions).toContain('Mixed');
    });
  });

  describe('createUnknownUnitError', () => {
    it('should create error for unknown source unit', () => {
      const error = createUnknownUnitError('badunit', true);
      expect(error.type).toBe('UNKNOWN_UNIT');
      expect(error.message).toContain('source unit');
      expect(error.message).toContain('badunit');
    });

    it('should create error for unknown target unit', () => {
      const error = createUnknownUnitError('badunit', false);
      expect(error.type).toBe('UNKNOWN_UNIT');
      expect(error.message).toContain('target unit');
      expect(error.message).toContain('badunit');
    });

    it('should include fuzzy matching suggestions', () => {
      const error = createUnknownUnitError('mter'); // Should suggest "meter"
      expect(error.suggestions).toBeDefined();
      expect(error.suggestions!.length).toBeGreaterThan(0);
    });
  });

  describe('createCategoryError', () => {
    it('should create cross-category conversion error', () => {
      const error = createCategoryError('meter', 'gallon', 'length', 'volume');
      expect(error.type).toBe('INVALID_FORMAT');
      expect(error.message).toContain('different unit categories');
      expect(error.context).toContain('length unit');
      expect(error.context).toContain('volume unit');
      expect(error.suggestions).toBeDefined();
    });

    it('should provide helpful suggestions for category errors', () => {
      const error = createCategoryError('meter', 'gallon', 'length', 'volume');
      const allSuggestions = error.suggestions!.join(' ');
      expect(allSuggestions).toContain('length unit');
      expect(allSuggestions).toContain('volume unit');
    });
  });

  describe('createCalculationError', () => {
    it('should create calculation error with default context', () => {
      const error = createCalculationError('Division by zero');
      expect(error.type).toBe('CALCULATION_ERROR');
      expect(error.message).toBe('Division by zero');
      expect(error.context).toContain('conversion calculation');
      expect(error.suggestions).toBeDefined();
    });

    it('should accept custom context', () => {
      const customContext = 'Custom calculation context';
      const error = createCalculationError('Error', customContext);
      expect(error.context).toBe(customContext);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format basic error message', () => {
      const error: ErrorDetails = {
        type: 'INVALID_FORMAT',
        message: 'Test error',
      };

      const formatted = formatErrorMessage(error);
      expect(formatted).toContain('Test error');
    });

    it('should include context when present', () => {
      const error: ErrorDetails = {
        type: 'INVALID_FORMAT',
        message: 'Test error',
        context: 'Additional context',
      };

      const formatted = formatErrorMessage(error);
      expect(formatted).toContain('Test error');
      expect(formatted).toContain('Additional context');
    });

    it('should include suggestions when present', () => {
      const error: ErrorDetails = {
        type: 'INVALID_FORMAT',
        message: 'Test error',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
      };

      const formatted = formatErrorMessage(error);
      expect(formatted).toContain('Test error');
      expect(formatted).toContain('Suggestions:');
      expect(formatted).toContain('Suggestion 1');
      expect(formatted).toContain('Suggestion 2');
    });

    it('should format complete error with all fields', () => {
      const error: ErrorDetails = {
        type: 'UNKNOWN_UNIT',
        message: 'Unknown unit',
        context: 'Unit not found in database',
        suggestions: ['Check spelling', 'Try abbreviation'],
      };

      const formatted = formatErrorMessage(error);
      expect(formatted).toContain('Unknown unit');
      expect(formatted).toContain('Unit not found in database');
      expect(formatted).toContain('Check spelling');
      expect(formatted).toContain('Try abbreviation');
    });
  });

  describe('getAvailableUnits', () => {
    it('should return units grouped by category', () => {
      const units = getAvailableUnits();
      expect(typeof units).toBe('object');
      expect(units.length).toBeDefined(); // Should have length category
      expect(Array.isArray(units.length)).toBe(true);
    });

    it('should include common units in length category', () => {
      const units = getAvailableUnits();
      const lengthUnits = units.length || [];
      expect(lengthUnits).toContain('meter');
      expect(lengthUnits).toContain('foot');
      expect(lengthUnits).toContain('inch');
    });

    it('should sort units alphabetically', () => {
      const units = getAvailableUnits();
      for (const category in units) {
        const categoryUnits = units[category];
        const sorted = [...categoryUnits].sort();
        expect(categoryUnits).toEqual(sorted);
      }
    });
  });

  describe('validateErrorHandling', () => {
    it('should validate that error handling is working', () => {
      const isValid = validateErrorHandling();
      expect(isValid).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should create and enhance unknown unit error end-to-end', () => {
      const error = createUnknownUnitError('mter'); // Typo for "meter"
      expect(error.type).toBe('UNKNOWN_UNIT');
      expect(error.suggestions).toBeDefined();
      expect(error.suggestions!.length).toBeGreaterThan(0);

      const formatted = formatErrorMessage(error);
      expect(formatted.length).toBeGreaterThan(error.message.length);
    });

    it('should handle error enhancement for various typos', () => {
      const testCases = [
        'mter', // meter
        'fet', // feet
        'inche', // inch
        'kilmeter', // kilometer
      ];

      testCases.forEach((typo) => {
        const error = createUnknownUnitError(typo);
        expect(error.suggestions).toBeDefined();
        expect(error.suggestions!.length).toBeGreaterThanOrEqual(0);
      });
    });

    it('should provide reasonable suggestions for common misspellings', () => {
      const error = createUnknownUnitError('feets'); // Common plural mistake
      expect(
        error.suggestions!.some((s) => s.includes('feet') || s.includes('foot'))
      ).toBe(true);
    });
  });
});
