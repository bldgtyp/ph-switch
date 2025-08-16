import { parseInput, convertUnits, findUnit } from './conversions';
import { Unit } from '../types/units';

/**
 * Gets the plural form of a unit name
 */
function getUnitPluralForm(unit: Unit): string {
  // Look for plural forms in aliases
  const pluralForms = unit.aliases.filter(
    (alias) => alias.endsWith('s') || alias.endsWith('es') || alias === 'feet' // Special case for foot -> feet
  );

  // Return the longest plural form found, or the unit name + 's' as fallback
  if (pluralForms.length > 0) {
    return pluralForms.reduce((longest, current) =>
      current.length > longest.length ? current : longest
    );
  }

  // Fallback: add 's' to unit name
  return unit.name + 's';
}

/**
 * Swaps source and target units in a conversion input string
 * and returns the equivalent reverse conversion
 */
export function swapUnitsInInput(input: string): string {
  const parsed = parseInput(input);

  if (!parsed.isValid) {
    return input; // Return original if invalid
  }

  // Find the units to ensure they exist
  const sourceUnit = findUnit(parsed.sourceUnit);
  const targetUnit = findUnit(parsed.targetUnit);

  if (!sourceUnit || !targetUnit) {
    return input; // Return original if units not found
  }

  try {
    // Convert the original value to get the result value
    const conversionRequest = {
      value: parsed.value,
      sourceUnitId: sourceUnit.id,
      targetUnitId: targetUnit.id,
    };

    const result = convertUnits(conversionRequest);

    // Create the swapped input string
    const keyword = input.toLowerCase().includes(' as ') ? 'as' : 'to';
    const targetPluralName = getUnitPluralForm(targetUnit);
    const sourcePluralName = getUnitPluralForm(sourceUnit);
    const swappedInput = `${result.convertedValue} ${targetPluralName} ${keyword} ${sourcePluralName}`;

    return swappedInput;
  } catch (error) {
    return input; // Return original if conversion fails
  }
}

/**
 * Checks if the input can be swapped (i.e., is a valid conversion)
 */
export function canSwapUnits(input: string): boolean {
  const parsed = parseInput(input);

  if (!parsed.isValid) {
    return false;
  }

  // Check if both units exist
  const sourceUnit = findUnit(parsed.sourceUnit);
  const targetUnit = findUnit(parsed.targetUnit);

  return sourceUnit !== undefined && targetUnit !== undefined;
}

/**
 * Swaps units in multiple lines of input
 */
export function swapUnitsInMultipleLines(input: string): string {
  const lines = input.split('\n');
  const swappedLines = lines.map((line) => {
    if (line.trim() === '') {
      return line; // Keep empty lines as-is
    }
    return swapUnitsInInput(line.trim());
  });

  return swappedLines.join('\n');
}
