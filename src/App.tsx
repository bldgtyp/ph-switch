import React, { useState, useCallback } from 'react';
import './styles/App.css';
import { ConversionInput, ConversionOutput, ErrorMessage } from './components';
import { mockConvertInput, MockConversionResult } from './utils/mockConverter';

interface ConversionResult {
  id: string;
  input: string;
  output?: string;
  error?: string;
  success: boolean;
}

function App() {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const convertMockToConversionResult = (
    mockResult: MockConversionResult,
    originalInput: string,
    lineIndex: number
  ): ConversionResult => {
    if (mockResult.success && mockResult.value) {
      return {
        id: `result-${lineIndex}`,
        input: originalInput,
        output: `${mockResult.value} ${mockResult.targetUnit || ''}`.trim(),
        success: true,
      };
    } else {
      return {
        id: `error-${lineIndex}`,
        input: originalInput,
        error: mockResult.error?.message || 'Unknown error',
        success: false,
      };
    }
  };

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setProcessingError(null);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      // Process each line separately
      const lines = value.split('\n').filter((line) => line.trim());
      const conversionResults: ConversionResult[] = [];

      lines.forEach((line, index) => {
        try {
          const mockResult = mockConvertInput(line.trim());
          const result = convertMockToConversionResult(
            mockResult,
            line.trim(),
            index
          );
          conversionResults.push(result);
        } catch (error) {
          // Add error result for this line
          conversionResults.push({
            id: `parse-error-${index}`,
            input: line.trim(),
            error: error instanceof Error ? error.message : 'Parse error',
            success: false,
          });
        }
      });

      setResults(conversionResults);
    } catch (error) {
      setProcessingError(
        error instanceof Error ? error.message : 'Conversion failed'
      );
      setResults([]);
    }
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    // For now, just log the suggestion - will be enhanced in Phase 2
    console.log('Suggestion clicked:', suggestion);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__content">
          <h1 className="app-title">PH-Switch Unit Converter</h1>
          <p className="app-subtitle">
            Fast conversions for Passive House engineering
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="conversion-interface">
          <div className="conversion-panel conversion-panel--input">
            <div className="conversion-panel__header">
              <h2 className="conversion-panel__title">Input</h2>
              <p className="conversion-panel__description">
                Enter conversions like "5 meters to feet"
              </p>
            </div>
            <div className="conversion-panel__content">
              <ConversionInput
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter conversions, one per line:&#10;5 meters to feet&#10;10 inches as cm&#10;2.5 miles to km"
                aria-label="Unit conversion input - enter conversions like '5 meters to feet'"
              />
            </div>
          </div>

          <div className="conversion-separator">
            <div className="conversion-separator__line" />
            <div className="conversion-separator__icon" aria-hidden="true">
              ⇄
            </div>
            <div className="conversion-separator__line" />
          </div>

          <div className="conversion-panel conversion-panel--output">
            <div className="conversion-panel__header">
              <h2 className="conversion-panel__title">Results</h2>
              <p className="conversion-panel__description">
                Click results to copy to clipboard
              </p>
            </div>
            <div className="conversion-panel__content">
              {processingError ? (
                <ErrorMessage
                  message={processingError}
                  suggestions={[
                    'Check your input format',
                    'Try "5 meters to feet"',
                  ]}
                  onSuggestionClick={handleSuggestionClick}
                />
              ) : (
                <ConversionOutput
                  results={results}
                  aria-label="Conversion results - click to copy values"
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="app-footer__content">
          <p className="app-footer__text">
            Made for Passive House professionals • No data collection • Works
            offline
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
