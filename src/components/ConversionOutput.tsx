import React, { useState, useCallback } from 'react';
import './ConversionOutput.css';

interface ConversionResult {
  id: string;
  input: string;
  output?: string;
  error?: string;
  success: boolean;
  state: 'success' | 'error' | 'format';
}

interface ConversionOutputProps {
  results: ConversionResult[];
  onCopy?: (text: string, resultId: string) => void;
  className?: string;
  'aria-label'?: string;
  isProcessing?: boolean;
}

/**
 * Results display component for conversion outputs
 * Supports Google Translate-style interface with click-to-copy functionality
 * Displays formatted results with proper error handling
 */
export const ConversionOutput: React.FC<ConversionOutputProps> = ({
  results,
  onCopy,
  className = '',
  'aria-label': ariaLabel = 'Conversion results',
  isProcessing = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback(
    async (text: string, resultId: string) => {
      try {
        // Extract only the numeric part from the text (remove unit)
        const numericValue = text.split(' ')[0];

        await navigator.clipboard.writeText(numericValue);
        setCopiedId(resultId);
        setTimeout(() => setCopiedId(null), 2000);

        // Call the onCopy callback with the original full text for external handlers
        if (onCopy) {
          onCopy(text, resultId);
        }
      } catch (err) {
        console.error('Failed to copy text: ', err);
        // Fallback for browsers that don't support clipboard API
        // Extract only the numeric part from the text (remove unit)
        const numericValue = text.split(' ')[0];

        const textArea = document.createElement('textarea');
        textArea.value = numericValue;
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.select();

        try {
          const successful =
            document.execCommand && document.execCommand('copy');
          if (!successful) {
            throw new Error('execCommand copy failed');
          }
        } catch (fallbackError) {
          // In test environments or browsers without execCommand, just log
          console.info('Text selected for manual copy:', numericValue);
        }

        document.body.removeChild(textArea);

        setCopiedId(resultId);
        setTimeout(() => setCopiedId(null), 2000);

        // Call the onCopy callback with the original full text for external handlers
        if (onCopy) {
          onCopy(text, resultId);
        }
      }
    },
    [onCopy]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, text: string, resultId: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCopy(text, resultId);
      }
    },
    [handleCopy]
  );

  if (results.length === 0) {
    return (
      <div
        className={`conversion-output empty ${className}`}
        aria-label={ariaLabel}
      >
        <div className="conversion-output__placeholder">
          <span className="conversion-output__placeholder-text">
            {isProcessing
              ? 'Processing...'
              : 'Results will appear here as you type...'}
          </span>
          {isProcessing && (
            <span className="conversion-output__spinner" aria-hidden="true">
              ⟳
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`conversion-output ${className}`} aria-label={ariaLabel}>
      <div className="conversion-output__results">
        {results.map((result, index) => {
          // Handle empty lines for proper alignment
          if (!result.input && result.success) {
            return (
              <div
                key={result.id}
                className="conversion-output__result empty-line"
                data-line={index + 1}
              >
                <div className="conversion-output__empty-line">&nbsp;</div>
              </div>
            );
          }

          return (
            <div
              key={result.id}
              className={`conversion-output__result ${result.state} ${
                copiedId === result.id ? 'copied' : ''
              }`}
              data-line={index + 1}
            >
              {result.success && result.output ? (
                <button
                  className="conversion-output__value"
                  onClick={() => handleCopy(result.output!, result.id)}
                  onKeyDown={(e) => handleKeyDown(e, result.output!, result.id)}
                  aria-label={`Copy numeric value: ${result.output!.split(' ')[0]}`}
                  title="Click to copy numeric value to clipboard"
                  type="button"
                >
                  <span className="conversion-output__text">
                    {result.output}
                  </span>
                </button>
              ) : result.state === 'format' ? (
                <div className="conversion-output__format-help">
                  <span
                    className="conversion-output__format-icon"
                    aria-hidden="true"
                  >
                    💡
                  </span>
                  <div className="conversion-output__format-text">
                    <div className="conversion-output__format-message">
                      Try: "5 meters to feet" or "2.5 inches as mm"
                    </div>
                    <div className="conversion-output__format-hint">
                      Format: NUMBER UNIT to/as UNIT
                    </div>
                  </div>
                </div>
              ) : (
                <div className="conversion-output__error" role="alert">
                  <span
                    className="conversion-output__error-icon"
                    aria-hidden="true"
                  >
                    ⚠️
                  </span>
                  <span className="conversion-output__error-text">
                    {result.error || 'Conversion failed'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global feedback positioned relative to main container */}
      {copiedId && (
        <div
          className="conversion-output__copy-feedback"
          role="status"
          aria-live="polite"
        >
          Copied!
        </div>
      )}
    </div>
  );
};

export default ConversionOutput;
