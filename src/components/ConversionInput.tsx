import React, { useState, useCallback, useEffect } from 'react';
import { parseInput } from '../utils/conversions';
import {
  ConversionInputProps,
  ConversionLineData,
  ConversionErrorData,
} from '../types/components';

const ConversionInput: React.FC<ConversionInputProps> = ({
  onConversion,
  onError,
  placeholder = '13 meters as feet\n5.5 km to miles\n100 cm as inches',
  debounceMs = 300,
}) => {
  const [input, setInput] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const processInput = useCallback(
    (text: string) => {
      const lines = text.split('\n');
      const validResults: ConversionLineData[] = [];
      const errors: ConversionErrorData[] = [];

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Skip empty lines
        if (!trimmedLine) {
          return;
        }

        const parsed = parseInput(trimmedLine);

        if (parsed.isValid) {
          validResults.push({
            lineNumber: index,
            input: trimmedLine,
            parsed,
          });
        } else {
          errors.push({
            lineNumber: index,
            input: trimmedLine,
            error: parsed.error || 'Unknown error',
          });
        }
      });

      // Call callbacks with results
      if (validResults.length > 0) {
        onConversion(validResults);
      }

      if (errors.length > 0) {
        onError(errors);
      }
    },
    [onConversion, onError]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      setInput(newValue);

      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new timer for debounced processing
      const timer = setTimeout(() => {
        processInput(newValue);
      }, debounceMs);

      setDebounceTimer(timer);
    },
    [debounceTimer, debounceMs, processInput]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className="conversion-input">
      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="conversion-textarea"
        rows={6}
        autoFocus
        spellCheck={false}
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '12px',
          fontSize: '16px',
          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          resize: 'vertical',
          outline: 'none',
          lineHeight: '1.5',
        }}
      />
    </div>
  );
};

export default ConversionInput;
