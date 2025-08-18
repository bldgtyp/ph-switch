// Core conversion engine with precision handling using decimal.js
import { Decimal } from 'decimal.js';
import { getCategory, isConfigurationReady } from '../config';
import { parseConversionInput } from './parser';
import { createCalculationError, createCategoryError, createUnknownUnitError, enhanceErrorWithSuggestions } from './errorHandler';
import type { ConversionResult, ErrorDetails, UnitCategory, ParsedInput } from '../types';

// Configure Decimal.js for high precision calculations
Decimal.config({
  precision: 40,        // 40 significant digits for engineering precision
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -20,       // Use exponential notation for numbers smaller than 1e-20
  toExpPos: 40,        // Use exponential notation for numbers larger than 1e40
  maxE: 9e15,          // Maximum exponent
  minE: -9e15,         // Minimum exponent
  modulo: Decimal.ROUND_HALF_UP
});

/**
 * Interface for internal conversion calculation
 */
interface ConversionCalculation {
  inputValue: Decimal;
  sourceUnit: string;
  targetUnit: string;
  sourceFactor: Decimal;
  targetFactor: Decimal;
  baseValue: Decimal;
  result: Decimal;
  category: string;
}

/**
 * Validates that the conversion system is ready
 */
export function validateConversionSystem(): boolean {
  try {
    return isConfigurationReady();
  } catch (error) {
    console.error('Conversion system validation failed:', error);
    return false;
  }
}

/**
 * Finds unit information in a specific category configuration
 */
function findUnitInCategory(unitName: string, configuration: UnitCategory): { 
  unitKey: string; 
  conversionFactor: number; 
} | null {
  // Check exact unit name match
  if (configuration.units[unitName]) {
    return {
      unitKey: unitName,
      conversionFactor: configuration.units[unitName].factor
    };
  }

  // Check aliases for each unit
  for (const [unitKey, unitData] of Object.entries(configuration.units)) {
    if (unitData.aliases && unitData.aliases.includes(unitName.toLowerCase())) {
      return {
        unitKey,
        conversionFactor: unitData.factor
      };
    }
  }

  return null;
}

/**
 * Finds unit information across all loaded categories
 */
function findUnit(unitName: string): { 
  category: string; 
  unitKey: string; 
  conversionFactor: number; 
} | null {
  const normalizedUnit = unitName.toLowerCase().trim();
  
  // Get all available categories
  const categories = ['length']; // Start with length, will be expanded
  
  for (const category of categories) {
    try {
      const configuration = getCategory(category);
      if (!configuration) continue;
      
      const unitInfo = findUnitInCategory(normalizedUnit, configuration);
      if (unitInfo) {
        return {
          category,
          unitKey: unitInfo.unitKey,
          conversionFactor: unitInfo.conversionFactor
        };
      }
    } catch (error) {
      console.warn(`Error searching category ${category}:`, error);
      continue;
    }
  }
  
  return null;
}

/**
 * Performs the actual conversion calculation with high precision
 */
function performConversion(
  inputValue: Decimal,
  sourceFactor: Decimal,
  targetFactor: Decimal
): Decimal {
  try {
    // Convert to base unit (multiply by source factor)
    const baseValue = inputValue.mul(sourceFactor);
    
    // Convert from base unit to target (divide by target factor)
    const result = baseValue.div(targetFactor);
    
    return result;
  } catch (error) {
    throw createCalculationError(
      `Conversion calculation failed: ${error instanceof Error ? error.message : 'Unknown calculation error'}`,
      'Arithmetic error during unit conversion'
    );
  }
}

/**
 * Formats the conversion result for display
 */
function formatResult(result: Decimal, targetUnit: string): string {
  try {
    // Determine appropriate number of decimal places based on magnitude
    const absResult = result.abs();
    let decimalPlaces: number;
    
    if (absResult.gte(1000)) {
      // Large numbers: show fewer decimals
      decimalPlaces = 2;
    } else if (absResult.gte(1)) {
      // Normal range: show moderate precision
      decimalPlaces = 4;
    } else if (absResult.gte(0.001)) {
      // Small numbers: show more precision
      decimalPlaces = 6;
    } else {
      // Very small numbers: use scientific notation or high precision
      decimalPlaces = 8;
    }
    
    // Convert to fixed decimal places
    let formatted = result.toFixed(decimalPlaces);
    
    // Remove trailing zeros
    formatted = formatted.replace(/\.?0+$/, '');
    
    // Handle very large or very small numbers with scientific notation
    if (absResult.gte(1e12) || (absResult.lt(1e-6) && absResult.gt(0))) {
      formatted = result.toExponential(6).replace(/\.?0+e/, 'e');
    }
    
    return formatted;
  } catch (error) {
    // Fallback to string conversion
    return result.toString();
  }
}

/**
 * Creates a detailed conversion calculation object for debugging/logging
 */
function createCalculationDetails(
  inputValue: number,
  sourceUnit: string,
  targetUnit: string,
  sourceInfo: { category: string; unitKey: string; conversionFactor: number },
  targetInfo: { category: string; unitKey: string; conversionFactor: number },
  result: Decimal
): ConversionCalculation {
  return {
    inputValue: new Decimal(inputValue),
    sourceUnit,
    targetUnit,
    sourceFactor: new Decimal(sourceInfo.conversionFactor),
    targetFactor: new Decimal(targetInfo.conversionFactor),
    baseValue: new Decimal(inputValue).mul(sourceInfo.conversionFactor),
    result,
    category: sourceInfo.category
  };
}

