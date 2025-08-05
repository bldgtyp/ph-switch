// Unit system types and interfaces

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  aliases: string[];
  category: UnitCategory;
  baseUnit: string; // Reference to the base unit in this category
  conversionFactor: number; // Factor to convert to base unit
}

export interface UnitCategory {
  id: string;
  name: string;
  baseUnit: string; // The base unit for this category (e.g., 'meter' for length)
}

export interface ConversionRequest {
  value: number;
  sourceUnitId: string;
  targetUnitId: string;
}

export interface ConversionResult {
  originalValue: number;
  convertedValue: number;
  sourceUnit: Unit;
  targetUnit: Unit;
  precision: number;
}

export interface ParsedInput {
  value: number;
  sourceUnit: string;
  targetUnit: string;
  keyword: 'as' | 'to';
  isValid: boolean;
  error?: string;
}
