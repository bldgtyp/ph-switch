// Mock conversion engine for UI testing (Phase 1 only)
// This will be replaced with real conversion logic in Phase 2

// Simple hardcoded conversion logic for testing UI components
// Supports basic length units as specified in PRD requirements

// Mock conversion data - hardcoded for Phase 1 testing
const MOCK_CONVERSIONS: Record<string, Record<string, number>> = {
  // Length conversions (all relative to meters as base unit)
  meter: {
    meter: 1,
    foot: 3.28084,
    inch: 39.3701,
    centimeter: 100,
    millimeter: 1000,
    kilometer: 0.001,
    yard: 1.09361,
    mile: 0.000621371,
  },
  foot: {
    meter: 0.3048,
    foot: 1,
    inch: 12,
    centimeter: 30.48,
    millimeter: 304.8,
    kilometer: 0.0003048,
    yard: 0.333333,
    mile: 0.000189394,
  },
  inch: {
    meter: 0.0254,
    foot: 0.0833333,
    inch: 1,
    centimeter: 2.54,
    millimeter: 25.4,
    kilometer: 0.0000254,
    yard: 0.0277778,
    mile: 0.0000157828,
  },
  centimeter: {
    meter: 0.01,
    foot: 0.0328084,
    inch: 0.393701,
    centimeter: 1,
    millimeter: 10,
    kilometer: 0.00001,
    yard: 0.0109361,
    mile: 0.00000621371,
  },
  millimeter: {
    meter: 0.001,
    foot: 0.00328084,
    inch: 0.0393701,
    centimeter: 0.1,
    millimeter: 1,
    kilometer: 0.000001,
    yard: 0.00109361,
    mile: 0.000000621371,
  },
  kilometer: {
    meter: 1000,
    foot: 3280.84,
    inch: 39370.1,
    centimeter: 100000,
    millimeter: 1000000,
    kilometer: 1,
    yard: 1093.61,
    mile: 0.621371,
  },
  yard: {
    meter: 0.9144,
    foot: 3,
    inch: 36,
    centimeter: 91.44,
    millimeter: 914.4,
    kilometer: 0.0009144,
    yard: 1,
    mile: 0.000568182,
  },
  mile: {
    meter: 1609.34,
    foot: 5280,
    inch: 63360,
    centimeter: 160934,
    millimeter: 1609340,
    kilometer: 1.60934,
    yard: 1760,
    mile: 1,
  },
};

// Add aliases for common unit variations
const UNIT_ALIASES: Record<string, string> = {
  // Meter aliases
  m: 'meter',
  metre: 'meter',
  metres: 'meter',
  meters: 'meter',
  
  // Foot aliases
  feet: 'foot',
  ft: 'foot',
  
  // Inch aliases
  inches: 'inch',
  in: 'inch',
  
  // Centimeter aliases
  centimeters: 'centimeter',
  cm: 'centimeter',
  
  // Millimeter aliases
  millimeters: 'millimeter',
  mm: 'millimeter',
  
  // Kilometer aliases
  kilometers: 'kilometer',
  km: 'kilometer',
  
  // Yard aliases
  yards: 'yard',
  yd: 'yard',
  
  // Mile aliases
  miles: 'mile',
  mi: 'mile',
};

// Error types for mock error handling
export enum MockConversionErrorType {
  INVALID_FORMAT = 'invalid_format',
  UNKNOWN_UNIT = 'unknown_unit',
  INVALID_VALUE = 'invalid_value',
}

export interface MockConversionError {
  type: MockConversionErrorType;
  message: string;
  suggestions?: string[];
}

export interface MockConversionResult {
  success: boolean;
  value?: string; // Formatted result with 3 decimal places and comma separators
  rawValue?: number;
  error?: MockConversionError;
  sourceUnit?: string;
  targetUnit?: string;
}

// Format number to 3 decimal places with comma thousands separators
function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}

// Get unit suggestions for unknown units
function getUnitSuggestions(unknownUnit: string): string[] {
  const allUnits = Object.keys(UNIT_ALIASES).concat(Object.keys(MOCK_CONVERSIONS));
  const suggestions: string[] = [];
  const unknown = unknownUnit.toLowerCase();
  
  // Exact prefix match
  for (const unit of allUnits) {
    if (unit.toLowerCase().startsWith(unknown)) {
      suggestions.push(unit);
    }
  }
  
  // If no prefix matches, try contains
  if (suggestions.length === 0) {
    for (const unit of allUnits) {
      if (unit.toLowerCase().includes(unknown)) {
        suggestions.push(unit);
      }
    }
  }
  
  // If still no matches, find units starting with same first letter
  if (suggestions.length === 0) {
    for (const unit of allUnits) {
      if (unit.toLowerCase().startsWith(unknown.charAt(0))) {
        suggestions.push(unit);
      }
    }
  }
  
  return Array.from(new Set(suggestions)).slice(0, 3); // Remove duplicates and return max 3
}

