import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversionOutput from './ConversionOutput';

// Mock CSS import
jest.mock('./ConversionOutput.css', () => ({}));

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
      
      expect(screen.getByText('Results will appear here as you type...')).toBeInTheDocument();
      expect(screen.getByLabelText('Conversion results')).toBeInTheDocument();
    });

    test('renders with custom aria-label', () => {
      render(<ConversionOutput results={[]} aria-label="Custom results" />);
      
      expect(screen.getByLabelText('Custom results')).toBeInTheDocument();
    });

    test('renders with custom className', () => {
      const { container } = render(<ConversionOutput results={[]} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('conversion-output', 'empty', 'custom-class');
    });

    test('renders successful results', () => {
      const successResults = mockResults.filter(r => r.success);
      render(<ConversionOutput results={successResults} />);
      
      expect(screen.getByText('16.404 feet')).toBeInTheDocument();
      expect(screen.getByText('25.400 cm')).toBeInTheDocument();
      expect(screen.getByText('2 of 2 converted')).toBeInTheDocument();
    });

    test('renders error results', () => {
      const errorResults = mockResults.filter(r => !r.success);
      render(<ConversionOutput results={errorResults} />);
      
      expect(screen.getByText('Invalid format. Use "X unit as/to Y unit"')).toBeInTheDocument();
      expect(screen.getByText('0 of 1 converted')).toBeInTheDocument();
    });

    test('renders mixed results', () => {
      render(<ConversionOutput results={mockResults} />);
      
      expect(screen.getByText('16.404 feet')).toBeInTheDocument();
      expect(screen.getByText('25.400 cm')).toBeInTheDocument();
      expect(screen.getByText('Invalid format. Use "X unit as/to Y unit"')).toBeInTheDocument();
      expect(screen.getByText('2 of 3 converted')).toBeInTheDocument();
    });
  });

  describe('Copy to Clipboard Functionality', () => {
    test('copies result to clipboard when clicked', async () => {
      const onCopy = jest.fn();
      render(<ConversionOutput results={mockResults} onCopy={onCopy} />);
      
      const copyButton = screen.getByLabelText('Copy result: 16.404 feet');
      
      await act(async () => {
        await userEvent.click(copyButton);
      });
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('16.404 feet');
      expect(onCopy).toHaveBeenCalledWith('16.404 feet', '1');
    });

    test('shows copy feedback after successful copy', async () => {
      render(<ConversionOutput results={mockResults} />);
      
      const copyButton = screen.getByLabelText('Copy result: 16.404 feet');
      
      await act(async () => {
        await userEvent.click(copyButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    test('handles copy with Enter key', async () => {
      const onCopy = jest.fn();
      render(<ConversionOutput results={mockResults} onCopy={onCopy} />);
      
      const copyButton = screen.getByLabelText('Copy result: 16.404 feet');
      copyButton.focus();
      
      await act(async () => {
        fireEvent.keyDown(copyButton, { key: 'Enter' });
      });
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('16.404 feet');
        expect(onCopy).toHaveBeenCalledWith('16.404 feet', '1');
      });
    });

    test('handles copy with Space key', async () => {
      const onCopy = jest.fn();
      render(<ConversionOutput results={mockResults} onCopy={onCopy} />);
      
      const copyButton = screen.getByLabelText('Copy result: 16.404 feet');
      copyButton.focus();
      
      await act(async () => {
        fireEvent.keyDown(copyButton, { key: ' ' });
      });
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('16.404 feet');
        expect(onCopy).toHaveBeenCalledWith('16.404 feet', '1');
      });
    });

    test('handles clipboard API failure gracefully', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(new Error('Clipboard failed'));
      
      // Mock document.execCommand for fallback
      const originalExecCommand = document.execCommand;
      document.execCommand = jest.fn().mockReturnValue(true);
      
      render(<ConversionOutput results={mockResults} />);
      
      const copyButton = screen.getByLabelText('Copy result: 16.404 feet');
      
      await act(async () => {
        await userEvent.click(copyButton);
      });
      
      await waitFor(() => {
        expect(document.execCommand).toHaveBeenCalledWith('copy');
      });
      
      // Restore original
      document.execCommand = originalExecCommand;
    });
  });

  describe('Visual States', () => {
    test('shows copy icon for successful results', () => {
      render(<ConversionOutput results={mockResults} />);
      
      const copyButtons = screen.getAllByRole('button');
      expect(copyButtons).toHaveLength(2); // Only successful results have copy buttons
      
      copyButtons.forEach(button => {
        expect(button).toHaveTextContent('📋');
      });
    });

    test('shows check mark after copy', async () => {
      render(<ConversionOutput results={mockResults} />);
      
      const copyButton = screen.getByLabelText('Copy result: 16.404 feet');
      
      await act(async () => {
        await userEvent.click(copyButton);
      });
      
      await waitFor(() => {
        expect(copyButton).toHaveTextContent('✓');
      });
    });

    test('shows error icon for failed results', () => {
      render(<ConversionOutput results={mockResults} />);
      
      const errorResult = screen.getByRole('alert');
      expect(errorResult).toHaveTextContent('⚠️');
    });

    test('applies correct CSS classes for different states', () => {
      const { container } = render(<ConversionOutput results={mockResults} />);
      
      const results = container.querySelectorAll('.conversion-output__result');
      expect(results[0]).toHaveClass('success');
      expect(results[1]).toHaveClass('success');
      expect(results[2]).toHaveClass('error');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for copy buttons', () => {
      render(<ConversionOutput results={mockResults} />);
      
      expect(screen.getByLabelText('Copy result: 16.404 feet')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy result: 25.400 cm')).toBeInTheDocument();
    });

    test('has role="alert" for error messages', () => {
      render(<ConversionOutput results={mockResults} />);
      
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('Invalid format. Use "X unit as/to Y unit"');
    });

    test('has aria-live region for copy feedback', async () => {
      render(<ConversionOutput results={mockResults} />);
      
      const copyButton = screen.getByLabelText('Copy result: 16.404 feet');
      
      await act(async () => {
        await userEvent.click(copyButton);
      });
      
      await waitFor(() => {
        const feedback = screen.getByRole('status');
        expect(feedback).toHaveAttribute('aria-live', 'polite');
        expect(feedback).toHaveTextContent('Copied!');
      });
    });

    test('supports keyboard navigation', () => {
      render(<ConversionOutput results={mockResults} />);
      
      const copyButtons = screen.getAllByRole('button');
      copyButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
        // Should be focusable
        button.focus();
        expect(document.activeElement).toBe(button);
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
      
      const copyButton = screen.getByLabelText('Copy result: 16.404 feet');
      await userEvent.click(copyButton);
      
      // Unmount before timeout completes
      unmount();
      
      // Should not throw any errors
    });

    test('updates copy feedback when copying different results', async () => {
      render(<ConversionOutput results={mockResults} />);
      
      // Copy first result
      const firstButton = screen.getByLabelText('Copy result: 16.404 feet');
      await userEvent.click(firstButton);
      
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
      
      // Copy second result
      const secondButton = screen.getByLabelText('Copy result: 25.400 cm');
      await userEvent.click(secondButton);
      
      // Should still show feedback for the second result
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });
  });
});
