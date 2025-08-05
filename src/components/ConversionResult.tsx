import React from 'react';
import { ConversionResultProps } from '../types/components';

const ConversionResult: React.FC<ConversionResultProps> = ({
  results,
  errors,
}) => {
  // Combine and sort all items by line number
  const allItems = [
    ...results.map((r) => ({ ...r, type: 'result' as const })),
    ...errors.map((e) => ({ ...e, type: 'error' as const })),
  ].sort((a, b) => a.lineNumber - b.lineNumber);

  if (allItems.length === 0) {
    return (
      <div
        className="conversion-result"
        data-testid="conversion-result"
        style={{
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '2px solid #e0e0e0',
          marginTop: '16px',
        }}
      >
        <div
          style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}
        >
          <p>Enter a conversion above to see results...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="conversion-result"
      data-testid="conversion-result"
      style={{
        padding: '16px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '2px solid #e0e0e0',
        marginTop: '16px',
      }}
    >
      {allItems.map((item, index) => (
        <div
          key={`${item.lineNumber}-${index}`}
          style={{
            display: 'flex',
            marginBottom: index === allItems.length - 1 ? '0' : '12px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              background: '#007acc',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              marginRight: '12px',
              flexShrink: 0,
            }}
          >
            {item.lineNumber + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                fontSize: '14px',
                color: '#333',
                marginBottom: '4px',
              }}
            >
              {item.input}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>
              {item.type === 'result' ? (
                <span style={{ color: '#007acc' }}>
                  ={' '}
                  {formatResult(
                    item.result.convertedValue,
                    item.result.precision
                  )}{' '}
                  {item.result.targetUnit.symbol}
                </span>
              ) : (
                <span style={{ color: '#d73a49', fontSize: '14px' }}>
                  ⚠ {item.error}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to format results with proper precision
function formatResult(value: number, precision: number): string {
  if (precision === 0) {
    return Math.round(value).toString();
  }

  const formatted = value.toFixed(precision);
  // Remove trailing zeros after decimal point
  return formatted.replace(/\.?0+$/, '');
}

export default ConversionResult;
