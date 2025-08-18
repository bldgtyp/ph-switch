import React, { useState, useCallback } from 'react';
import './ConversionOutput.css';

interface ConversionResult {
  id: string;
  input: string;
  output?: string;
  error?: string;
  success: boolean;
}

interface ConversionOutputProps {
  results: ConversionResult[];
  onCopy?: (text: string, resultId: string) => void;
  className?: string;
  'aria-label'?: string;
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
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyTimeout, setCopyTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleCopy = useCallback(
    async (text: string, resultId: string) => {
      try {
        await navigator.clipboard.writeText(text);

        // Visual feedback for successful copy
        setCopiedId(resultId);

        // Clear previous timeout
        if (copyTimeout) {
          clearTimeout(copyTimeout);
        }

        // Auto-clear copy feedback after 2 seconds
        const timeout = setTimeout(() => {
          setCopiedId(null);
        }, 2000);
        setCopyTimeout(timeout);

        // Call optional callback
        onCopy?.(text, resultId);
      } catch (error) {
        console.warn('Failed to copy to clipboard:', error);
        // Fallback: select text for manual copy
        selectTextFallback(text);
      }
    },
    [onCopy, copyTimeout]
  );

  const selectTextFallback = (text: string) => {
    // Create temporary textarea for fallback copy
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (error) {
      console.warn('Fallback copy also failed:', error);
    }
    document.body.removeChild(textarea);
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, text: string, resultId: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCopy(text, resultId);
      }
    },
    [handleCopy]
  );

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
    };
  }, [copyTimeout]);

  if (results.length === 0) {
    return (
      <div
        className={`conversion-output empty ${className}`}
        aria-label={ariaLabel}
      >
        <div className="conversion-output__placeholder">
          <span className="conversion-output__placeholder-text">
            Results will appear here as you type...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`conversion-output ${className}`} aria-label={ariaLabel}>
      <div className="conversion-output__results">
        {results.map((result, index) => (
          <div
            key={result.id}
            className={`conversion-output__result ${result.success ? 'success' : 'error'} ${
              copiedId === result.id ? 'copied' : ''
            }`}
            data-line={index + 1}
          >
            {result.success && result.output ? (
              <button
                className="conversion-output__value"
                onClick={() => handleCopy(result.output!, result.id)}
                onKeyDown={(e) => handleKeyDown(e, result.output!, result.id)}
                aria-label={`Copy result: ${result.output}`}
                title="Click to copy to clipboard"
                type="button"
              >
                <span className="conversion-output__text">{result.output}</span>
                <span
                  className="conversion-output__copy-icon"
                  aria-hidden="true"
                >
                  {copiedId === result.id ? '✓' : '📋'}
                </span>
              </button>
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

            {copiedId === result.id && (
              <div
                className="conversion-output__copy-feedback"
                role="status"
                aria-live="polite"
              >
                Copied!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary info */}
      <div className="conversion-output__summary">
        <span className="conversion-output__count">
          {results.filter((r) => r.success).length} of {results.length}{' '}
          converted
        </span>
      </div>
    </div>
  );
};

export default ConversionOutput;
