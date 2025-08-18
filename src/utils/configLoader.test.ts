// Unit tests for configuration loader functionality
import {
  validateConfiguration,
  loadUnitCategory,
  loadAllConfigurations,
  getAllUnitAliases,
  findUnitByAlias,
  getConversionFactor,
} from './configLoader';
import lengthConfig from '../config/length.json';

describe('Configuration Loader', () => {
  describe('validateConfiguration', () => {
    it('should validate a correct configuration', () => {
      const result = validateConfiguration(lengthConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject configuration without required fields', () => {
      const invalidConfig = {
        category: 'test',
        // missing baseUnit and units
      };

      const result = validateConfiguration(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should reject configuration with invalid factor', () => {
      const invalidConfig = {
        category: 'test',
        baseUnit: 'meter',
        units: {
          meter: {
            name: 'meter',
            symbol: 'm',
            aliases: ['m'],
            factor: 0, // Invalid: must be > 0
          },
        },
      };

      const result = validateConfiguration(invalidConfig);
      expect(result.valid).toBe(false);
    });

    it('should reject configuration with duplicate aliases', () => {
      const invalidConfig = {
        category: 'test',
        baseUnit: 'meter',
        units: {
          meter: {
            name: 'meter',
            symbol: 'm',
            aliases: ['m', 'm'], // Duplicate aliases
          },
        },
      };

      const result = validateConfiguration(invalidConfig);
      expect(result.valid).toBe(false);
    });
  });

  describe('loadUnitCategory', () => {
    it('should load valid length configuration', () => {
      const result = loadUnitCategory(lengthConfig, 'length');
      expect(result).not.toBeNull();
      expect(result!.category).toBe('length');
      expect(result!.baseUnit).toBe('meter');
      expect(result!.units.meter).toBeDefined();
      expect(result!.units.meter.factor).toBe(1);
    });

    it('should reject configuration with mismatched category name', () => {
      const result = loadUnitCategory(lengthConfig, 'wrong_category');
      expect(result).toBeNull();
    });

    it('should reject configuration where base unit is not in units', () => {
      const invalidConfig = {
        category: 'test',
        baseUnit: 'nonexistent',
        units: {
          meter: {
            name: 'meter',
            symbol: 'm',
            aliases: ['m'],
            factor: 1,
          },
        },
      };

      const result = loadUnitCategory(invalidConfig, 'test');
      expect(result).toBeNull();
    });

    it('should reject configuration where base unit factor is not 1', () => {
      const invalidConfig = {
        category: 'test',
        baseUnit: 'meter',
        units: {
          meter: {
            name: 'meter',
            symbol: 'm',
            aliases: ['m'],
            factor: 2, // Should be 1 for base unit
          },
        },
      };

      const result = loadUnitCategory(invalidConfig, 'test');
      expect(result).toBeNull();
    });
  });

  describe('loadAllConfigurations', () => {
    it('should load all available configurations', async () => {
      const result = await loadAllConfigurations();
      expect(result.success).toBe(true);
      expect(result.categories).toBeDefined();
      expect(result.categories!.length).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should include length category', async () => {
      const result = await loadAllConfigurations();
      expect(result.success).toBe(true);
      expect(result.categories!.length).toBeDefined();
      expect(result.categories!.length.category).toBe('length');
    });
  });

  describe('getAllUnitAliases', () => {
    it('should create alias map from configurations', async () => {
      const configResult = await loadAllConfigurations();
      expect(configResult.success).toBe(true);

      const aliases = getAllUnitAliases(configResult.categories!);

      // Check that meter aliases exist
      expect(aliases['meter']).toBeDefined();
      expect(aliases['metre']).toBeDefined();
      expect(aliases['m']).toBeDefined();

      // Check that they point to correct category and unit
      expect(aliases['meter'].category).toBe('length');
      expect(aliases['meter'].unit).toBe('meter');
    });

    it('should handle case-insensitive aliases', async () => {
      const configResult = await loadAllConfigurations();
      const aliases = getAllUnitAliases(configResult.categories!);

      // All aliases should be lowercase in the map
      expect(aliases['meter']).toBeDefined();
      expect(aliases['METER']).toBeUndefined(); // Uppercase not stored
    });
  });

  describe('findUnitByAlias', () => {
    it('should find unit by exact alias match', async () => {
      const configResult = await loadAllConfigurations();
      const result = findUnitByAlias('meter', configResult.categories!);

      expect(result).not.toBeNull();
      expect(result!.category).toBe('length');
      expect(result!.unit).toBe('meter');
      expect(result!.definition.name).toBe('meter');
    });

    it('should find unit by case-insensitive alias', async () => {
      const configResult = await loadAllConfigurations();
      const result = findUnitByAlias('METER', configResult.categories!);

      expect(result).not.toBeNull();
      expect(result!.category).toBe('length');
      expect(result!.unit).toBe('meter');
    });

    it('should find unit by abbreviation', async () => {
      const configResult = await loadAllConfigurations();
      const result = findUnitByAlias('ft', configResult.categories!);

      expect(result).not.toBeNull();
      expect(result!.category).toBe('length');
      expect(result!.unit).toBe('foot');
    });

    it('should return null for unknown alias', async () => {
      const configResult = await loadAllConfigurations();
      const result = findUnitByAlias('unknown_unit', configResult.categories!);

      expect(result).toBeNull();
    });
  });

  describe('getConversionFactor', () => {
    it('should calculate conversion factor between units', async () => {
      const configResult = await loadAllConfigurations();
      const category = configResult.categories!.length;

      // 1 meter = 3.28084 feet
      const factor = getConversionFactor('meter', 'foot', category);
      expect(factor).toBeCloseTo(3.28084, 5);
    });

    it('should return 1 for same unit conversion', async () => {
      const configResult = await loadAllConfigurations();
      const category = configResult.categories!.length;

      const factor = getConversionFactor('meter', 'meter', category);
      expect(factor).toBe(1);
    });

    it('should return null for unknown source unit', async () => {
      const configResult = await loadAllConfigurations();
      const category = configResult.categories!.length;

      const factor = getConversionFactor('unknown', 'meter', category);
      expect(factor).toBeNull();
    });

    it('should return null for unknown target unit', async () => {
      const configResult = await loadAllConfigurations();
      const category = configResult.categories!.length;

      const factor = getConversionFactor('meter', 'unknown', category);
      expect(factor).toBeNull();
    });

    it('should handle precise calculations', async () => {
      const configResult = await loadAllConfigurations();
      const category = configResult.categories!.length;

      // Test inch to millimeter: 1 inch = 25.4 mm exactly
      const factor = getConversionFactor('inch', 'millimeter', category);
      expect(factor).toBe(25.4);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty configurations gracefully', () => {
      const aliases = getAllUnitAliases({});
      expect(Object.keys(aliases)).toHaveLength(0);
    });

    it('should handle configuration with no units', () => {
      const emptyConfig = {
        category: 'empty',
        baseUnit: 'none',
        units: {},
      };

      const result = loadUnitCategory(emptyConfig, 'empty');
      expect(result).toBeNull(); // Should fail validation due to no units
    });

    it('should warn about duplicate aliases across categories', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Create configurations with duplicate aliases
      const config1 = {
        cat1: {
          category: 'cat1',
          baseUnit: 'unit1',
          units: {
            unit1: {
              name: 'unit1',
              symbol: 'u1',
              aliases: ['shared'],
              factor: 1,
            },
          },
        },
        cat2: {
          category: 'cat2',
          baseUnit: 'unit2',
          units: {
            unit2: {
              name: 'unit2',
              symbol: 'u2',
              aliases: ['shared'],
              factor: 1,
            },
          },
        },
      };

      getAllUnitAliases(config1);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate alias')
      );

      consoleSpy.mockRestore();
    });
  });
});
