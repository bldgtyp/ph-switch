import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnitSuggestions from './UnitSuggestions';

describe('UnitSuggestions Component', () => {
  const mockOnSuggestionClick = jest.fn();
  const defaultProps = {
    suggestions: ['meter', 'millimeter', 'mile'],
    onSuggestionClick: mockOnSuggestionClick,
    visible: true,
    position: { top: 100, left: 50 },
  };

  beforeEach(() => {
    mockOnSuggestionClick.mockClear();
  });

  test('renders suggestions when visible', () => {
    render(<UnitSuggestions {...defaultProps} />);

    expect(screen.getByText('meter')).toBeInTheDocument();
    expect(screen.getByText('millimeter')).toBeInTheDocument();
    expect(screen.getByText('mile')).toBeInTheDocument();
  });

  test('does not render when not visible', () => {
    render(<UnitSuggestions {...defaultProps} visible={false} />);

    expect(screen.queryByText('meter')).not.toBeInTheDocument();
  });

  test('does not render when suggestions are empty', () => {
    render(<UnitSuggestions {...defaultProps} suggestions={[]} />);

    expect(screen.queryByText('meter')).not.toBeInTheDocument();
  });

  test('calls onSuggestionClick when suggestion is clicked', () => {
    render(<UnitSuggestions {...defaultProps} />);

    fireEvent.click(screen.getByText('meter'));

    expect(mockOnSuggestionClick).toHaveBeenCalledWith('meter');
  });

  test('applies correct positioning', () => {
    render(<UnitSuggestions {...defaultProps} />);

    const container = screen.getByText('meter').parentElement;
    expect(container).toHaveStyle({
      position: 'absolute',
      top: '100px',
      left: '50px',
    });
  });

  test('applies hover effects', () => {
    render(<UnitSuggestions {...defaultProps} />);

    const suggestion = screen.getByText('meter');

    // Test mouse enter
    fireEvent.mouseEnter(suggestion);
    expect(suggestion).toHaveStyle({ backgroundColor: '#f5f5f5' });

    // Test mouse leave
    fireEvent.mouseLeave(suggestion);
    expect(suggestion).toHaveStyle({ backgroundColor: 'white' });
  });

  test('shows multiple suggestions in order', () => {
    render(<UnitSuggestions {...defaultProps} />);

    const suggestions = screen.getAllByText(/meter|mile/);
    expect(suggestions).toHaveLength(3);
  });
});
