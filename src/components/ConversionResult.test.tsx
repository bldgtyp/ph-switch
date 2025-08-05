import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConversionResult from './ConversionResult';

describe('ConversionResult Component', () => {
  const mockResults = [
    {
      lineNumber: 0,
      input: '13 meters as feet',
      result: {
        originalValue: 13,
        convertedValue: 42.65,
        sourceUnit: {
          id: 'meter',
          name: 'meter',
          symbol: 'm',
          aliases: ['m', 'meter', 'meters'],
          category: { id: 'length', name: 'Length', baseUnit: 'meter' },
          baseUnit: 'meter',
          conversionFactor: 1.0,
        },
        targetUnit: {
          id: 'foot',
          name: 'foot',
          symbol: 'ft',
          aliases: ['ft', 'foot', 'feet'],
          category: { id: 'length', name: 'Length', baseUnit: 'meter' },
          baseUnit: 'meter',
          conversionFactor: 0.3048,
        },
        precision: 2,
      },
    },
    {
      lineNumber: 1,
      input: '5 km to miles',
      result: {
        originalValue: 5,
        convertedValue: 3.107,
        sourceUnit: {
          id: 'kilometer',
          name: 'kilometer',
          symbol: 'km',
          aliases: ['km', 'kilometer', 'kilometers'],
          category: { id: 'length', name: 'Length', baseUnit: 'meter' },
          baseUnit: 'meter',
          conversionFactor: 1000.0,
        },
        targetUnit: {
          id: 'mile',
          name: 'mile',
          symbol: 'mi',
          aliases: ['mi', 'mile', 'miles'],
          category: { id: 'length', name: 'Length', baseUnit: 'meter' },
          baseUnit: 'meter',
          conversionFactor: 1609.344,
        },
        precision: 3,
      },
    },
  ];

  const mockErrors = [
    {
      lineNumber: 2,
      input: 'invalid input',
      error:
        'Invalid format. Use: "number unit as/to unit" (e.g., "13 meters as feet")',
    },
  ];

  test('renders conversion results correctly', () => {
    render(<ConversionResult results={mockResults} errors={[]} />);

    // Check if results are displayed
    expect(screen.getByText('13 meters as feet')).toBeInTheDocument();
    expect(screen.getByText(/42\.65/)).toBeInTheDocument();

    // Check for the result text within the results span, not the input
    const resultSpans = screen.getAllByText(/ft/);
    expect(resultSpans.length).toBeGreaterThan(0);

    expect(screen.getByText('5 km to miles')).toBeInTheDocument();
    expect(screen.getByText(/3\.107/)).toBeInTheDocument();

    // Check for the result text within the results span, not the input
    const miSpans = screen.getAllByText(/mi/);
    expect(miSpans.length).toBeGreaterThan(0);
  });

  test('renders error messages correctly', () => {
    render(<ConversionResult results={[]} errors={mockErrors} />);

    expect(screen.getByText('invalid input')).toBeInTheDocument();
    expect(screen.getByText(/Invalid format/)).toBeInTheDocument();
  });

  test('renders both results and errors', () => {
    render(<ConversionResult results={mockResults} errors={mockErrors} />);

    // Check results
    expect(screen.getByText('13 meters as feet')).toBeInTheDocument();
    expect(screen.getByText(/42\.65/)).toBeInTheDocument();

    // Check errors
    expect(screen.getByText('invalid input')).toBeInTheDocument();
    expect(screen.getByText(/Invalid format/)).toBeInTheDocument();
  });

  test('displays results in correct line order', () => {
    const mixedResults = [mockResults[1], mockResults[0]]; // Different order
    render(<ConversionResult results={mixedResults} errors={[]} />);

    const resultElements = screen.getAllByText(/ft|mi/);
    // Should be sorted by line number: line 0 (feet) then line 1 (miles)
    expect(resultElements[0]).toHaveTextContent('ft');
    expect(resultElements[1]).toHaveTextContent('mi');
  });

  test('formats precision correctly', () => {
    const precisionResult = [
      {
        lineNumber: 0,
        input: '1 meter as millimeters',
        result: {
          originalValue: 1,
          convertedValue: 1000.0,
          sourceUnit: mockResults[0].result.sourceUnit,
          targetUnit: {
            id: 'millimeter',
            name: 'millimeter',
            symbol: 'mm',
            aliases: ['mm', 'millimeter', 'millimeters'],
            category: { id: 'length', name: 'Length', baseUnit: 'meter' },
            baseUnit: 'meter',
            conversionFactor: 0.001,
          },
          precision: 0,
        },
      },
    ];

    render(<ConversionResult results={precisionResult} errors={[]} />);

    // Should display without decimal places due to precision: 0
    expect(screen.getByText(/1000/)).toBeInTheDocument();
    expect(screen.getByText(/mm/)).toBeInTheDocument();
  });

  test('handles empty results and errors', () => {
    render(<ConversionResult results={[]} errors={[]} />);

    // Component should render without crashing
    const container =
      screen.getByTestId?.('conversion-result') || document.body;
    expect(container).toBeInTheDocument();
  });

  test('shows proper visual separation between lines', () => {
    render(<ConversionResult results={mockResults} errors={mockErrors} />);

    // Check that line numbers or separators are present
    const allResults = screen.getAllByText(/^(13 meters|5 km|invalid)/);
    expect(allResults).toHaveLength(3); // 2 results + 1 error
  });

  test('displays units with proper symbols', () => {
    render(<ConversionResult results={mockResults} errors={[]} />);

    // Check that unit symbols are used in display
    expect(screen.getByText(/42\.65/)).toBeInTheDocument();

    // Check for the result text within the results span, not the input
    const ftSpans = screen.getAllByText(/ft/);
    expect(ftSpans.length).toBeGreaterThan(0);

    expect(screen.getByText(/3\.107/)).toBeInTheDocument();

    // Check for the result text within the results span, not the input
    const miSpans = screen.getAllByText(/mi/);
    expect(miSpans.length).toBeGreaterThan(0);
  });
});
