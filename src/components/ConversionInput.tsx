import React, { useState, useRef, useEffect } from 'react';
import './ConversionInput.css';

interface ConversionInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * Multi-line textarea component for natural language conversion input
 * Supports Google Translate-style interface with auto-expanding height
 * Handles "X unit as/to Y unit" format parsing
 */
export const ConversionInput: React.FC<ConversionInputProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = 'Enter conversions like "5 meters to feet" (one per line)',
  disabled = false,
  'aria-label': ariaLabel = 'Conversion input',
  'aria-describedby': ariaDescribedBy,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Set height based on scrollHeight with minimum height
      const minHeight = 60; // 3 lines approximately
      const maxHeight = 300; // Prevent excessive height
      const newHeight = Math.max(minHeight, Math.min(maxHeight, textarea.scrollHeight));
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow tab to work properly without preventing default
    if (event.key === 'Tab') {
      return; // Let browser handle tab navigation
    }
  };

  const lineCount = value ? value.split('\n').length : 1;

  return (
    <div className={`conversion-input ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        rows={3}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="conversion-input__textarea"
      />
      
      {/* Visual indicators */}
      <div className="conversion-input__indicators">
        <span className="conversion-input__line-count">
          {lineCount} line{lineCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default ConversionInput;
