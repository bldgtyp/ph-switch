// TypeScript type definitions for unit configurations and conversions

export interface UnitDefinition {
  name: string;
  symbol: string;
  aliases: string[];
  // Optional numeric factor for simple multiplicative units (UI convenience)
  factor?: number;
  description?: string;
  precision?: number;
}

export interface TransformDefinition {
  toBase: string; // expression using 'x' to convert unit -> base
  fromBase: string; // expression using 'x' to convert base -> unit
}

// UnitDefinition prefers a transform-based definition. A unit may either
// provide a full transform (preferred) or omit it and rely on a numeric factor.
export type UnitDefinitionWithOptionalTransform =
  | (UnitDefinition & { transform: TransformDefinition })
  | (UnitDefinition & { transform?: undefined });

// Re-export under the original name for compatibility
export type UnitDefinitionType = UnitDefinitionWithOptionalTransform;

export interface UnitCategory {
  category: string;
  baseUnit: string;
  description?: string;
  units: Record<string, UnitDefinitionType>;
}

export interface ConversionResult {
  success: boolean;
  value?: number;
  formattedValue?: string;
  sourceUnit?: string;
  targetUnit?: string;
  error?: string | ErrorDetails;
  suggestions?: string[];
  calculation?: {
    inputValue: number;
    sourceUnit: string;
    targetUnit: string;
    outputValue: number;
    precision: string;
    category: string;
  };
}

export interface ParsedInput {
  value: number;
  sourceUnit: string;
  targetUnit: string;
  originalInput: string;
}

export interface ConversionHistory {
  id: string;
  timestamp: number;
  input: string;
  output: string;
  sourceUnit: string;
  targetUnit: string;
  value: number;
  result: number;
}

export interface ErrorDetails {
  type:
    | 'INVALID_FORMAT'
    | 'UNKNOWN_UNIT'
    | 'CALCULATION_ERROR'
    | 'CONFIGURATION_ERROR';
  message: string;
  context?: string;
  suggestions?: string[];
  position?: {
    start: number;
    end: number;
  };
}

export interface ConfigurationLoadResult {
  success: boolean;
  categories?: Record<string, UnitCategory>;
  error?: string;
}

// Utility types for better type safety
export type UnitKey = string;
export type CategoryKey = string;
export type ConversionFactor = number;

// Configuration validation result
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}
