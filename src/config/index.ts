// Central configuration management and exports
// Single point of access for all unit configurations

import {
  loadAllConfigurations,
  getAllUnitAliases,
  getAllUnitSymbols,
  findUnitByAlias,
  getConversionFactor,
  getUnitCategory,
  getSymbolsForCategory,
} from '../utils/configLoader';
import { UnitCategory } from '../types';

// Global configuration state
let globalConfigurations: Record<string, UnitCategory> | null = null;
let globalAliases: Record<string, { category: string; unit: string }> | null =
  null;
let configurationPromise: Promise<void> | null = null;

/**
 * Initialize the configuration system
 * Call this once at app startup
 */
export async function initializeConfigurations(): Promise<boolean> {
  if (configurationPromise) {
    await configurationPromise;
    return globalConfigurations !== null;
  }

  configurationPromise = (async () => {
    try {
      const result = await loadAllConfigurations();

      if (result.success && result.categories) {
        globalConfigurations = result.categories;
        globalAliases = getAllUnitAliases(result.categories);
        if (process.env.NODE_ENV !== 'test') {
          console.log('Configuration system initialized successfully');
        }
      } else {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Failed to initialize configurations:', result.error);
        }
        globalConfigurations = null;
        globalAliases = null;
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('Error during configuration initialization:', error);
      }
      globalConfigurations = null;
      globalAliases = null;
    }
  })();

  await configurationPromise;
  return globalConfigurations !== null;
}

/**
 * Get all loaded configurations
 */
export function getConfigurations(): Record<string, UnitCategory> | null {
  return globalConfigurations;
}

/**
 * Get a specific category configuration
 */
export function getCategory(categoryName: string): UnitCategory | null {
  if (!globalConfigurations) {
    console.warn(
      'Configurations not initialized. Call initializeConfigurations() first.'
    );
    return null;
  }

  return globalConfigurations[categoryName] || null;
}

/**
 * Get all unit aliases across all categories
 */
export function getAliases(): Record<
  string,
  { category: string; unit: string }
> | null {
  return globalAliases;
}

/**
 * Find unit by alias (case-insensitive)
 */
export function findUnit(
  alias: string
): { category: string; unit: string; definition: any } | null {
  if (!globalConfigurations) {
    console.warn(
      'Configurations not initialized. Call initializeConfigurations() first.'
    );
    return null;
  }

  return findUnitByAlias(alias, globalConfigurations);
}

/**
 * Get conversion factor between two units
 * Returns null if units are not in the same category or don't exist
 */
export function getConversion(
  sourceUnit: string,
  targetUnit: string
): {
  factor: number;
  category: string;
} | null {
  if (!globalConfigurations) {
    console.warn(
      'Configurations not initialized. Call initializeConfigurations() first.'
    );
    return null;
  }

  // Find which category each unit belongs to
  const sourceInfo = findUnitByAlias(sourceUnit, globalConfigurations);
  const targetInfo = findUnitByAlias(targetUnit, globalConfigurations);

  if (!sourceInfo || !targetInfo) {
    return null;
  }

  // Check if they're in the same category
  if (sourceInfo.category !== targetInfo.category) {
    return null;
  }

  const category = globalConfigurations[sourceInfo.category];
  const factor = getConversionFactor(
    sourceInfo.unit,
    targetInfo.unit,
    category
  );

  if (factor === null) {
    return null;
  }

  return {
    factor,
    category: sourceInfo.category,
  };
}

/**
 * Get all available units for a category
 */
export function getCategoryUnits(categoryName: string): string[] {
  const category = getCategory(categoryName);
  if (!category) {
    return [];
  }

  return Object.keys(category.units);
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): string[] {
  if (!globalConfigurations) {
    return [];
  }

  return Object.keys(globalConfigurations);
}

/**
 * Check if the configuration system is ready
 */
export function isConfigurationReady(): boolean {
  return globalConfigurations !== null && globalAliases !== null;
}

/**
 * Get all unit symbols from loaded configurations
 */
export function getAllSymbols(): string[] {
  if (!globalConfigurations) return [];
  return getAllUnitSymbols(globalConfigurations);
}

/**
 * Find which category a unit belongs to
 */
export function findUnitCategory(unitSymbolOrAlias: string): string | null {
  if (!globalConfigurations) return null;
  return getUnitCategory(unitSymbolOrAlias, globalConfigurations);
}

/**
 * Get all symbols for a specific category
 */
export function getCategorySymbols(categoryName: string): string[] {
  if (!globalConfigurations) return [];
  return getSymbolsForCategory(categoryName, globalConfigurations);
}

/**
 * Reset configurations (useful for testing)
 */
export function resetConfigurations(): void {
  globalConfigurations = null;
  globalAliases = null;
  configurationPromise = null;
}
