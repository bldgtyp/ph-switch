// Natural language parser for "X unit as/to Y unit" format
// Handles strict format validation and numerical value extraction

import { ParsedInput, ErrorDetails } from '../types';
import { findUnit } from '../config';

// Regex patterns for parsing different input formats
const CONVERSION_PATTERNS = [
  // "5 meters to feet" or "5 meters as feet" - main pattern
  /^([0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)\s+([a-zA-Z][a-zA-Z0-9°\u00B5\u00C5\u2013\u2014\u2032\u2033\-\s]*?)\s+(?:to|as)\s+([a-zA-Z][a-zA-Z0-9°\u00B5\u00C5\u2013\u2014\u2032\u2033\-\s]*?)$/i,

  // "1/2 inch to mm" (fractions)
  /^([0-9]+\/[0-9]+)\s+([a-zA-Z][a-zA-Z0-9°\u00B5\u00C5\u2013\u2014\u2032\u2033\-\s]*?)\s+(?:to|as)\s+([a-zA-Z][a-zA-Z0-9°\u00B5\u00C5\u2013\u2014\u2032\u2033\-\s]*?)$/i,

  // "1 1/2 inches to cm" (mixed numbers)
  /^([0-9]+\s+[0-9]+\/[0-9]+)\s+([a-zA-Z][a-zA-Z0-9°\u00B5\u00C5\u2013\u2014\u2032\u2033\-\s]*?)\s+(?:to|as)\s+([a-zA-Z][a-zA-Z0-9°\u00B5\u00C5\u2013\u2014\u2032\u2033\-\s]*?)$/i,
];

/**
 * Parse a numerical value that may be in various formats
 * Supports: decimals, scientific notation, fractions, mixed numbers
 */
export function parseNumericalValue(valueStr: string): number | null {
  const trimmed = valueStr.trim();

  // Handle scientific notation (e.g., "1.5e3", "2E-4")
  if (/^[0-9]+(?:\.[0-9]+)?[eE][+-]?[0-9]+$/.test(trimmed)) {
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? null : parsed;
  }

  // Handle regular decimals (e.g., "5.5", "123", "0.001")
  if (/^[0-9]+(?:\.[0-9]+)?$/.test(trimmed)) {
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? null : parsed;
  }

  // Handle simple fractions (e.g., "1/2", "3/4")
  const fractionMatch = trimmed.match(/^([0-9]+)\/([0-9]+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1]);
    const denominator = parseInt(fractionMatch[2]);
    if (denominator === 0) return null;
    return numerator / denominator;
  }

  // Handle mixed numbers (e.g., "1 1/2", "2 3/4")
  const mixedMatch = trimmed.match(/^([0-9]+)\s+([0-9]+)\/([0-9]+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const numerator = parseInt(mixedMatch[2]);
    const denominator = parseInt(mixedMatch[3]);
    if (denominator === 0) return null;
    return whole + numerator / denominator;
  }

  return null;
}

/**
 * Clean and normalize unit strings for matching
 * Handles common variations and whitespace
 */
export function normalizeUnitString(unitStr: string): string {
  return (
    unitStr
      .trim()
      .toLowerCase()
      // Replace common unicode characters with ASCII equivalents
      .replace(/°/g, 'deg')
      .replace(/μ/g, 'u')
      .replace(/å/g, 'a') // Handle lowercase å
      .replace(/Å/g, 'a') // Handle uppercase Å
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Parse a single line of natural language input
 * Returns ParsedInput object or null if parsing fails
 */
export function parseConversionInput(
  input: string
): ParsedInput | ErrorDetails {
  const trimmed = input.trim();

  // Check for empty input
  if (!trimmed) {
    return {
      type: 'INVALID_FORMAT',
      message: 'Input cannot be empty',
      context: 'Empty input provided',
    };
  }

  // Try each pattern until one matches
  for (const pattern of CONVERSION_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const [, valueStr, sourceUnitStr, targetUnitStr] = match;

      // Parse the numerical value
      const value = parseNumericalValue(valueStr);
      if (value === null) {
        return {
          type: 'INVALID_FORMAT',
          message: `Invalid number format: "${valueStr}"`,
          context: `Could not parse "${valueStr}" as a valid number. Supported formats: decimals (5.5), scientific notation (1.5e3), fractions (1/2), mixed numbers (1 1/2)`,
          position: {
            start: 0,
            end: valueStr.length,
          },
        };
      }

      // Normalize unit strings
      const sourceUnit = normalizeUnitString(sourceUnitStr);
      const targetUnit = normalizeUnitString(targetUnitStr);

      // Validate that source and target units are different after normalization
      // Also check if they would resolve to the same unit via aliases
      if (sourceUnit === targetUnit) {
        return {
          type: 'INVALID_FORMAT',
          message: 'Source and target units cannot be the same',
          context: `Both units resolved to "${sourceUnit}". Please specify different units for conversion.`,
        };
      }

      return {
        value,
        sourceUnit,
        targetUnit,
        originalInput: trimmed,
      };
    }
  }

  // No pattern matched - provide helpful error message
  return {
    type: 'INVALID_FORMAT',
    message: 'Invalid conversion format',
    context:
      'Please use the format: "NUMBER UNIT to UNIT" or "NUMBER UNIT as UNIT". Examples: "5 meters to feet", "2.5 inches as millimeters", "1/2 foot to cm"',
    suggestions: [
      'Try: "5 meters to feet"',
      'Try: "2.5 inches as mm"',
      'Try: "1/2 foot to centimeters"',
      'Try: "1.5e3 mm to meters"',
    ],
  };
}

/**
 * Validate that units exist in the configuration
 * Returns error details if units are not found
 */
export function validateUnits(
  sourceUnit: string,
  targetUnit: string
): ErrorDetails | null {
  const sourceInfo = findUnit(sourceUnit);
  const targetInfo = findUnit(targetUnit);

  // Check if source unit exists
  if (!sourceInfo) {
    return {
      type: 'UNKNOWN_UNIT',
      message: `Unknown source unit: "${sourceUnit}"`,
      context: `The unit "${sourceUnit}" was not found in the configuration. Check spelling or try a different alias.`,
      suggestions: [], // Will be filled by fuzzy matching in errorHandler
    };
  }

  // Check if target unit exists
  if (!targetInfo) {
    return {
      type: 'UNKNOWN_UNIT',
      message: `Unknown target unit: "${targetUnit}"`,
      context: `The unit "${targetUnit}" was not found in the configuration. Check spelling or try a different alias.`,
      suggestions: [], // Will be filled by fuzzy matching in errorHandler
    };
  }

  // Check if units are in the same category
  if (sourceInfo.category !== targetInfo.category) {
    return {
      type: 'INVALID_FORMAT',
      message: `Cannot convert between different unit categories`,
      context: `"${sourceUnit}" is a ${sourceInfo.category} unit, but "${targetUnit}" is a ${targetInfo.category} unit. Conversions are only possible within the same category.`,
    };
  }

  return null; // All validations passed
}

/**
 * Parse and validate a complete conversion input
 * Combines parsing and unit validation
 */
export function parseAndValidateInput(
  input: string
): ParsedInput | ErrorDetails {
  // First parse the input format
  const parseResult = parseConversionInput(input);

  // If parsing failed, return the error
  if ('type' in parseResult) {
    return parseResult;
  }

  // Validate that the units exist and are compatible
  const validationError = validateUnits(
    parseResult.sourceUnit,
    parseResult.targetUnit
  );
  if (validationError) {
    return validationError;
  }

  // All checks passed
  return parseResult;
}

/**
 * Parse multiple lines of input
 * Returns array of results (either ParsedInput or ErrorDetails for each line)
 */
export function parseMultilineInput(
  input: string
): (ParsedInput | ErrorDetails)[] {
  const lines = input.split('\n').map((line) => line.trim());

  return lines.map((line) => {
    if (!line) {
      return {
        type: 'INVALID_FORMAT' as const,
        message: 'Empty line',
        context: 'Empty lines are ignored',
      };
    }

    return parseAndValidateInput(line);
  });
}

/**
 * Check if a parsing result indicates success
 */
export function isSuccessfulParse(
  result: ParsedInput | ErrorDetails
): result is ParsedInput {
  return !('type' in result);
}

/**
 * Extract all unique unit references from input (for suggestion purposes)
 */
export function extractUnitReferences(input: string): string[] {
  const units: Set<string> = new Set();

  // Try to extract units even from malformed input
  const words = input.toLowerCase().split(/\s+/);

  // Look for patterns that might be units
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Skip numbers and common words
    if (/^[0-9]/.test(word) || ['to', 'as', 'in'].includes(word)) {
      continue;
    }

    // Add potential unit
    if (word.length > 0) {
      units.add(word);
    }
  }

  return Array.from(units);
}
