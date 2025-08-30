import React, { useRef, useState } from 'react';
import './ConversionInput.css';
import AutoSuggest from './AutoSuggest';
import {
  loadAllConfigurations,
  getAllUnitSymbols,
} from '../utils/configLoader';
import { findUnitCategory, getCategorySymbols } from '../config';

// Helper: approximate caret coordinates in textarea (relative to textarea top-left)
function getCaretCoordinates(textarea: HTMLTextAreaElement, position: number) {
  // Mirror div approach: replicate textarea styles and content up to caret, append span
  const div = document.createElement('div');
  const style = getComputedStyle(textarea);
  const properties = [
    'boxSizing',
    'width',
    'fontSize',
    'fontFamily',
    'fontWeight',
    'lineHeight',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'whiteSpace',
  ];

  properties.forEach((prop) => {
    // @ts-ignore
    div.style[prop] = style.getPropertyValue(prop) || (style as any)[prop]; // @ts-ignore
  });

  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.overflow = 'auto';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';

  const value = textarea.value.substring(0, position);
  const span = document.createElement('span');
  span.textContent = textarea.value.substring(position) || '.';

  div.textContent = value;
  div.appendChild(span);

  document.body.appendChild(div);
  const spanRect = span.getBoundingClientRect();
  const divRect = div.getBoundingClientRect();
  document.body.removeChild(div);

  return {
    left: spanRect.left - divRect.left + textarea.clientLeft,
    top: spanRect.top - divRect.top + textarea.clientTop,
  };
}

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
 * Integrates AutoSuggest for unit discovery.
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

  // Suggestion state
  const [symbols, setSymbols] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestVisible, setSuggestVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestStyle, setSuggestStyle] = useState<
    React.CSSProperties | undefined
  >(undefined);

  // Lazy-load symbols to avoid state updates during mount (prevents act(...) warnings in tests)
  const ensureSymbolsLoaded = () => {
    if (symbols.length > 0) return;
    // Avoid performing async state updates during test runs; tests should control config loading.
    if (process.env.NODE_ENV === 'test') return;

    loadAllConfigurations().then((res) => {
      if (res.success && res.categories) {
        const symbolsList = getAllUnitSymbols(res.categories);
        setSymbols(symbolsList);
      }
    });
  };

  const updateSuggestionsForValue = (val: string) => {
    const pos = textareaRef.current?.selectionStart ?? val.length;
    const before = val.slice(0, pos);
    const lines = before.split('\n');
    const currentLine = lines[lines.length - 1];

    // Check if we're in a conversion context (e.g., "5 m to f" where user is typing the target unit)
    const conversionMatch = currentLine.match(
      /(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s+([a-zA-Z][a-zA-Z0-9/°µÅ–—′″\-\s]*?)\s+(?:to|as)\s+(\S*)$/i
    );

    if (conversionMatch) {
      // We're in conversion context - filter suggestions by source unit's category
      const [, , sourceUnit, partialTargetUnit] = conversionMatch;
      const token = partialTargetUnit.toLowerCase();

      if (!token || token.length < 1) {
        setSuggestions([]);
        setSuggestVisible(false);
        setActiveIndex(-1);
        return;
      }

      // Find the category of the source unit
      const sourceCategory = findUnitCategory(sourceUnit.trim());

      if (sourceCategory) {
        // Get symbols only from the same category as the source unit
        const categorySymbols = getCategorySymbols(sourceCategory);

        const starts = categorySymbols.filter((s) =>
          s.toLowerCase().startsWith(token)
        );
        const contains = categorySymbols.filter(
          (s) =>
            !s.toLowerCase().startsWith(token) &&
            s.toLowerCase().includes(token)
        );
        const results = Array.from(new Set([...starts, ...contains])).slice(
          0,
          10
        );

        setSuggestions(results);
        setSuggestVisible(results.length > 0);
        setActiveIndex(results.length > 0 ? 0 : -1);

        // Position suggestions
        const ta = textareaRef.current;
        if (ta && results.length > 0) {
          try {
            const { top, left } = getCaretCoordinates(
              ta,
              ta.selectionStart || ta.value.length
            );
            setSuggestStyle({
              top: top - ta.scrollTop + 6,
              left: left - ta.scrollLeft,
            });
          } catch (e) {
            setSuggestStyle({ bottom: 8, left: 8 });
          }
        } else {
          setSuggestStyle(undefined);
        }
        return;
      }
      // If we can't find the source category, fall through to general suggestions
    }

    // Default behavior: not in conversion context or source unit category unknown
    const tokenMatch = currentLine.match(/(\S+)$/);
    const token = tokenMatch ? tokenMatch[1].toLowerCase() : '';

    if (!token || token.length < 1) {
      setSuggestions([]);
      setSuggestVisible(false);
      setActiveIndex(-1);
      return;
    }

    // Ensure symbol list is available before computing suggestions
    ensureSymbolsLoaded();

    const starts = symbols.filter((s) => s.toLowerCase().startsWith(token));
    const contains = symbols.filter(
      (s) =>
        !s.toLowerCase().startsWith(token) && s.toLowerCase().includes(token)
    );
    const results = Array.from(new Set([...starts, ...contains])).slice(0, 10);

    setSuggestions(results);
    setSuggestVisible(results.length > 0);
    setActiveIndex(results.length > 0 ? 0 : -1);

    // compute position for overlay: place under current line
    const ta = textareaRef.current;
    if (ta && results.length > 0) {
      // Create a dummy div to measure caret position using range/selection technique
      // Fallback: position at textarea bottom
      try {
        const { top, left } = getCaretCoordinates(
          ta,
          ta.selectionStart || ta.value.length
        );
        setSuggestStyle({
          top: top - ta.scrollTop + 6, // small offset
          left: left - ta.scrollLeft,
        });
      } catch (e) {
        setSuggestStyle({ bottom: 8, left: 8 });
      }
    } else {
      setSuggestStyle(undefined);
    }
  };

  const acceptSuggestion = (suggestion: string) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const pos = ta.selectionStart ?? ta.value.length;
    const before = ta.value.slice(0, pos);
    const after = ta.value.slice(pos);

    const lines = before.split('\n');
    const currentLine = lines[lines.length - 1];
    const tokenMatch = currentLine.match(/(\S+)$/);
    if (!tokenMatch) return;

    const token = tokenMatch[1];
    const replacedLine =
      currentLine.slice(0, currentLine.length - token.length) + suggestion;
    lines[lines.length - 1] = replacedLine;

    const newBefore = lines.join('\n');
    const newValue = newBefore + after;

    onChange(newValue);

    const newPos = newBefore.length;
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = newPos;
      ta.focus();
    });

    setSuggestVisible(false);
    setActiveIndex(-1);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = event.target.value;
    onChange(newVal);
    updateSuggestionsForValue(newVal);
  };

  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    // remove focused class and notify immediately so tests see the blur
    setIsFocused(false);
    onBlur?.();

    // small timeout to allow click on suggestion before clearing suggestions
    setTimeout(() => {
      setSuggestVisible(false);
      setActiveIndex(-1);
    }, 150);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') return;

    if (suggestVisible && suggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (event.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          event.preventDefault();
          acceptSuggestion(suggestions[activeIndex]);
        }
      }
      if (event.key === 'Escape') {
        setSuggestVisible(false);
        setActiveIndex(-1);
      }
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
      <AutoSuggest
        suggestions={suggestions}
        visible={suggestVisible}
        activeIndex={activeIndex}
        onSelect={(s) => acceptSuggestion(s)}
        style={suggestStyle}
      />
    </div>
  );
};

export default ConversionInput;
