import React, { useState, useRef } from 'react';
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
 * Supports Google Translate-style interface with flex layout to match output height
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

  return (
    <div
      className={`conversion-input ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}
    >
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
    </div>
  );
};

export default ConversionInput;
