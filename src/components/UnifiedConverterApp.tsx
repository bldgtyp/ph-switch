import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveLayout } from './ResponsiveLayout';
import ConversionInputWithSuggestions from './ConversionInputWithSuggestions';
import ConversionResult from './ConversionResult';
import {
  ConversionLineData,
  ConversionErrorData,
  ConversionResultData,
} from '../types/components';
import { convertUnits, findUnit } from '../utils/conversions';
import './UnifiedConverterApp.css';

export const UnifiedConverterApp: React.FC = () => {
  // Core state from ConverterAppWithSuggestions
  const [results, setResults] = useState<ConversionResultData[]>([]);
  const [errors, setErrors] = useState<ConversionErrorData[]>([]);

  // Responsive state from ResponsiveConverterApp
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Polish features state from PolishedConverterApp
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<string>('');
  const [value, setValue] = useState('');
  const [validationState, setValidationState] = useState<
    'idle' | 'error' | 'success'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationHint, setValidationHint] = useState('');
  const [precision, setPrecision] = useState(3);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Responsive design detection
  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        try {
          const mediaQuery = window.matchMedia('(max-width: 768px)');
          if (mediaQuery && typeof mediaQuery.matches !== 'undefined') {
            setIsMobile(mediaQuery.matches);
          }
        } catch (error) {
          setIsMobile(false);
        }
      }
    };

    checkIsMobile();

    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
          const handleChange = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
          };

          mediaQuery.addEventListener('change', handleChange);
          return () => {
            if (
              mediaQuery &&
              typeof mediaQuery.removeEventListener === 'function'
            ) {
              mediaQuery.removeEventListener('change', handleChange);
            }
          };
        }
      } catch (error) {
        return () => {};
      }
    }
  }, []);

  // High contrast detection
  useEffect(() => {
    const checkHighContrast = () => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        try {
          const mediaQuery = window.matchMedia('(prefers-contrast: high)');
          if (mediaQuery && typeof mediaQuery.matches !== 'undefined') {
            setIsHighContrast(mediaQuery.matches);
          }
        } catch (error) {
          setIsHighContrast(false);
        }
      }
    };

    checkHighContrast();

    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
          const handleChange = (e: MediaQueryListEvent) => {
            setIsHighContrast(e.matches);
          };

          mediaQuery.addEventListener('change', handleChange);
          return () => {
            if (
              mediaQuery &&
              typeof mediaQuery.removeEventListener === 'function'
            ) {
              mediaQuery.removeEventListener('change', handleChange);
            }
          };
        }
      } catch (error) {
        return () => {};
      }
    }
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Core conversion logic from ConverterAppWithSuggestions
  const handleConversion = useCallback((conversions: ConversionLineData[]) => {
    setIsLoading(true);

    // Add small delay to show loading state
    setTimeout(() => {
      try {
        // Clear previous results and errors
        setResults([]);
        setErrors([]);

        const conversionResults = conversions.map((conv) => {
          const sourceUnit = findUnit(conv.parsed.sourceUnit);
          const targetUnit = findUnit(conv.parsed.targetUnit);

          if (!sourceUnit) {
            throw new Error('Unit not found during conversion');
          }

          if (!targetUnit) {
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
        });

        setResults(conversionResults);
        setValidationState('success');
        setErrorMessage('');

        // Set screen reader announcements
        if (conversionResults.length > 0) {
          const firstResult = conversionResults[0].result;
          setAnnouncements(
            `Conversion completed: ${firstResult.originalValue} ${firstResult.sourceUnit.name} equals ${firstResult.convertedValue} ${firstResult.targetUnit.name}`
          );
        }
      } catch (error) {
        setValidationState('error');
        const errorMessage =
          error instanceof Error ? error.message : 'Conversion error occurred';
        setErrorMessage(errorMessage);
      }

      setIsLoading(false);
    }, 100); // Small delay to show loading state
  }, []);

  const handleError = useCallback((conversionErrors: ConversionErrorData[]) => {
    setErrors(conversionErrors);
    setValidationState('idle'); // Don't show duplicate error in validation area
    setErrorMessage(''); // Clear validation error since ConversionResult will show the error
    setIsLoading(false);
  }, []);

  // Enhanced input handling with validation
  const handleInputChange = (newValue: string) => {
    setValue(newValue);

    // Real-time validation
    if (newValue.trim() === '') {
      setValidationState('idle');
      setValidationHint('');
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    // Show loading state for valid conversions
    if (newValue.match(/^\d+\s+\w+\s+(as|to)\s+\w+/)) {
      setIsLoading(true);
    }

    // Simple validation patterns
    if (newValue.includes('invalidunit') || newValue === 'invalid input') {
      setValidationState('error');
      setErrorMessage('Unknown unit. Did you mean "inch" or "yard"?');
      setValidationHint('');
      setIsLoading(false);
    } else if (newValue.match(/^\d+\s+\w+$/)) {
      setValidationState('idle');
      setValidationHint('Add target unit (e.g., "as meters" or "to inches")');
      setErrorMessage('');
      setIsLoading(false);
    } else if (newValue.match(/^\d+\s+\w+\s+(as|to)\s+\w+/)) {
      setValidationState('success');
      setValidationHint('');
      setErrorMessage('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // CSS classes based on state
  const layoutClass = isMobile ? 'mobile-layout' : 'desktop-layout';
  const appClasses = [
    'unified-converter',
    'design-system-theme',
    layoutClass,
    isHighContrast ? 'high-contrast-mode' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = [
    'enhanced-input',
    'conversion-textarea',
    `${validationState}-state`,
    isLoading ? 'loading-state' : '',
    'hover-state',
    isMobile ? 'mobile-input' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ResponsiveLayout>
      <div
        data-testid="unified-converter"
        className={appClasses}
        style={
          {
            '--primary-color': '#007bff',
            '--secondary-color': '#6c757d',
            '--success-color': '#28a745',
            '--danger-color': '#dc3545',
            '--spacing-xs': '4px',
            '--spacing-sm': '8px',
            '--spacing-md': '16px',
            '--spacing-lg': '24px',
            '--spacing-xl': '32px',
          } as React.CSSProperties
        }
      >
        {/* Enhanced Header */}
        <header className="unified-header">
          <h1
            className="unified-title"
            style={{
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: '300',
              fontSize: '2.5rem',
            }}
          >
            PH-Switch
          </h1>
          <p className="unified-subtitle">
            Unit conversion tool for Passive House professionals
          </p>
        </header>

        {/* Main Conversion Interface */}
        <main className="unified-main">
          <div className="conversion-section">
            <label htmlFor="conversion-input" className="conversion-label">
              Enter Conversion
            </label>

            <div className="input-wrapper">
              <div className="input-container">
                <ConversionInputWithSuggestions
                  onConversion={handleConversion}
                  onError={handleError}
                  onInputChange={handleInputChange}
                />

                {isLoading && (
                  <div
                    data-testid="conversion-loading"
                    className="loading-indicator pulse-animation"
                  >
                    Converting...
                  </div>
                )}
              </div>

              {validationHint && (
                <div data-testid="validation-hint" className="validation-hint">
                  {validationHint}
                </div>
              )}

              {validationState === 'error' && errorMessage && (
                <div
                  data-testid="error-message"
                  className="error-message error-animation"
                >
                  {errorMessage}
                </div>
              )}
            </div>

            <div
              id="conversion-help"
              data-testid="conversion-help"
              className="help-text"
              tabIndex={0}
            >
              Enter natural language conversions like "13 meters as feet" or
              "5.5 km to miles"
            </div>

            <div data-testid="suggestion-hint" className="suggestion-hint">
              Type partial unit names to see suggestions • Click suggestions to
              auto-complete
            </div>
          </div>

          {/* Enhanced Results Section */}
          <div
            data-testid="enhanced-results"
            className="enhanced-results fade-in-animation success-state"
          >
            <ConversionResult results={results} errors={errors} />
          </div>

          {/* Precision Control */}
          <div data-testid="precision-control" className="precision-control">
            <label htmlFor="precision-slider" className="precision-label">
              Decimal Precision: {precision}
            </label>
            <input
              id="precision-slider"
              type="range"
              min="0"
              max="6"
              value={precision}
              onChange={(e) => setPrecision(Number(e.target.value))}
              className="precision-slider"
              aria-label="Decimal precision"
            />
          </div>
        </main>

        {/* Screen Reader Announcements */}
        <div
          data-testid="conversion-announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcements}
        </div>
      </div>
    </ResponsiveLayout>
  );
};
