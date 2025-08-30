// Unit tests for configuration loader functionality
import {
  validateConfiguration,
  loadUnitCategory,
  loadAllConfigurations,
  getAllUnitAliases,
  getAllUnitSymbols,
  findUnitByAlias,
  getConversionFactor,
  getUnitCategory,
  getSymbolsForCategory,
} from '../../utils/configLoader';
import lengthConfig from '../../config/length.json';

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

  describe('getAllUnitSymbols', () => {
    it('should return all unit symbols from categories', async () => {
      const configResult = await loadAllConfigurations();
      expect(configResult.success).toBe(true);

      const symbols = getAllUnitSymbols(configResult.categories!);

      // Should be an array of strings
      expect(Array.isArray(symbols)).toBe(true);
      expect(symbols.length).toBeGreaterThan(0);

      // Check that some expected symbols exist
      expect(symbols).toContain('m');     // meter symbol
      expect(symbols).toContain('ft');    // foot symbol
      expect(symbols).toContain('in');    // inch symbol

      // Should not contain aliases, only symbols
      expect(symbols).not.toContain('meter');   // alias, not symbol
      expect(symbols).not.toContain('foot');    // alias, not symbol
    });

    it('should remove duplicates and sort symbols', async () => {
      const configResult = await loadAllConfigurations();
      const symbols = getAllUnitSymbols(configResult.categories!);

      // Should be sorted
      const sortedSymbols = [...symbols].sort();
      expect(symbols).toEqual(sortedSymbols);

      // Should have no duplicates
      const uniqueSymbols = Array.from(new Set(symbols));
      expect(symbols).toEqual(uniqueSymbols);
    });

    it('should handle empty categories', () => {
      const symbols = getAllUnitSymbols({});
      expect(symbols).toEqual([]);
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

  describe('getUnitCategory', () => {
    const mockCategories = {
      length: {
        category: 'length',
        baseUnit: 'meter',
        units: {
          meter: {
            name: 'meter',
            symbol: 'm',
            aliases: ['meter', 'metres', 'm'],
            factor: 1,
          },
          foot: {
            name: 'foot',
            symbol: 'ft',
            aliases: ['foot', 'feet', 'ft'],
            factor: 0.3048,
          },
        },
      },
      airflow: {
        category: 'airflow',
        baseUnit: 'cfm',
        units: {
          cfm: {
            name: 'cubic foot per minute',
            symbol: 'cfm',
            aliases: ['cfm', 'ft3/min'],
            factor: 1,
          },
        },
      },
    };

    it('should find category by symbol', () => {
      expect(getUnitCategory('m', mockCategories)).toBe('length');
      expect(getUnitCategory('ft', mockCategories)).toBe('length');
      expect(getUnitCategory('cfm', mockCategories)).toBe('airflow');
    });

    it('should find category by alias', () => {
      expect(getUnitCategory('meter', mockCategories)).toBe('length');
      expect(getUnitCategory('feet', mockCategories)).toBe('length');
      expect(getUnitCategory('ft3/min', mockCategories)).toBe('airflow');
    });

    it('should be case insensitive', () => {
      expect(getUnitCategory('M', mockCategories)).toBe('length');
      expect(getUnitCategory('FT', mockCategories)).toBe('length');
      expect(getUnitCategory('CFM', mockCategories)).toBe('airflow');
    });

    it('should handle whitespace', () => {
      expect(getUnitCategory(' m ', mockCategories)).toBe('length');
      expect(getUnitCategory('\tft\n', mockCategories)).toBe('length');
    });

    it('should return null for unknown units', () => {
      expect(getUnitCategory('unknown', mockCategories)).toBeNull();
      expect(getUnitCategory('xyz', mockCategories)).toBeNull();
    });

    it('should return null when no categories provided', () => {
      expect(getUnitCategory('m')).toBeNull();
    });
  });

  describe('getSymbolsForCategory', () => {
    const mockCategories = {
      length: {
        category: 'length',
        baseUnit: 'meter',
        units: {
          meter: {
            name: 'meter',
            symbol: 'm',
            aliases: ['meter', 'metres', 'm'],
            factor: 1,
          },
          foot: {
            name: 'foot',
            symbol: 'ft',
            aliases: ['foot', 'feet', 'ft'],
            factor: 0.3048,
          },
          inch: {
            name: 'inch',
            symbol: 'in',
            aliases: ['inch', 'inches', 'in'],
            factor: 0.0254,
          },
        },
      },
      airflow: {
        category: 'airflow',
        baseUnit: 'cfm',
        units: {
          cfm: {
            name: 'cubic foot per minute',
            symbol: 'cfm',
            aliases: ['cfm', 'ft3/min'],
            factor: 1,
          },
        },
      },
    };

    it('should return symbols for valid category', () => {
      const lengthSymbols = getSymbolsForCategory('length', mockCategories);
      expect(lengthSymbols).toEqual(['ft', 'in', 'm']); // sorted
      expect(lengthSymbols).toHaveLength(3);
    });

    it('should return symbols for single-unit category', () => {
      const airflowSymbols = getSymbolsForCategory('airflow', mockCategories);
      expect(airflowSymbols).toEqual(['cfm']);
      expect(airflowSymbols).toHaveLength(1);
    });

    it('should return empty array for unknown category', () => {
      expect(getSymbolsForCategory('unknown', mockCategories)).toEqual([]);
    });

    it('should handle empty categories object', () => {
      expect(getSymbolsForCategory('length', {})).toEqual([]);
    });

    it('should deduplicate symbols if there are duplicates', () => {
      const duplicateSymbolCategories = {
        test: {
          category: 'test',
          baseUnit: 'unit1',
          units: {
            unit1: {
              name: 'unit1',
              symbol: 'm',
              aliases: ['unit1'],
              factor: 1,
            },
            unit2: {
              name: 'unit2',
              symbol: 'm', // duplicate symbol
              aliases: ['unit2'],
              factor: 2,
            },
          },
        },
      };

      const symbols = getSymbolsForCategory('test', duplicateSymbolCategories);
      expect(symbols).toEqual(['m']); // deduplicated
      expect(symbols).toHaveLength(1);
    });
  });
});
