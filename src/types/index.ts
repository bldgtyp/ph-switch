// TypeScript type definitions for unit configurations and conversions

export interface UnitDefinition {
  name: string;
  symbol: string;
  aliases: string[];
  factor: number;
  description?: string;
  precision?: number;
}

export interface UnitCategory {
  category: string;
  baseUnit: string;
  description?: string;
  units: Record<string, UnitDefinition>;
}

export interface ConversionResult {
  success: boolean;
  value?: number;
  formattedValue?: string;
  sourceUnit?: string;
  targetUnit?: string;
  error?: string;
  suggestions?: string[];
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
  type: 'INVALID_FORMAT' | 'UNKNOWN_UNIT' | 'CALCULATION_ERROR' | 'CONFIGURATION_ERROR';
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