/**
 * Main conversion function that converts a value from one unit to another
 */
export function convertUnits(
  inputValue: number,
  sourceUnit: string,
  targetUnit: string
): ConversionResult {
  try {
    // Validate conversion system is ready
    if (!validateConversionSystem()) {
      return {
        success: false,
        error: createCalculationError(
          'Conversion system not initialized',
          'Configuration files not loaded. Please try again.'
        )
      };
    }

    // Validate input value
    if (!isFinite(inputValue) || isNaN(inputValue)) {
      return {
        success: false,
        error: createCalculationError(
          `Invalid input value: ${inputValue}`,
          'Input must be a valid number'
        )
      };
    }

    // Find source unit information
    const sourceInfo = findUnit(sourceUnit);
    if (!sourceInfo) {
      return {
        success: false,
        error: enhanceErrorWithSuggestions(
          createUnknownUnitError(sourceUnit, true)
        )
      };
    }

    // Find target unit information
    const targetInfo = findUnit(targetUnit);
    if (!targetInfo) {
      return {
        success: false,
        error: enhanceErrorWithSuggestions(
          createUnknownUnitError(targetUnit, false)
        )
      };
    }

    // Verify units are in the same category
    if (sourceInfo.category !== targetInfo.category) {
      return {
        success: false,
        error: createCategoryError(
          sourceUnit,
          targetUnit,
          sourceInfo.category,
          targetInfo.category
        )
      };
    }

    // Perform high-precision conversion
    const inputDecimal = new Decimal(inputValue);
    const sourceFactor = new Decimal(sourceInfo.conversionFactor);
    const targetFactor = new Decimal(targetInfo.conversionFactor);
    
    const result = performConversion(inputDecimal, sourceFactor, targetFactor);
    
    // Format result for display
    const formattedResult = formatResult(result, targetUnit);
    
    // Create calculation details for potential debugging
    const calculationDetails = createCalculationDetails(
      inputValue,
      sourceUnit,
      targetUnit,
      sourceInfo,
      targetInfo,
      result
    );
    
    return {
      success: true,
      value: parseFloat(result.toString()),
      formattedValue: formattedResult,
      sourceUnit,
      targetUnit,
      calculation: {
        inputValue,
        sourceUnit,
        targetUnit,
        outputValue: parseFloat(result.toString()),
        precision: 'high',
        category: sourceInfo.category
      }
    };

  } catch (error) {
    console.error('Conversion error:', error);
    
    if (error && typeof error === 'object' && 'type' in error) {
      // Already a properly formatted error
      return {
        success: false,
        error: error as ErrorDetails
      };
    }
    
    // Unknown error - wrap in calculation error
    return {
      success: false,
      error: createCalculationError(
        error instanceof Error ? error.message : 'Unknown conversion error',
        'An unexpected error occurred during conversion'
      )
    };
  }
}

/**
 * Converts natural language input to units using the parser and converter
 */
export async function convertFromInput(input: string): Promise<ConversionResult> {
  try {
    // Parse the natural language input
    const parseResult = parseConversionInput(input);
    
    // Check if parsing failed (returned ErrorDetails)
    if ('type' in parseResult) {
      return {
        success: false,
        error: parseResult
      };
    }
    
    // Parsing succeeded, use the ParsedInput
    const parsedInput = parseResult;
    
    // Perform the conversion
    return convertUnits(
      parsedInput.value,
      parsedInput.sourceUnit,
      parsedInput.targetUnit
    );
    
  } catch (error) {
    console.error('Input conversion error:', error);
    
    return {
      success: false,
      error: createCalculationError(
        error instanceof Error ? error.message : 'Unknown input processing error',
        'Failed to process conversion input'
      )
    };
  }
}

/**
 * Gets available conversion factors for a specific unit
 */
export function getConversionFactors(unitName: string): { 
  category: string; 
  factor: number; 
  baseUnit: string; 
} | null {
  const unitInfo = findUnit(unitName);
  if (!unitInfo) return null;
  
  try {
    const configuration = getCategory(unitInfo.category);
    if (!configuration) return null;
    
    return {
      category: unitInfo.category,
      factor: unitInfo.conversionFactor,
      baseUnit: configuration.baseUnit
    };
  } catch (error) {
    return null;
  }
}

/**
 * Validates a conversion without performing it (for UI validation)
 */
export function validateConversion(
  sourceUnit: string,
  targetUnit: string
): { isValid: boolean; error?: ErrorDetails } {
  const sourceInfo = findUnit(sourceUnit);
  if (!sourceInfo) {
    return {
      isValid: false,
      error: enhanceErrorWithSuggestions(createUnknownUnitError(sourceUnit, true))
    };
  }

  const targetInfo = findUnit(targetUnit);
  if (!targetInfo) {
    return {
      isValid: false,
      error: enhanceErrorWithSuggestions(createUnknownUnitError(targetUnit, false))
    };
  }

  if (sourceInfo.category !== targetInfo.category) {
    return {
      isValid: false,
      error: createCategoryError(sourceUnit, targetUnit, sourceInfo.category, targetInfo.category)
    };
  }

  return { isValid: true };
}

/**
 * Gets information about precision handling
 */
export function getPrecisionInfo(): {
  decimalPrecision: number;
  roundingMode: string;
  scientificNotationThresholds: {
    upper: number;
    lower: number;
  };
} {
  return {
    decimalPrecision: 40,
    roundingMode: 'ROUND_HALF_UP',
    scientificNotationThresholds: {
      upper: 1e12,
      lower: 1e-6
    }
  };
}
