import React, { useState, useCallback } from 'react';
import ConversionInput from './ConversionInput';
import ConversionResult from './ConversionResult';
import {
  ConversionLineData,
  ConversionErrorData,
  ConversionResultData,
} from '../types/components';
import { convertUnits, findUnit } from '../utils/conversions';

const ConverterApp: React.FC = () => {
  const [results, setResults] = useState<ConversionResultData[]>([]);
  const [errors, setErrors] = useState<ConversionErrorData[]>([]);

  const handleConversion = useCallback(
    (conversionData: ConversionLineData[]) => {
      const newResults: ConversionResultData[] = [];

      conversionData.forEach((data) => {
        const { parsed, lineNumber, input } = data;

        // Find units
        const sourceUnit = findUnit(parsed.sourceUnit);
        const targetUnit = findUnit(parsed.targetUnit);

        if (!sourceUnit || !targetUnit) {
          // This shouldn't happen if parsing was successful, but handle gracefully
          setErrors((prev) => [
            ...prev.filter((e) => e.lineNumber !== lineNumber),
            {
              lineNumber,
              input,
              error: 'Unit not found',
            },
          ]);
          return;
        }

        try {
          const conversionResult = convertUnits({
            value: parsed.value,
            sourceUnitId: sourceUnit.id,
            targetUnitId: targetUnit.id,
          });

          newResults.push({
            lineNumber,
            input,
            result: conversionResult,
          });
        } catch (error) {
          setErrors((prev) => [
            ...prev.filter((e) => e.lineNumber !== lineNumber),
            {
              lineNumber,
              input,
              error:
                error instanceof Error ? error.message : 'Conversion failed',
            },
          ]);
        }
      });

      // Update results state - replace results for the same line numbers
      setResults((prev) => {
        const updatedResults = [...prev];
        newResults.forEach((newResult) => {
          const existingIndex = updatedResults.findIndex(
            (r) => r.lineNumber === newResult.lineNumber
          );
          if (existingIndex >= 0) {
            updatedResults[existingIndex] = newResult;
          } else {
            updatedResults.push(newResult);
          }
        });
        return updatedResults;
      });

      // Clear errors for successful conversions
      const successfulLines = newResults.map((r) => r.lineNumber);
      setErrors((prev) =>
        prev.filter((e) => !successfulLines.includes(e.lineNumber))
      );
    },
    []
  );

  const handleError = useCallback((errorData: ConversionErrorData[]) => {
    // Update errors state - replace errors for the same line numbers
    setErrors((prev) => {
      const updatedErrors = [...prev];
      errorData.forEach((newError) => {
        const existingIndex = updatedErrors.findIndex(
          (e) => e.lineNumber === newError.lineNumber
        );
        if (existingIndex >= 0) {
          updatedErrors[existingIndex] = newError;
        } else {
          updatedErrors.push(newError);
        }
      });
      return updatedErrors;
    });

    // Clear successful results for error lines
    const errorLines = errorData.map((e) => e.lineNumber);
    setResults((prev) =>
      prev.filter((r) => !errorLines.includes(r.lineNumber))
    );
  }, []);

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
      <header style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1
          style={{
            color: '#333',
            fontSize: '2.5rem',
            fontWeight: '300',
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
        <ConversionInput
          onConversion={handleConversion}
          onError={handleError}
        />

        <ConversionResult results={results} errors={errors} />
      </main>

      <footer
        style={{
          marginTop: '40px',
          textAlign: 'center',
          color: '#999',
          fontSize: '14px',
        }}
      >
        <p>
          Enter natural language conversions like "13 meters as feet" or "5.5 km
          to miles"
        </p>
      </footer>
    </div>
  );
};

export default ConverterApp;
