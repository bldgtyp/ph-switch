import React, { useState } from 'react';

interface ConversionSwapProps {
  onSwap: () => void;
  disabled?: boolean;
}

const ConversionSwap: React.FC<ConversionSwapProps> = ({
  onSwap,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onSwap}
      disabled={disabled}
      title="Swap source and target units"
      aria-label="Swap source and target units"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '16px',
        opacity: disabled ? 0.3 : isHovered ? 1 : 0.7,
        transition: 'opacity 0.2s ease',
        color: '#007acc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      ↔
    </button>
  );
};

export default ConversionSwap;
