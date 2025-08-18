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

        // Show brief feedback that manual copy is needed
        setCopiedId(resultId);
        const timeout = setTimeout(() => {
          setCopiedId(null);
        }, 1000);
        setCopyTimeout(timeout);
      }
    },
    [onCopy, copyTimeout]
  );

  const selectTextFallback = (text: string) => {
    // Create temporary textarea for fallback text selection
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);

    try {
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices

      // Show user that text is selected for manual copy
      console.info('Text selected for manual copy:', text);

      // Remove the element after a brief delay to allow selection
      setTimeout(() => {
        if (document.body.contains(textarea)) {
          document.body.removeChild(textarea);
        }
      }, 100);
    } catch (error) {
      console.warn('Text selection fallback failed:', error);
      document.body.removeChild(textarea);
    }
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
                  <span className="conversion-output__text">
                    {result.output}
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
