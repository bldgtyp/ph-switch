import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversionInput from './ConversionInput';

// Mock CSS import
jest.mock('./ConversionInput.css', () => ({}));

describe('ConversionInput', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders with default props', () => {
      render(<ConversionInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('aria-label', 'Conversion input');
      expect(textarea).toHaveAttribute('placeholder', 'Enter conversions like "5 meters to feet" (one per line)');
    });

    test('renders with custom props', () => {
      const customProps = {
        ...defaultProps,
        placeholder: 'Custom placeholder',
        'aria-label': 'Custom label',
        'aria-describedby': 'help-text',
        disabled: true,
      };

      render(<ConversionInput {...customProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder');
      expect(textarea).toHaveAttribute('aria-label', 'Custom label');
      expect(textarea).toHaveAttribute('aria-describedby', 'help-text');
      expect(textarea).toBeDisabled();
    });

    test('displays correct line count for single line', () => {
      render(<ConversionInput {...defaultProps} value="5 meters to feet" />);
      
      expect(screen.getByText('1 line')).toBeInTheDocument();
    });

    test('displays correct line count for multiple lines', () => {
      const multiLineValue = '5 meters to feet\n10 inches to cm\n3 km to miles';
      render(<ConversionInput {...defaultProps} value={multiLineValue} />);
      
      expect(screen.getByText('3 lines')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onChange when user types', () => {
      const onChange = jest.fn();
      
      render(<ConversionInput {...defaultProps} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '5 meters to feet' } });
      
      expect(onChange).toHaveBeenCalledWith('5 meters to feet');
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    test('calls onFocus when textarea gains focus', async () => {
      const onFocus = jest.fn();
      
      render(<ConversionInput {...defaultProps} onFocus={onFocus} />);
      
      const textarea = screen.getByRole('textbox');
      await userEvent.click(textarea);
      
      expect(onFocus).toHaveBeenCalled();
    });

    test('calls onBlur when textarea loses focus', async () => {
      const onBlur = jest.fn();
      
      render(<ConversionInput {...defaultProps} onBlur={onBlur} />);
      
      const textarea = screen.getByRole('textbox');
      await userEvent.click(textarea);
      await userEvent.tab(); // Move focus away
      
      expect(onBlur).toHaveBeenCalled();
    });

    test('handles Enter key for multi-line input', () => {
      const onChange = jest.fn();
      
      render(<ConversionInput {...defaultProps} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '5 meters to feet\n10 inches to cm' } });
      
      expect(onChange).toHaveBeenCalledWith('5 meters to feet\n10 inches to cm');
    });

    test('handles Tab key without preventing default', async () => {
      render(
        <div>
          <ConversionInput {...defaultProps} />
          <button>Next element</button>
        </div>
      );
      
      const textarea = screen.getByRole('textbox');
      await userEvent.click(textarea);
      await userEvent.tab();
      
      const button = screen.getByRole('button');
      expect(button).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<ConversionInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label');
      expect(textarea).toHaveAttribute('spellcheck', 'false');
      expect(textarea).toHaveAttribute('autocomplete', 'off');
      expect(textarea).toHaveAttribute('autocorrect', 'off');
      expect(textarea).toHaveAttribute('autocapitalize', 'off');
    });

    test('supports aria-describedby for help text', () => {
      render(<ConversionInput {...defaultProps} aria-describedby="help-text" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'help-text');
    });

    test('applies disabled state correctly', () => {
      render(<ConversionInput {...defaultProps} disabled />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });
  });

  describe('Focus Management', () => {
    test('applies focused class when textarea is focused', async () => {
      render(<ConversionInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      const container = textarea.closest('.conversion-input');
      
      await userEvent.click(textarea);
      expect(container).toHaveClass('focused');
    });

    test('removes focused class when textarea loses focus', async () => {
      render(<ConversionInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      const container = textarea.closest('.conversion-input');
      
      await userEvent.click(textarea);
      expect(container).toHaveClass('focused');
      
      await userEvent.tab();
      expect(container).not.toHaveClass('focused');
    });
  });

  describe('Auto-resize Functionality', () => {
    test('textarea has CSS class applied', () => {
      render(<ConversionInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('conversion-input__textarea');
    });

    test('component renders with proper CSS classes', () => {
      render(<ConversionInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('conversion-input__textarea');
      
      // Check that indicators are present
      const indicators = document.querySelector('.conversion-input__indicators');
      expect(indicators).toBeInTheDocument();
      
      const lineCount = document.querySelector('.conversion-input__line-count');
      expect(lineCount).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    test('accepts typical conversion input format', () => {
      const onChange = jest.fn();
      
      render(<ConversionInput {...defaultProps} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      const testInput = '5 meters to feet';
      
      fireEvent.change(textarea, { target: { value: testInput } });
      
      expect(onChange).toHaveBeenCalledWith(testInput);
    });

    test('handles special characters and numbers', () => {
      const onChange = jest.fn();
      
      render(<ConversionInput {...defaultProps} onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      const testInput = '2.5 m² to ft²';
      
      fireEvent.change(textarea, { target: { value: testInput } });
      
      expect(onChange).toHaveBeenCalledWith(testInput);
    });

    test('handles empty input gracefully', () => {
      render(<ConversionInput {...defaultProps} value="" />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
      expect(screen.getByText('1 line')).toBeInTheDocument();
    });
  });
});
