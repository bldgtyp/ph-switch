import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConversionSwap from './ConversionSwap';

describe('ConversionSwap Component', () => {
  const mockOnSwap = jest.fn();
  const defaultProps = {
    onSwap: mockOnSwap,
    disabled: false,
  };

  beforeEach(() => {
    mockOnSwap.mockClear();
  });

  test('renders swap button', () => {
    render(<ConversionSwap {...defaultProps} />);

    const swapButton = screen.getByRole('button');
    expect(swapButton).toBeInTheDocument();
    expect(swapButton).toHaveAttribute('title', 'Swap source and target units');
  });

  test('calls onSwap when clicked', () => {
    render(<ConversionSwap {...defaultProps} />);

    const swapButton = screen.getByRole('button');
    fireEvent.click(swapButton);

    expect(mockOnSwap).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<ConversionSwap {...defaultProps} disabled={true} />);

    const swapButton = screen.getByRole('button');
    expect(swapButton).toBeDisabled();
  });

  test('is enabled when disabled prop is false', () => {
    render(<ConversionSwap {...defaultProps} disabled={false} />);

    const swapButton = screen.getByRole('button');
    expect(swapButton).not.toBeDisabled();
  });

  test('has hover effects', () => {
    render(<ConversionSwap {...defaultProps} />);

    const swapButton = screen.getByRole('button');

    // Test initial state
    expect(swapButton).toHaveStyle({ opacity: '0.7' });

    // Test hover state
    fireEvent.mouseEnter(swapButton);
    expect(swapButton).toHaveStyle({ opacity: '1' });

    // Test mouse leave
    fireEvent.mouseLeave(swapButton);
    expect(swapButton).toHaveStyle({ opacity: '0.7' });
  });

  test('shows swap icon', () => {
    render(<ConversionSwap {...defaultProps} />);

    // Look for the swap icon (↔ or similar)
    expect(screen.getByText('↔')).toBeInTheDocument();
  });

  test('has accessible attributes', () => {
    render(<ConversionSwap {...defaultProps} />);

    const swapButton = screen.getByRole('button');
    expect(swapButton).toHaveAttribute(
      'aria-label',
      'Swap source and target units'
    );
  });
});
