import React from 'react';
import './ErrorMessage.css';

export interface ErrorMessageProps {
  /** Error message text to display */
  message: string;
  /** Optional suggested alternatives for the error */
  suggestions?: string[];
  /** Additional CSS class name for custom styling */
  className?: string;
  /** Custom ARIA label for accessibility */
  ariaLabel?: string;
  /** Optional callback when a suggestion is clicked */
  onSuggestionClick?: (suggestion: string) => void;
  /** Whether to show the error as critical (affects styling) */
  critical?: boolean;
}

/**
 * ErrorMessage component for displaying parsing failure feedback
 * with optional suggestions for correction
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  suggestions = [],
  className = '',
  ariaLabel,
  onSuggestionClick,
  critical = false,
}) => {
  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick?.(suggestion);
  };

  const handleSuggestionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    suggestion: string
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSuggestionClick(suggestion);
    }
  };

  return (
    <div
      className={`error-message ${critical ? 'error-message--critical' : ''} ${className}`}
      role="alert"
      aria-label={ariaLabel || `Error: ${message}`}
    >
      <div className="error-message__content">
        <span className="error-message__icon" aria-hidden="true">
          {critical ? '⚠️' : 'ℹ️'}
        </span>
        <span className="error-message__text">{message}</span>
      </div>

      {suggestions.length > 0 && (
        <div className="error-message__suggestions">
          <span className="error-message__suggestions-label">
            Did you mean:
          </span>
          <ul className="error-message__suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="error-message__suggestion-item">
                {onSuggestionClick ? (
                  <button
                    type="button"
                    className="error-message__suggestion-button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    onKeyDown={(event) =>
                      handleSuggestionKeyDown(event, suggestion)
                    }
                    aria-label={`Use suggestion: ${suggestion}`}
                  >
                    {suggestion}
                  </button>
                ) : (
                  <span className="error-message__suggestion-text">
                    {suggestion}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;
