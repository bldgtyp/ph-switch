import React, { useState } from 'react';
import ConversionInputWithSuggestions from './ConversionInputWithSuggestions';
import ConversionResult from './ConversionResult';
import {
  ConversionLineData,
  ConversionErrorData,
  ConversionResultData,
} from '../types/components';
import { convertUnits, findUnit } from '../utils/conversions';

const ConverterAppWithSuggestions: React.FC = () => {
  const [results, setResults] = useState<ConversionResultData[]>([]);
  const [errors, setErrors] = useState<ConversionErrorData[]>([]);

  const handleConversion = (conversions: ConversionLineData[]) => {
    const conversionResults: ConversionResultData[] = conversions.map(
      (conv) => {
        // Convert ParsedInput to ConversionRequest
        const sourceUnit = findUnit(conv.parsed.sourceUnit);
        const targetUnit = findUnit(conv.parsed.targetUnit);

        if (!sourceUnit || !targetUnit) {
          // This shouldn't happen if parsing was successful, but handle it gracefully
          throw new Error('Unit not found during conversion');
        }

        const conversionRequest = {
          value: conv.parsed.value,
          sourceUnitId: sourceUnit.id,
          targetUnitId: targetUnit.id,
        };

        return {
          lineNumber: conv.lineNumber,
          input: conv.input,
          result: convertUnits(conversionRequest),
        };
      }
    );

    setResults(conversionResults);
  };

  const handleError = (conversionErrors: ConversionErrorData[]) => {
    setErrors(conversionErrors);
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <header
        style={{
          marginBottom: '24px',
          textAlign: 'center' as const,
        }}
      >
        <h1
          style={{
            color: '#333',
            fontSize: '2.5rem',
            fontWeight: 300,
            margin: '0 0 8px 0',
          }}
        >
          PH-Switch
        </h1>
        <p
          style={{
            color: '#666',
            fontSize: '1.1rem',
            margin: '0',
            lineHeight: '1.4',
          }}
        >
          Unit conversion tool for Passive House professionals
        </p>
      </header>

      <main>
        <ConversionInputWithSuggestions
          onConversion={handleConversion}
          onError={handleError}
        />

        <ConversionResult results={results} errors={errors} />
      </main>

      <footer
        style={{
          marginTop: '40px',
          textAlign: 'center' as const,
          color: '#999',
          fontSize: '14px',
        }}
      >
        <p>
          Enter natural language conversions like "13 meters as feet" or "5.5 km
          to miles"
        </p>
        <p style={{ marginTop: '8px', fontSize: '13px', color: '#bbb' }}>
          Type partial unit names to see suggestions • Click suggestions to
          auto-complete
        </p>
      </footer>
    </div>
  );
};

export default ConverterAppWithSuggestions;
