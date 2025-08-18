import React, { useState, useCallback, useMemo, useEffect } from 'react';
import debounce from 'lodash.debounce';
import './styles/App.css';
import { ConversionInput, ConversionOutput, ErrorMessage } from './components';
import { convertFromInput } from './utils/converter';
import { initializeConfigurations } from './config';
import { saveConversion } from './utils/storage';
import type { ConversionResult as ConverterResult } from './types';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfigurationLoaded, setIsConfigurationLoaded] = useState(false);
  const [configurationError, setConfigurationError] = useState<string | null>(
    null
  );

  // Initialize configuration system on app startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const success = await initializeConfigurations();
        if (success) {
          setIsConfigurationLoaded(true);
          console.log('App initialized successfully');
        } else {
          setConfigurationError('Failed to load unit configurations');
        }
      } catch (error) {
        console.error('App initialization failed:', error);
        setConfigurationError(
          error instanceof Error
            ? error.message
            : 'Configuration loading failed'
        );
      }
    };

    initializeApp();
  }, []);

  const convertToAppResult = (
    converterResult: ConverterResult,
    originalInput: string,
    lineIndex: number
  ): ConversionResult => {
    if (converterResult.success && converterResult.formattedValue) {
      return {
        id: `result-${lineIndex}`,
        input: originalInput,
        output:
          `${converterResult.formattedValue} ${converterResult.targetUnit || ''}`.trim(),
        success: true,
      };
    } else {
      return {
        id: `error-${lineIndex}`,
        input: originalInput,
        error:
          typeof converterResult.error === 'string'
            ? converterResult.error
            : converterResult.error?.message || 'Unknown error',
        success: false,
      };
    }
  };

  const processConversions = useCallback(
    async (value: string) => {
      setProcessingError(null);
      setIsProcessing(true);

      if (!value.trim()) {
        setResults([]);
        setIsProcessing(false);
        return;
      }

      if (!isConfigurationLoaded) {
        setProcessingError('Configuration not loaded yet. Please wait...');
        setIsProcessing(false);
        return;
      }

      try {
        // Process each line separately, including empty lines for alignment
        const lines = value.split('\n');
        const conversionResults: ConversionResult[] = [];

        // Process lines sequentially to maintain order
        for (let index = 0; index < lines.length; index++) {
          const line = lines[index];
          const trimmedLine = line.trim();

          if (!trimmedLine) {
            // Empty line - add placeholder for alignment
            conversionResults.push({
              id: `empty-${index}`,
              input: '',
              output: '',
              success: true,
            });
            continue;
          }

          try {
            const converterResult = await convertFromInput(trimmedLine);
            const result = convertToAppResult(
              converterResult,
              trimmedLine,
              index
            );
            conversionResults.push(result);

            // Save successful conversions to local storage
            if (converterResult.success && converterResult.formattedValue) {
              try {
                await saveConversion(
                  trimmedLine,
                  converterResult.formattedValue,
                  converterResult.sourceUnit || '',
                  converterResult.targetUnit || '',
                  converterResult.value || 0,
                  converterResult.value || 0,
                  'length', // Default category for now
                  converterResult.formattedValue
                );
              } catch (storageError) {
                console.warn(
                  'Failed to save conversion to storage:',
                  storageError
                );
                // Don't fail the conversion if storage fails
              }
            }
          } catch (error) {
            // Add error result for this line
            conversionResults.push({
              id: `parse-error-${index}`,
              input: trimmedLine,
              error: error instanceof Error ? error.message : 'Parse error',
              success: false,
            });
          }
        }

        setResults(conversionResults);
      } catch (error) {
        setProcessingError(
          error instanceof Error ? error.message : 'Conversion failed'
        );
        setResults([]);
      } finally {
        setIsProcessing(false);
      }
    },
    [isConfigurationLoaded]
  );

  // Debounced conversion processing for real-time updates
  const debouncedProcessConversions = useMemo(
    () => debounce(processConversions, 300),
    [processConversions]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      debouncedProcessConversions(value);
    },
    [debouncedProcessConversions]
  );

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
                  isProcessing={isProcessing}
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
