import {
  ParsedInput,
  ConversionResult as ConversionResultType,
} from '../types/units';

export interface ConversionLineData {
  lineNumber: number;
  input: string;
  parsed: ParsedInput;
}

export interface ConversionResultData {
  lineNumber: number;
  input: string;
  result: ConversionResultType;
}

export interface ConversionErrorData {
  lineNumber: number;
  input: string;
  error: string;
}

export interface ConversionInputProps {
  onConversion: (results: ConversionLineData[]) => void;
  onError: (errors: ConversionErrorData[]) => void;
  placeholder?: string;
  debounceMs?: number;
}

export interface ConversionResultProps {
  results: ConversionResultData[];
  errors: ConversionErrorData[];
}
