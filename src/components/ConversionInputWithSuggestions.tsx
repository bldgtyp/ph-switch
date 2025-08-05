import React, { useState, useCallback, useRef, useEffect } from 'react';
import { parseInput } from '../utils/conversions';
import {
  getUnitSuggestions,
  getTargetUnitSuggestions,
} from '../utils/unitSuggestions';
import UnitSuggestions from './UnitSuggestions';
import { ConversionLineData, ConversionErrorData } from '../types/components';

interface ConversionInputWithSuggestionsProps {
  onConversion: (results: ConversionLineData[]) => void;
  onError: (errors: ConversionErrorData[]) => void;
}

interface SuggestionState {
  visible: boolean;
  suggestions: string[];
  position: { top: number; left: number };
  currentWord: string;
  wordStartIndex: number;
  isTargetUnit: boolean;
  sourceUnit?: string;
}

const ConversionInputWithSuggestions: React.FC<
  ConversionInputWithSuggestionsProps
> = ({ onConversion, onError }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestionState, setSuggestionState] = useState<SuggestionState>({
    visible: false,
    suggestions: [],
    position: { top: 0, left: 0 },
    currentWord: '',
    wordStartIndex: 0,
    isTargetUnit: false,
  });
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [processingTimeout, setProcessingTimeout] =
    useState<NodeJS.Timeout | null>(null);

  // Process input with debouncing
  const processInput = useCallback(
    (value: string) => {
      const lines = value.split('\n');
      const results: ConversionLineData[] = [];
      const errors: ConversionErrorData[] = [];

      lines.forEach((line, index) => {
        if (line.trim()) {
          const parsed = parseInput(line.trim());
          if (parsed.isValid) {
            results.push({
              lineNumber: index,
              input: line.trim(),
              parsed,
            });
          } else {
            errors.push({
              lineNumber: index,
              input: line.trim(),
              error:
                parsed.error ||
                'Invalid format. Use: "number unit as/to unit" (e.g., "13 meters as feet")',
            });
          }
        }
      });

      if (results.length > 0) {
        onConversion(results);
      }
      if (errors.length > 0) {
        onError(errors);
      }
    },
    [onConversion, onError]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (unit: string) => {
      if (!textAreaRef.current) return;

      const textarea = textAreaRef.current;
      const { value, selectionStart } = textarea;
      const { wordStartIndex, currentWord } = suggestionState;

      // Replace the current word with the selected unit
      const beforeWord = value.substring(0, wordStartIndex);
      const afterWord = value.substring(wordStartIndex + currentWord.length);
      const newValue = beforeWord + unit + afterWord;

      setInputValue(newValue);

      // Hide suggestions
      setSuggestionState((prev) => ({ ...prev, visible: false }));

      // Set cursor position after the inserted unit
      const newCursorPos = wordStartIndex + unit.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [suggestionState]
  );

  // Analyze input and show suggestions
  const analyzeInput = useCallback((value: string, cursorPos: number) => {
    const currentLine = getCurrentLine(value, cursorPos);
    const { line, lineStart } = currentLine;
    const positionInLine = cursorPos - lineStart;

    // Find the current word being typed
    const beforeCursor = line.substring(0, positionInLine);
    const afterCursor = line.substring(positionInLine);

    // Find word boundaries
    const wordMatch = beforeCursor.match(/\b(\w+)$/);
    const wordAfterMatch = afterCursor.match(/^(\w*)/);

    if (!wordMatch) {
      setSuggestionState((prev) => ({ ...prev, visible: false }));
      return;
    }

    const wordStart = wordMatch.index!;
    const currentWord =
      wordMatch[1] + (wordAfterMatch ? wordAfterMatch[1] : '');
    const wordStartIndex = lineStart + wordStart;

    // Analyze context to determine if this is a source or target unit
    const beforeWord = beforeCursor.substring(0, wordStart).trim();
    const isTargetUnit = /\b(as|to)\s*$/i.test(beforeWord);

    let suggestions: string[] = [];
    let sourceUnit: string | undefined;

    if (isTargetUnit) {
      // Extract source unit from the line
      const sourceMatch = beforeWord.match(/^(\d+(?:\.\d+)?)\s+(\w+)/);
      if (sourceMatch) {
        sourceUnit = sourceMatch[2];
        suggestions = getTargetUnitSuggestions(sourceUnit);
      }
    } else {
      // Check if this could be a source unit (number followed by unit)
      const numberUnitMatch = beforeWord.match(/^(\d+(?:\.\d+)?)\s*$/);
      if (numberUnitMatch || beforeWord === '') {
        suggestions = getUnitSuggestions(currentWord);
      }
    }

    // Filter suggestions based on current word
    if (currentWord && suggestions.length > 0) {
      suggestions = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(currentWord.toLowerCase())
      );
    }

    if (suggestions.length > 0 && currentWord.length > 0) {
      // Calculate position for suggestions
      const textArea = textAreaRef.current!;
      const position = getCaretPosition(textArea, wordStartIndex);

      setSuggestionState({
        visible: true,
        suggestions: suggestions.slice(0, 8),
        position,
        currentWord,
        wordStartIndex,
        isTargetUnit,
        sourceUnit,
      });
    } else {
      setSuggestionState((prev) => ({ ...prev, visible: false }));
    }
  }, []);

  // Get current line and its start position
  const getCurrentLine = (value: string, cursorPos: number) => {
    const beforeCursor = value.substring(0, cursorPos);
    const lines = beforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;
    const line = lines[currentLineIndex];
    const lineStart = beforeCursor.length - line.length;

    return { line, lineStart, lineIndex: currentLineIndex };
  };

  // Calculate caret position for suggestions
  const getCaretPosition = (
    textarea: HTMLTextAreaElement,
    index: number
  ): { top: number; left: number } => {
    const rect = textarea.getBoundingClientRect();

    // Simple approximation - in a real implementation, you'd want more precise positioning
    const lineHeight = 24; // Approximate line height
    const charWidth = 9; // Approximate character width for monospace font

    const textBeforeIndex = textarea.value.substring(0, index);
    const lines = textBeforeIndex.split('\n');
    const lineNumber = lines.length - 1;
    const columnNumber = lines[lines.length - 1].length;

    return {
      top: rect.top + lineNumber * lineHeight + lineHeight + 5,
      left: rect.left + columnNumber * charWidth,
    };
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    setInputValue(value);

    // Clear existing processing timeout
    if (processingTimeout) {
      clearTimeout(processingTimeout);
    }

    // Analyze input for suggestions immediately
    analyzeInput(value, cursorPos);

    // Debounced processing for conversions
    const newTimeout = setTimeout(() => {
      processInput(value);
    }, 300);

    setProcessingTimeout(newTimeout);
  };

  // Handle cursor position changes
  const handleSelectionChange = () => {
    if (textAreaRef.current) {
      const cursorPos = textAreaRef.current.selectionStart;
      analyzeInput(inputValue, cursorPos);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (processingTimeout) {
        clearTimeout(processingTimeout);
      }
    };
  }, [processingTimeout]);

  return (
    <div className="conversion-input" style={{ position: 'relative' }}>
      <textarea
        ref={textAreaRef}
        className="conversion-textarea"
        value={inputValue}
        onChange={handleInputChange}
        onSelect={handleSelectionChange}
        onClick={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        placeholder={`13 meters as feet
5.5 km to miles
100 cm as inches`}
        rows={6}
        spellCheck={false}
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '12px',
          fontSize: '16px',
          fontFamily: 'Monaco, Menlo, "Courier New", monospace',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          resize: 'vertical',
          outline: 'none',
          lineHeight: '1.5',
        }}
      />

      <UnitSuggestions
        suggestions={suggestionState.suggestions}
        onSuggestionClick={handleSuggestionClick}
        visible={suggestionState.visible}
        position={suggestionState.position}
      />
    </div>
  );
};

export default ConversionInputWithSuggestions;