// Normalize unit name (handle aliases and case)
function normalizeUnit(unit: string): string {
  const normalizedUnit = unit.toLowerCase().trim();
  return UNIT_ALIASES[normalizedUnit] || normalizedUnit;
}

// Mock converter function - converts using hardcoded conversion factors
export function mockConvert(
  value: number,
  fromUnit: string,
  toUnit: string
): MockConversionResult {
  // Normalize units
  const normalizedFromUnit = normalizeUnit(fromUnit);
  const normalizedToUnit = normalizeUnit(toUnit);
  
  // Check if source unit exists
  if (!MOCK_CONVERSIONS[normalizedFromUnit]) {
    return {
      success: false,
      error: {
        type: MockConversionErrorType.UNKNOWN_UNIT,
        message: `Unknown unit '${fromUnit}'. Did you mean one of these?`,
        suggestions: getUnitSuggestions(fromUnit),
      },
    };
  }
  
  // Check if target unit exists for the source unit
  if (!MOCK_CONVERSIONS[normalizedFromUnit][normalizedToUnit]) {
    return {
      success: false,
      error: {
        type: MockConversionErrorType.UNKNOWN_UNIT,
        message: `Unknown unit '${toUnit}'. Did you mean one of these?`,
        suggestions: getUnitSuggestions(toUnit),
      },
    };
  }
  
  // Perform conversion
  const conversionFactor = MOCK_CONVERSIONS[normalizedFromUnit][normalizedToUnit];
  const rawValue = value * conversionFactor;
  
  return {
    success: true,
    value: formatNumber(rawValue),
    rawValue,
    sourceUnit: normalizedFromUnit,
    targetUnit: normalizedToUnit,
  };
}

// Parse basic "X unit as/to Y unit" format for mock testing
export function mockParseInput(input: string): {
  success: boolean;
  value?: number;
  fromUnit?: string;
  toUnit?: string;
  error?: MockConversionError;
} {
  const trimmedInput = input.trim();
  
  if (!trimmedInput) {
    return { success: false };
  }
  
  // Match patterns like "5 meters to feet" or "10 ft as inches"
  const patterns = [
    /^([0-9]*\.?[0-9]+)\s+(\w+)\s+(?:to|as)\s+(\w+)$/i,
    /^([0-9]*\.?[0-9]+)\s*(\w+)\s+(?:to|as)\s+(\w+)$/i,
  ];
  
  for (const pattern of patterns) {
    const match = trimmedInput.match(pattern);
    if (match) {
      const [, valueStr, fromUnit, toUnit] = match;
      const value = parseFloat(valueStr);
      
      if (isNaN(value)) {
        return {
          success: false,
          error: {
            type: MockConversionErrorType.INVALID_VALUE,
            message: `Invalid number: ${valueStr}`,
          },
        };
      }
      
      return {
        success: true,
        value,
        fromUnit: fromUnit.toLowerCase(),
        toUnit: toUnit.toLowerCase(),
      };
    }
  }
  
  // Check if it might be an invalid number case
  const numberPattern = /^([a-zA-Z]+)\s+(\w+)\s+(?:to|as)\s+(\w+)$/i;
  const numberMatch = trimmedInput.match(numberPattern);
  if (numberMatch) {
    return {
      success: false,
      error: {
        type: MockConversionErrorType.INVALID_VALUE,
        message: `Invalid number: ${numberMatch[1]}`,
      },
    };
  }
  
  return {
    success: false,
    error: {
      type: MockConversionErrorType.INVALID_FORMAT,
      message: 'Invalid format. Use "X unit as/to Y unit" (e.g., "5 meters to feet")',
    },
  };
}

// Main mock conversion function that combines parsing and conversion
export function mockConvertInput(input: string): MockConversionResult {
  const parseResult = mockParseInput(input);
  
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error,
    };
  }
  
  const { value, fromUnit, toUnit } = parseResult;
  
  if (value === undefined || !fromUnit || !toUnit) {
    return {
      success: false,
      error: {
        type: MockConversionErrorType.INVALID_FORMAT,
        message: 'Failed to parse input',
      },
    };
  }
  
  return mockConvert(value, fromUnit, toUnit);
}

export default {
  mockConvert,
  mockParseInput,
  mockConvertInput,
  MockConversionErrorType,
};
