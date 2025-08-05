import {
  Unit,
  ConversionRequest,
  ConversionResult,
  ParsedInput,
} from '../types/units';
import { allUnits } from '../data/units';

/**
 * Finds a unit by name or alias (case-insensitive)
 */
export function findUnit(unitName: string): Unit | undefined {
  const normalizedName = unitName.toLowerCase().trim();
  return allUnits.find((unit) =>
    unit.aliases.some((alias) => alias.toLowerCase() === normalizedName)
  );
}

/**
 * Converts a value from one unit to another
 */
export function convertUnits(request: ConversionRequest): ConversionResult {
  const sourceUnit = allUnits.find((u) => u.id === request.sourceUnitId);
  const targetUnit = allUnits.find((u) => u.id === request.targetUnitId);

  if (!sourceUnit || !targetUnit) {
    throw new Error('Unit not found');
  }

  if (sourceUnit.category.id !== targetUnit.category.id) {
    throw new Error('Cannot convert between different unit categories');
  }

  // Convert source to base unit, then to target unit
  const baseValue = request.value * sourceUnit.conversionFactor;
  const convertedValue = baseValue / targetUnit.conversionFactor;

  // Calculate appropriate precision
  const precision = calculatePrecision(convertedValue, targetUnit);

  return {
    originalValue: request.value,
    convertedValue: Number(convertedValue.toFixed(precision)),
    sourceUnit,
    targetUnit,
    precision,
  };
}

/**
 * Calculates appropriate precision based on unit type and value magnitude
 */
export function calculatePrecision(value: number, unit: Unit): number {
  const absValue = Math.abs(value);

  // Large units (km, miles) - fewer decimal places
  if (unit.id === 'kilometer' || unit.id === 'mile') {
    if (absValue >= 1000) return 0;
    if (absValue >= 100) return 1;
    if (absValue >= 10) return 2;
    return 3;
  }

  // Small units (mm, inches) - more decimal places
  if (unit.id === 'millimeter' || unit.id === 'inch') {
    if (absValue >= 1000) return 0;
    if (absValue >= 100) return 1;
    if (absValue >= 10) return 2;
    if (absValue >= 1) return 3;
    return 4;
  }

  // Medium units (meters, feet, etc.) - moderate precision
  if (absValue >= 1000) return 0;
  if (absValue >= 100) return 1;
  if (absValue >= 10) return 2;
  if (absValue >= 1) return 3;
  return 4;
}

/**
 * Parses natural language input like "13 meters as feet"
 */
export function parseInput(input: string): ParsedInput {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      value: 0,
      sourceUnit: '',
      targetUnit: '',
      keyword: 'as',
      isValid: false,
      error: 'Input is empty',
    };
  }

  // Regex to match: number + unit + (as|to) + unit
  const regex =
    /^(\d+(?:\.\d+)?)\s+([a-zA-Z'"\s]+?)\s+(as|to)\s+([a-zA-Z'"\s]+)$/i;
  const match = trimmedInput.match(regex);

  if (!match) {
    return {
      value: 0,
      sourceUnit: '',
      targetUnit: '',
      keyword: 'as',
      isValid: false,
      error:
        'Invalid format. Use: "number unit as/to unit" (e.g., "13 meters as feet")',
    };
  }

  const [, valueStr, sourceUnitStr, keyword, targetUnitStr] = match;
  const value = parseFloat(valueStr);

  // Validate numeric range
  if (value < 0.001 || value > 999999999) {
    return {
      value,
      sourceUnit: sourceUnitStr.trim(),
      targetUnit: targetUnitStr.trim(),
      keyword: keyword.toLowerCase() as 'as' | 'to',
      isValid: false,
      error: 'Value must be between 0.001 and 999,999,999',
    };
  }

  return {
    value,
    sourceUnit: sourceUnitStr.trim(),
    targetUnit: targetUnitStr.trim(),
    keyword: keyword.toLowerCase() as 'as' | 'to',
    isValid: true,
  };
}

/**
 * Validates if two units can be converted between each other
 */
export function canConvert(sourceUnit: Unit, targetUnit: Unit): boolean {
  return sourceUnit.category.id === targetUnit.category.id;
}
