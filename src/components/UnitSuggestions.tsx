import React from 'react';

export interface UnitSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (unit: string) => void;
  visible: boolean;
  position?: { top: number; left: number };
}

const UnitSuggestions: React.FC<UnitSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  visible,
  position = { top: 0, left: 0 },
}) => {
  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="unit-suggestions"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        maxHeight: '200px',
        overflowY: 'auto',
        minWidth: '120px',
      }}
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion}
          className="unit-suggestion-item"
          onClick={() => onSuggestionClick(suggestion)}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            borderBottom:
              index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
            fontSize: '14px',
            fontFamily: 'Monaco, Menlo, "Courier New", monospace',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          {suggestion}
        </div>
      ))}
    </div>
  );
};

export default UnitSuggestions;
