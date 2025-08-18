// Configuration loader utility for JSON unit definitions
// Handles async loading, validation, and TypeScript type safety

import Ajv from 'ajv';
import schema from '../config/schema.json';
import lengthConfig from '../config/length.json';
import { UnitCategory, ConfigurationLoadResult, ValidationResult } from '../types';

// Initialize AJV validator with schema
const ajv = new Ajv();
const validate = ajv.compile(schema);

/**
 * Validates a unit configuration against the JSON schema
 */
export function validateConfiguration(config: any): ValidationResult {
  const valid = validate(config);
  
  if (valid) {
    return { valid: true };
  }
  
  const errors = validate.errors?.map(error => {
    const path = error.instancePath || 'root';
    return `${path}: ${error.message}`;
  }) || ['Unknown validation error'];
  
  return {
    valid: false,
    errors
  };
}

/**
 * Loads and validates a single unit configuration
 */
export function loadUnitCategory(config: any, categoryName: string): UnitCategory | null {
  const validation = validateConfiguration(config);
  
  if (!validation.valid) {
    console.error(`Configuration validation failed for ${categoryName}:`, validation.errors);
    return null;
  }
  
  // Additional runtime validation
  if (config.category !== categoryName) {
    console.error(`Category name mismatch: expected ${categoryName}, got ${config.category}`);
    return null;
  }
  
  // Verify base unit exists in units
  if (!config.units[config.baseUnit]) {
    console.error(`Base unit '${config.baseUnit}' not found in units for category ${categoryName}`);
    return null;
  }
  
  // Verify base unit has factor of 1
  if (config.units[config.baseUnit].factor !== 1) {
    console.error(`Base unit '${config.baseUnit}' must have factor of 1, got ${config.units[config.baseUnit].factor}`);
    return null;
  }
  
  return config as UnitCategory;
}

/**
 * Loads all available unit configurations
 * Currently hardcoded for available categories, will expand in Phase 3
 */
export async function loadAllConfigurations(): Promise<ConfigurationLoadResult> {
  try {
    const categories: Record<string, UnitCategory> = {};
    
    // Load length configuration
    const lengthCategory = loadUnitCategory(lengthConfig, 'length');
    if (lengthCategory) {
      categories.length = lengthCategory;
    } else {
      return {
        success: false,
        error: 'Failed to load length unit configuration'
      };
    }
    
    // Validate that we have at least one category
    if (Object.keys(categories).length === 0) {
      return {
        success: false,
        error: 'No valid unit configurations found'
      };
    }
    
    console.log(`Successfully loaded ${Object.keys(categories).length} unit categories:`, Object.keys(categories));
    
    return {
      success: true,
      categories
    };
    
  } catch (error) {
    console.error('Error loading configurations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown configuration loading error'
    };
  }
}

/**
 * Gets all unit aliases from all loaded categories
 * Useful for fuzzy matching and suggestions
 */
export function getAllUnitAliases(categories: Record<string, UnitCategory>): Record<string, { category: string; unit: string }> {
  const aliases: Record<string, { category: string; unit: string }> = {};
  
  Object.entries(categories).forEach(([categoryKey, category]) => {
    Object.entries(category.units).forEach(([unitKey, unit]) => {
      // Add all aliases for this unit
      unit.aliases.forEach(alias => {
        const normalizedAlias = alias.toLowerCase().trim();
        if (aliases[normalizedAlias]) {
          console.warn(`Duplicate alias '${alias}' found in category ${categoryKey}, unit ${unitKey}`);
        }
        aliases[normalizedAlias] = {
          category: categoryKey,
          unit: unitKey
        };
      });
    });
  });
  
  return aliases;
}

/**
 * Finds a unit by alias (case-insensitive)
 */
export function findUnitByAlias(
  alias: string,
  categories: Record<string, UnitCategory>
): { category: string; unit: string; definition: any } | null {
  const normalizedAlias = alias.toLowerCase().trim();
  
  for (const [categoryKey, category] of Object.entries(categories)) {
    for (const [unitKey, unit] of Object.entries(category.units)) {
      if (unit.aliases.some(a => a.toLowerCase() === normalizedAlias)) {
        return {
          category: categoryKey,
          unit: unitKey,
          definition: unit
        };
      }
    }
  }
  
  return null;
}

/**
 * Get conversion factor between two units (must be in same category)
 */
export function getConversionFactor(
  sourceUnit: string,
  targetUnit: string,
  category: UnitCategory
): number | null {
  const source = category.units[sourceUnit];
  const target = category.units[targetUnit];
  
  if (!source || !target) {
    return null;
  }
  
  // Convert source to base unit, then base unit to target
  // source_value * source_factor = base_value
  // base_value / target_factor = target_value
  // Therefore: target_value = source_value * (source_factor / target_factor)
  
  return source.factor / target.factor;
}
