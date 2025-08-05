import { lengthUnits } from '../data/units';
import { Unit } from '../types/units';

// Get all unit names and aliases
function getAllUnitNames(): string[] {
  return lengthUnits.flatMap((unit) => [unit.name, ...unit.aliases]);
}

// Get all units as objects for category filtering
function getAllUnits(): Unit[] {
  return lengthUnits;
}

/**
 * Get unit suggestions based on partial input
 */
export function getUnitSuggestions(partialInput: string): string[] {
  if (!partialInput.trim()) {
    return [];
  }

  const input = partialInput.toLowerCase().trim();
  const allUnits = getAllUnits();

  // Find matching units and return their main names
  const matches: string[] = [];

  allUnits.forEach((unit) => {
    // Check if any alias matches
    const matchingAliases = unit.aliases.filter((alias) =>
      alias.toLowerCase().includes(input)
    );

    if (matchingAliases.length > 0) {
      matches.push(unit.name);
    }
  });

  // Sort by relevance - prioritize units whose name or primary alias starts with the input
  const sorted = matches.sort((a, b) => {
    const unitA = allUnits.find((u) => u.name === a)!;
    const unitB = allUnits.find((u) => u.name === b)!;

    const aStartsWithInput =
      unitA.name.toLowerCase().startsWith(input) ||
      unitA.aliases.some((alias) => alias.toLowerCase().startsWith(input));
    const bStartsWithInput =
      unitB.name.toLowerCase().startsWith(input) ||
      unitB.aliases.some((alias) => alias.toLowerCase().startsWith(input));

    if (aStartsWithInput && !bStartsWithInput) return -1;
    if (!aStartsWithInput && bStartsWithInput) return 1;

    return a.localeCompare(b);
  });

  // Remove duplicates and limit results
  const uniqueMatches = Array.from(new Set(sorted));
  return uniqueMatches.slice(0, 8);
}

/**
 * Find partial matches in unit names
 */
export function findPartialMatches(
  input: string,
  unitNames: string[]
): string[] {
  const exactMatches: string[] = [];
  const prefixMatches: string[] = [];
  const containsMatches: string[] = [];

  unitNames.forEach((name) => {
    const lowerName = name.toLowerCase();

    if (lowerName === input) {
      exactMatches.push(name);
    } else if (lowerName.startsWith(input)) {
      prefixMatches.push(name);
    } else if (lowerName.includes(input)) {
      containsMatches.push(name);
    }
  });

  // Sort prefix matches to prioritize exact prefix matches at the start
  prefixMatches.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    // If both start with input, prioritize by length (shorter first)
    if (aLower.startsWith(input) && bLower.startsWith(input)) {
      return a.length - b.length;
    }

    return a.localeCompare(b);
  });

  // Return in order of relevance: exact, prefix, contains
  return [...exactMatches, ...prefixMatches, ...containsMatches];
}

/**
 * Get target unit suggestions based on source unit
 */
export function getTargetUnitSuggestions(sourceUnit: string): string[] {
  const sourceUnitObj = findUnitByName(sourceUnit);

  if (!sourceUnitObj) {
    return [];
  }

  // Get all units in the same category, excluding the source unit
  const sameCategory = getAllUnits()
    .filter((unit) => unit.category.id === sourceUnitObj.category.id)
    .filter((unit) => unit.name !== sourceUnit)
    .map((unit) => unit.name);

  // Prioritize common conversions for length units
  if (sourceUnitObj.category.id === 'length') {
    return prioritizeCommonLengthConversions(sourceUnit, sameCategory);
  }

  return sameCategory;
}

/**
 * Find unit object by name or alias
 */
function findUnitByName(name: string): Unit | undefined {
  const lowerName = name.toLowerCase();

  return getAllUnits().find((unit) => {
    const unitNames = [unit.name, ...unit.aliases].map((n) => n.toLowerCase());
    return unitNames.includes(lowerName);
  });
}

/**
 * Prioritize common length conversions
 */
function prioritizeCommonLengthConversions(
  sourceUnit: string,
  availableUnits: string[]
): string[] {
  const commonConversions: Record<string, string[]> = {
    meter: ['foot', 'inch', 'centimeter'],
    foot: ['meter', 'inch', 'centimeter'],
    inch: ['centimeter', 'millimeter', 'foot'],
    centimeter: ['inch', 'millimeter', 'meter'],
    kilometer: ['mile', 'meter'],
    mile: ['kilometer', 'foot'],
    yard: ['meter', 'foot'],
    millimeter: ['inch', 'centimeter'],
  };

  const lowerSourceUnit = sourceUnit.toLowerCase();
  const prioritized = commonConversions[lowerSourceUnit] || [];

  // Filter to only include available units and add remaining units
  const prioritizedAvailable = prioritized.filter((unit) =>
    availableUnits.includes(unit)
  );
  const remaining = availableUnits.filter(
    (unit) => !prioritizedAvailable.includes(unit)
  );

  return [...prioritizedAvailable, ...remaining];
}
