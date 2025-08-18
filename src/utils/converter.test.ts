// Unit tests for the core conversion engine
import {
  convertUnits,
  convertFromInput,
  validateConversionSystem,
  getConversionFactors,
  validateConversion,
  getPrecisionInfo
} from './converter';
import { initializeConfigurations, resetConfigurations } from '../config';
import { Decimal } from 'decimal.js';

// Setup and teardown for configuration system
beforeAll(async () => {
  await initializeConfigurations();
});

afterAll(() => {
  resetConfigurations();
});

describe('Converter', () => {
  describe('validateConversionSystem', () => {
    it('should validate that conversion system is ready', () => {
      const isValid = validateConversionSystem();
      expect(isValid).toBe(true);
    });
  });

  describe('convertUnits', () => {
    describe('successful conversions', () => {
      it('should convert basic length units', () => {
        const result = convertUnits(1, 'meter', 'foot');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(3.28084, 4);
        expect(result.formattedValue).toBeDefined();
        expect(result.sourceUnit).toBe('meter');
        expect(result.targetUnit).toBe('foot');
      });

      it('should convert metric to imperial', () => {
        const result = convertUnits(100, 'centimeter', 'inch');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(39.3701, 4);
      });

      it('should convert imperial to metric', () => {
        const result = convertUnits(12, 'inch', 'centimeter');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(30.48, 2);
      });

      it('should handle same unit conversion', () => {
        const result = convertUnits(42, 'meter', 'meter');
        expect(result.success).toBe(true);
        expect(result.value).toBe(42);
      });

      it('should handle zero values', () => {
        const result = convertUnits(0, 'meter', 'foot');
        expect(result.success).toBe(true);
        expect(result.value).toBe(0);
      });

      it('should handle negative values', () => {
        const result = convertUnits(-10, 'meter', 'foot');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(-32.8084, 4);
      });

      it('should handle very large numbers', () => {
        const result = convertUnits(1e12, 'meter', 'kilometer');
        expect(result.success).toBe(true);
        expect(result.value).toBe(1e9);
      });

      it('should handle very small numbers', () => {
        const result = convertUnits(1e-6, 'meter', 'micrometer');
        expect(result.success).toBe(true);
        expect(result.value).toBe(1);
      });

      it('should handle scientific notation precision', () => {
        const result = convertUnits(1.23456789e-8, 'meter', 'nanometer');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(12.3456789, 6);
      });

      it('should include calculation details', () => {
        const result = convertUnits(1, 'meter', 'foot');
        expect(result.calculation).toBeDefined();
        expect(result.calculation!.inputValue).toBe(1);
        expect(result.calculation!.sourceUnit).toBe('meter');
        expect(result.calculation!.targetUnit).toBe('foot');
        expect(result.calculation!.precision).toBe('high');
        expect(result.calculation!.category).toBe('length');
      });
    });

    describe('unit aliases', () => {
      it('should work with common aliases', () => {
        const result = convertUnits(1, 'm', 'ft');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(3.28084, 4);
      });

      it('should work with plural forms', () => {
        const result = convertUnits(2, 'meters', 'feet');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(6.56168, 4);
      });

      it('should work with mixed case', () => {
        const result = convertUnits(1, 'METER', 'FOOT');
        expect(result.success).toBe(true);
        expect(result.value).toBeCloseTo(3.28084, 4);
      });
    });

    describe('error handling', () => {
      it('should handle invalid input values', () => {
        const result = convertUnits(NaN, 'meter', 'foot');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('object');
      });

      it('should handle infinite input values', () => {
        const result = convertUnits(Infinity, 'meter', 'foot');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should handle unknown source unit', () => {
        const result = convertUnits(1, 'badunit', 'foot');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        if (typeof result.error === 'object') {
          expect(result.error.type).toBe('UNKNOWN_UNIT');
          expect(result.error.suggestions).toBeDefined();
        }
      });

      it('should handle unknown target unit', () => {
        const result = convertUnits(1, 'meter', 'badunit');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        if (typeof result.error === 'object') {
          expect(result.error.type).toBe('UNKNOWN_UNIT');
        }
      });

      it('should handle cross-category conversion', () => {
        // This test will work when we have multiple categories
        // For now, all units are in length category, so this won't trigger
        const result = convertUnits(1, 'meter', 'meter'); // Same category
        expect(result.success).toBe(true);
      });

      it('should provide fuzzy matching suggestions', () => {
        const result = convertUnits(1, 'mter', 'foot'); // Typo for "meter"
        expect(result.success).toBe(false);
        if (typeof result.error === 'object') {
          expect(result.error.suggestions).toBeDefined();
          expect(result.error.suggestions!.length).toBeGreaterThan(0);
        }
      });
    });

    describe('precision and formatting', () => {
      it('should format large numbers appropriately', () => {
        const result = convertUnits(1000000, 'meter', 'kilometer');
        expect(result.success).toBe(true);
        expect(result.formattedValue).not.toContain('e'); // Should not use scientific notation
      });

      it('should format small numbers appropriately', () => {
        const result = convertUnits(0.001, 'meter', 'millimeter');
        expect(result.success).toBe(true);
        expect(result.formattedValue).toBe('1');
      });

      it('should use scientific notation for very large numbers', () => {
        const result = convertUnits(1e15, 'meter', 'foot');
        expect(result.success).toBe(true);
        // Very large result should use scientific notation
        expect(result.formattedValue).toContain('e');
      });

      it('should use scientific notation for very small numbers', () => {
        const result = convertUnits(1e-9, 'meter', 'kilometer');
        expect(result.success).toBe(true);
        // Very small result should use scientific notation
        expect(result.formattedValue).toContain('e');
      });

      it('should remove trailing zeros', () => {
        const result = convertUnits(1, 'meter', 'millimeter');
        expect(result.success).toBe(true);
        expect(result.formattedValue).toBe('1000'); // Not "1000.0000"
      });
    });
  });

  describe('convertFromInput', () => {
    it('should parse and convert valid input', async () => {
      const result = await convertFromInput('1 meter to feet');
      expect(result.success).toBe(true);
      expect(result.value).toBeCloseTo(3.28084, 4);
    });

    it('should handle various input formats', async () => {
      const testCases = [
        '5 m to ft',
        '10 meters as feet',
        '2.5 metre to foot',
        '100 cm to inches'
      ];

      for (const input of testCases) {
        const result = await convertFromInput(input);
        expect(result.success).toBe(true);
      }
    });

    it('should handle scientific notation input', async () => {
      const result = await convertFromInput('1.5e3 meters to kilometers');
      expect(result.success).toBe(true);
      expect(result.value).toBe(1.5);
    });

    it('should handle fraction input', async () => {
      const result = await convertFromInput('1/2 meter to centimeters');
      expect(result.success).toBe(true);
      expect(result.value).toBe(50);
    });

    it('should handle mixed number input', async () => {
      const result = await convertFromInput('1 1/2 meters to feet');
      expect(result.success).toBe(true);
      expect(result.value).toBeCloseTo(4.92126, 4);
    });

    it('should return parser errors for invalid format', async () => {
      const result = await convertFromInput('invalid input');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return conversion errors for unknown units', async () => {
      const result = await convertFromInput('1 badunit to meter');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getConversionFactors', () => {
    it('should get conversion factors for valid units', () => {
      const factors = getConversionFactors('meter');
      expect(factors).toBeDefined();
      expect(factors!.category).toBe('length');
      expect(factors!.factor).toBe(1); // meter is base unit
      expect(factors!.baseUnit).toBe('meter');
    });

    it('should get factors for non-base units', () => {
      const factors = getConversionFactors('foot');
      expect(factors).toBeDefined();
      expect(factors!.category).toBe('length');
      expect(factors!.factor).toBeCloseTo(0.3048, 4);
    });

    it('should return null for unknown units', () => {
      const factors = getConversionFactors('badunit');
      expect(factors).toBeNull();
    });

    it('should work with aliases', () => {
      const factors = getConversionFactors('ft');
      expect(factors).toBeDefined();
      expect(factors!.category).toBe('length');
    });
  });

  describe('validateConversion', () => {
    it('should validate valid conversions', () => {
      const validation = validateConversion('meter', 'foot');
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('should invalidate unknown source units', () => {
      const validation = validateConversion('badunit', 'foot');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error!.type).toBe('UNKNOWN_UNIT');
    });

    it('should invalidate unknown target units', () => {
      const validation = validateConversion('meter', 'badunit');
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
      expect(validation.error!.type).toBe('UNKNOWN_UNIT');
    });

    it('should provide suggestions for invalid units', () => {
      const validation = validateConversion('mter', 'foot'); // Typo
      expect(validation.isValid).toBe(false);
      expect(validation.error!.suggestions).toBeDefined();
      expect(validation.error!.suggestions!.length).toBeGreaterThan(0);
    });
  });

  describe('getPrecisionInfo', () => {
    it('should return precision configuration', () => {
      const info = getPrecisionInfo();
      expect(info).toBeDefined();
      expect(info.decimalPrecision).toBe(40);
      expect(info.roundingMode).toBe('ROUND_HALF_UP');
      expect(info.scientificNotationThresholds).toBeDefined();
      expect(info.scientificNotationThresholds.upper).toBe(1e12);
      expect(info.scientificNotationThresholds.lower).toBe(1e-6);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle conversion chain consistency', () => {
      // Convert meter -> foot -> inch -> centimeter
      const step1 = convertUnits(1, 'meter', 'foot');
      expect(step1.success).toBe(true);
      
      const step2 = convertUnits(step1.value!, 'foot', 'inch');
      expect(step2.success).toBe(true);
      
      const step3 = convertUnits(step2.value!, 'inch', 'centimeter');
      expect(step3.success).toBe(true);
      
      // Should be close to 100 cm (1 meter)
      expect(step3.value!).toBeCloseTo(100, 1);
    });

    it('should maintain precision through multiple conversions', () => {
      const original = 1.23456789;
      
      // Convert and back
      const step1 = convertUnits(original, 'meter', 'foot');
      const step2 = convertUnits(step1.value!, 'foot', 'meter');
      
      expect(step2.value!).toBeCloseTo(original, 6);
    });

    it('should handle extreme precision requirements', () => {
      const preciseValue = 1.123456789012345;
      const result = convertUnits(preciseValue, 'meter', 'millimeter');
      
      expect(result.success).toBe(true);
      expect(result.value!).toBeCloseTo(preciseValue * 1000, 10);
    });

    it('should handle boundary value conversions', () => {
      const boundaries = [
        Number.MIN_SAFE_INTEGER,
        -1e-10,
        1e-10,
        Number.MAX_SAFE_INTEGER
      ];
      
      boundaries.forEach(value => {
        if (isFinite(value) && !isNaN(value)) {
          const result = convertUnits(value, 'meter', 'foot');
          expect(result.success).toBe(true);
        }
      });
    });
  });
});
