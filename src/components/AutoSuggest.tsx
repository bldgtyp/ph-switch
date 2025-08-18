import React from 'react';
import './AutoSuggest.css';

type Props = {
  suggestions: string[];
  onSelect: (value: string) => void;
  visible?: boolean;
  activeIndex?: number;
  style?: React.CSSProperties;
};

const AutoSuggest: React.FC<Props> = ({
  suggestions,
  onSelect,
  visible = true,
  activeIndex = -1,
  style,
}) => {
  if (!visible || suggestions.length === 0) return null;

  return (
    <ul
      className="autosuggest"
      role="listbox"
      aria-label="unit suggestions"
      style={style}
    >
      {suggestions.map((s, i) => (
        <li
          key={s}
          role="option"
          aria-selected={i === activeIndex}
          className={
            i === activeIndex
              ? 'autosuggest__item autosuggest__item--active'
              : 'autosuggest__item'
          }
          onMouseDown={(e) => {
            // use onMouseDown to avoid losing focus on the input before click
            e.preventDefault();
            onSelect(s);
          }}
        >
          {s}
        </li>
      ))}
    </ul>
  );
};

export default AutoSuggest;
