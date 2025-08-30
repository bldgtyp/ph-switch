import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversionOutput from '../../components/ConversionOutput';

// Mock CSS import
jest.mock('../../components/ConversionOutput.css', () => ({}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('ConversionOutput', () => {
  const mockResults = [
    {
      id: '1',
      input: '5 meters to feet',
      output: '16.404 feet',
      success: true,
    },
    {
      id: '2',
      input: '10 inches to cm',
      output: '25.400 cm',
      success: true,
    },
    {
      id: '3',
      input: 'invalid input',
      error: 'Invalid format. Use "X unit as/to Y unit"',
      success: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Basic Rendering', () => {
    test('renders empty state when no results', () => {
      render(<ConversionOutput results={[]} />);

      expect(
        screen.getByText('Results will appear here as you type...')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Conversion results')).toBeInTheDocument();
    });

    test('renders with custom aria-label', () => {
      render(<ConversionOutput results={[]} aria-label="Custom results" />);

      expect(screen.getByLabelText('Custom results')).toBeInTheDocument();
    });

    test('renders with custom className', () => {
      render(<ConversionOutput results={[]} className="custom-class" />);

      const output = screen.getByLabelText('Conversion results');
      expect(output).toHaveClass('conversion-output', 'empty', 'custom-class');
    });

    test('renders successful results', () => {
      const successResults = mockResults.filter((r) => r.success);
      render(<ConversionOutput results={successResults} />);

      expect(screen.getByText('16.404 feet')).toBeInTheDocument();
      expect(screen.getByText('25.400 cm')).toBeInTheDocument();
    });

    test('renders error results', () => {
      const errorResults = mockResults.filter((r) => !r.success);
      render(<ConversionOutput results={errorResults} />);

      expect(
        screen.getByText('Invalid format. Use "X unit as/to Y unit"')
      ).toBeInTheDocument();
    });

    test('renders mixed results', () => {
      render(<ConversionOutput results={mockResults} />);

      expect(screen.getByText('16.404 feet')).toBeInTheDocument();
      expect(screen.getByText('25.400 cm')).toBeInTheDocument();
      expect(
        screen.getByText('Invalid format. Use "X unit as/to Y unit"')
      ).toBeInTheDocument();
    });
  });

  describe('Copy to Clipboard Functionality', () => {
    test('copies numeric value to clipboard when clicked', async () => {
      const onCopy = jest.fn();
      render(<ConversionOutput results={mockResults} onCopy={onCopy} />);

      const copyButton = screen.getByLabelText('Copy numeric value: 16.404');

      await userEvent.click(copyButton);
      // wait for visual feedback to ensure state updates finished
      await screen.findByText('Copied!');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('16.404');
      expect(onCopy).toHaveBeenCalledWith('16.404 feet', '1');
    });

    test('shows copy feedback after successful copy', async () => {
      render(<ConversionOutput results={mockResults} />);

      const copyButton = screen.getByLabelText('Copy numeric value: 16.404');

      await userEvent.click(copyButton);
      await screen.findByText('Copied!');
    });

    test('handles copy with Enter key', async () => {
      const onCopy = jest.fn();
      render(<ConversionOutput results={mockResults} onCopy={onCopy} />);

      const copyButton = screen.getByLabelText('Copy numeric value: 16.404');
      copyButton.focus();
      fireEvent.keyDown(copyButton, { key: 'Enter' });

      await screen.findByText('Copied!');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('16.404');
      expect(onCopy).toHaveBeenCalledWith('16.404 feet', '1');
    });

    test('handles copy with Space key', async () => {
      const onCopy = jest.fn();
      render(<ConversionOutput results={mockResults} onCopy={onCopy} />);

      const copyButton = screen.getByLabelText('Copy numeric value: 16.404');
      copyButton.focus();
      fireEvent.keyDown(copyButton, { key: ' ' });

      await screen.findByText('Copied!');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('16.404');
      expect(onCopy).toHaveBeenCalledWith('16.404 feet', '1');
    });

    test('handles clipboard API failure gracefully', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(
        new Error('Clipboard failed')
      );

      // Mock console.info to verify fallback behavior
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      render(<ConversionOutput results={mockResults} />);

      const copyButton = screen.getByLabelText('Copy numeric value: 16.404');

      await userEvent.click(copyButton);
      await screen.findByText('Copied!');

      // Verify that the fallback text selection was triggered
      expect(consoleSpy).toHaveBeenCalledWith(
        'Text selected for manual copy:',
        '16.404'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Visual States', () => {
    test('shows copy buttons for successful results', () => {
      render(<ConversionOutput results={mockResults} />);

      const copyButtons = screen.getAllByRole('button');
      expect(copyButtons).toHaveLength(2); // Only successful results have copy buttons

      // Verify buttons have proper aria-labels for copy functionality
      expect(
        screen.getByLabelText('Copy numeric value: 16.404')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Copy numeric value: 25.400')
      ).toBeInTheDocument();
    });

    test('copy functionality works correctly', async () => {
      // Mock the clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(<ConversionOutput results={mockResults} />);

      const copyButton = screen.getByLabelText('Copy numeric value: 16.404');

      await userEvent.click(copyButton);
      await screen.findByText('Copied!');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('16.404');
    });

    test('shows error icon for failed results', () => {
      render(<ConversionOutput results={mockResults} />);

      const errorResult = screen.getByRole('alert');
      expect(errorResult).toHaveTextContent('⚠️');
    });

    test('applies correct CSS classes for different states', () => {
      render(<ConversionOutput results={mockResults} />);

      // Successful results render as buttons
      const buttons = screen.getAllByRole('button');
      // Buttons themselves carry the interactive value class
      expect(buttons[0]).toHaveClass('conversion-output__value');
      expect(buttons[1]).toHaveClass('conversion-output__value');

      // Error result should be rendered with role='alert' and contain the error text
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent(
        'Invalid format. Use "X unit as/to Y unit"'
      );
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for copy buttons', () => {
      render(<ConversionOutput results={mockResults} />);

      expect(
        screen.getByLabelText('Copy numeric value: 16.404')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Copy numeric value: 25.400')
      ).toBeInTheDocument();
    });

    test('has role="alert" for error messages', () => {
      render(<ConversionOutput results={mockResults} />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent(
        'Invalid format. Use "X unit as/to Y unit"'
      );
    });

    test('has aria-live region for copy feedback', async () => {
      render(<ConversionOutput results={mockResults} />);

      const copyButton = screen.getByLabelText('Copy numeric value: 16.404');

      await userEvent.click(copyButton);

      const feedback = await screen.findByRole('status');
      expect(feedback).toHaveAttribute('aria-live', 'polite');
      expect(feedback).toHaveTextContent('Copied!');
    });

    test('supports keyboard navigation', () => {
      render(<ConversionOutput results={mockResults} />);

      const copyButtons = screen.getAllByRole('button');
      copyButtons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
        // Should be focusable
        button.focus();
        expect(button).toHaveFocus();
      });
    });
  });

  describe('Error Handling', () => {
    test('displays fallback error message when none provided', () => {
      const resultsWithoutError = [
        {
          id: '1',
          input: 'invalid',
          success: false,
        },
      ];

      render(<ConversionOutput results={resultsWithoutError} />);

      expect(screen.getByText('Conversion failed')).toBeInTheDocument();
    });

    test('handles empty error strings', () => {
      const resultsWithEmptyError = [
        {
          id: '1',
          input: 'invalid',
          error: '',
          success: false,
        },
      ];

      render(<ConversionOutput results={resultsWithEmptyError} />);

      expect(screen.getByText('Conversion failed')).toBeInTheDocument();
    });
  });

  describe('Performance and Cleanup', () => {
    test('clears copy feedback timeout on unmount', async () => {
      const { unmount } = render(<ConversionOutput results={mockResults} />);

      const copyButton = screen.getByLabelText('Copy numeric value: 16.404');
      await userEvent.click(copyButton);

      // Unmount before timeout completes
      unmount();

      // Should not throw any errors
    });

    test('updates copy feedback when copying different results', async () => {
      render(<ConversionOutput results={mockResults} />);

      // Copy first result
      const firstButton = screen.getByLabelText('Copy numeric value: 16.404');
      await userEvent.click(firstButton);

      await screen.findByText('Copied!');

      // Copy second result
      const secondButton = screen.getByLabelText('Copy numeric value: 25.400');
      await userEvent.click(secondButton);

      // Should still show feedback for the second result
      await screen.findByText('Copied!');
    });
  });
});
