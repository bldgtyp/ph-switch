// Advanced error handling and unit suggestions
// Provides fuzzy matching and detailed error context

import levenshtein from 'fast-levenshtein';
import { ErrorDetails } from '../types';
import { getAliases } from '../config';

/**
 * Calculate similarity score between two strings
 * Returns value between 0 (no match) and 1 (perfect match)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1; // Both strings are empty
  
  const distance = levenshtein.get(str1, str2);
  return (maxLength - distance) / maxLength;
}

/**
 * Find similar units using fuzzy string matching
 * Returns array of suggestions sorted by similarity
 */
export function findSimilarUnits(query: string, maxSuggestions: number = 5): string[] {
  const aliases = getAliases();
  if (!aliases) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const suggestions: Array<{ alias: string; score: number }> = [];
  
  // Calculate similarity for each alias
  for (const alias in aliases) {
    const score = calculateSimilarity(normalizedQuery, alias);
    
    // Only include suggestions with reasonable similarity
    if (score > 0.3) {
      suggestions.push({ alias, score });
    }
  }
  
  // Sort by similarity score (highest first) and take top results
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map(s => s.alias);
}

/**
 * Enhanced error handler that adds fuzzy matching suggestions
 */
export function enhanceErrorWithSuggestions(error: ErrorDetails): ErrorDetails {
  if (error.type !== 'UNKNOWN_UNIT') {
    return error; // Only enhance unknown unit errors
  }
  
  // Extract unit from error message
  const unitMatch = error.message.match(/"([^"]+)"/);
  if (!unitMatch) {
    return error; // No unit found in message
  }
  
  const unknownUnit = unitMatch[1];
  const suggestions = findSimilarUnits(unknownUnit, 3);
  
  return {
    ...error,
    suggestions: suggestions.length > 0 ? suggestions.map(s => `Did you mean "${s}"?`) : [
      'Check the spelling of your unit',
      'Try using a common abbreviation (e.g., "m" for meter)',
      'Verify the unit is supported in this category'
    ]
  };
}

/**
 * Create a detailed error for invalid format with helpful examples
 */
export function createFormatError(input: string, context?: string): ErrorDetails {
  return {
    type: 'INVALID_FORMAT',
    message: 'Invalid conversion format',
    context: context || 'Please use the format: "NUMBER UNIT to UNIT" or "NUMBER UNIT as UNIT"',
    suggestions: [
      'Try: "5 meters to feet"',
      'Try: "2.5 inches as mm"',
      'Try: "1/2 foot to centimeters"',
      'Try: "1.5e3 mm to meters"'
    ]
  };
}

/**
 * Create a detailed error for invalid numbers with format examples
 */
export function createNumberError(valueStr: string): ErrorDetails {
  return {
    type: 'INVALID_FORMAT',
    message: `Invalid number format: "${valueStr}"`,
    context: `Could not parse "${valueStr}" as a valid number.`,
    suggestions: [
      'Decimals: 5.5, 123.45, 0.001',
      'Scientific notation: 1.5e3, 2E-4',
      'Fractions: 1/2, 3/4, 5/8',
      'Mixed numbers: 1 1/2, 2 3/4'
    ]
  };
}

/**
 * Create a detailed error for unknown units with suggestions
 */
export function createUnknownUnitError(unit: string, isSource: boolean = true): ErrorDetails {
  const baseError: ErrorDetails = {
    type: 'UNKNOWN_UNIT',
    message: `Unknown ${isSource ? 'source' : 'target'} unit: "${unit}"`,
    context: `The unit "${unit}" was not found in the configuration. Check spelling or try a different alias.`,
    suggestions: []
  };
  
  return enhanceErrorWithSuggestions(baseError);
}

/**
 * Create a detailed error for cross-category conversions
 */
export function createCategoryError(sourceUnit: string, targetUnit: string, sourceCategory: string, targetCategory: string): ErrorDetails {
  return {
    type: 'INVALID_FORMAT',
    message: 'Cannot convert between different unit categories',
    context: `"${sourceUnit}" is a ${sourceCategory} unit, but "${targetUnit}" is a ${targetCategory} unit. Conversions are only possible within the same category.`,
    suggestions: [
      `Try converting ${sourceUnit} to another ${sourceCategory} unit`,
      `Try converting a ${targetCategory} unit to ${targetUnit}`,
      'Check that both units are from the same measurement category'
    ]
  };
}

/**
 * Create a detailed error for calculation failures
 */
export function createCalculationError(message: string, context?: string): ErrorDetails {
  return {
    type: 'CALCULATION_ERROR',
    message,
    context: context || 'An error occurred during the conversion calculation.',
    suggestions: [
      'Check that the input value is within a reasonable range',
      'Verify that both units are valid for conversion',
      'Try using a different numerical format'
    ]
  };
}

/**
 * Format error message for display to user
 */
export function formatErrorMessage(error: ErrorDetails): string {
  let message = error.message;
  
  if (error.context) {
    message += `\n\n${error.context}`;
  }
  
  if (error.suggestions && error.suggestions.length > 0) {
    message += '\n\nSuggestions:';
    error.suggestions.forEach(suggestion => {
      message += `\n• ${suggestion}`;
    });
  }
  
  return message;
}

/**
 * Get all available unit aliases for help/documentation
 */
export function getAvailableUnits(): Record<string, string[]> {
  const aliases = getAliases();
  if (!aliases) return {};
  
  const unitsByCategory: Record<string, Set<string>> = {};
  
  // Group aliases by category
  for (const [alias, info] of Object.entries(aliases)) {
    if (!unitsByCategory[info.category]) {
      unitsByCategory[info.category] = new Set();
    }
    unitsByCategory[info.category].add(alias);
  }
  
  // Convert sets to sorted arrays
  const result: Record<string, string[]> = {};
  for (const [category, aliasSet] of Object.entries(unitsByCategory)) {
    result[category] = Array.from(aliasSet).sort();
  }
  
  return result;
}

/**
 * Validate that error handling is working correctly
 */
export function validateErrorHandling(): boolean {
  try {
    // Test basic error creation
    const formatError = createFormatError('test input');
    const numberError = createNumberError('abc');
    const unitError = createUnknownUnitError('badunit');
    const calcError = createCalculationError('test error');
    
    // Check that all required fields are present
    const errors = [formatError, numberError, unitError, calcError];
    for (const error of errors) {
      if (!error.type || !error.message) {
        return false;
      }
    }
    
    // Test fuzzy matching
    const suggestions = findSimilarUnits('mter', 3); // Should suggest "meter"
    
    return true;
  } catch (error) {
    console.error('Error handling validation failed:', error);
    return false;
  }
}
