import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversionInput from '../../components/ConversionInput';

// Mock CSS import
jest.mock('../../components/ConversionInput.css', () => ({}));

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
      expect(textarea).toHaveAttribute(
        'placeholder',
        'Enter conversions like "5 meters to feet" (one per line)'
      );
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
      fireEvent.change(textarea, {
        target: { value: '5 meters to feet\n10 inches to cm' },
      });

      expect(onChange).toHaveBeenCalledWith(
        '5 meters to feet\n10 inches to cm'
      );
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
      render(
        <ConversionInput {...defaultProps} aria-describedby="help-text" />
      );

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
    test('focuses textarea when clicked', async () => {
      render(<ConversionInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox');

      await userEvent.click(textarea);

      // Prefer Testing Library queries over direct document.activeElement checks
      expect(textarea).toHaveFocus();
    });

    test('blurs textarea when tabbing away', async () => {
      render(<ConversionInput {...defaultProps} />);

      const textarea = screen.getByRole('textbox');

      await userEvent.click(textarea);
      expect(textarea).toHaveFocus();

      await userEvent.tab();
      expect(textarea).not.toHaveFocus();
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

      // Check that the component renders properly
      const textareaEl = screen.getByRole('textbox');
      expect(textareaEl).toBeInTheDocument();
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
    });
  });

  describe('Category-Filtered Suggestions', () => {
    // These tests verify that the component correctly handles conversion patterns
    // without crashing and maintains proper state management

    test('should not crash when typing conversion patterns', async () => {
      const onChange = jest.fn();
      render(<ConversionInput value="" onChange={onChange} />);
      const textarea = screen.getByRole('textbox');

      // Type various conversion patterns and ensure they don't crash
      fireEvent.change(textarea, { target: { value: '5 m to f' } });
      expect(onChange).toHaveBeenCalledWith('5 m to f');

      fireEvent.change(textarea, { target: { value: '10 ft as cm' } });
      expect(onChange).toHaveBeenCalledWith('10 ft as cm');

      fireEvent.change(textarea, { target: { value: '100 cfm to m3/h' } });
      expect(onChange).toHaveBeenCalledWith('100 cfm to m3/h');
    });

    test('should handle partial conversion input gracefully', async () => {
      const onChange = jest.fn();
      render(<ConversionInput value="" onChange={onChange} />);
      const textarea = screen.getByRole('textbox');

      // Test various partial inputs that might trigger conversion logic
      fireEvent.change(textarea, { target: { value: '5 m to ' } });
      expect(onChange).toHaveBeenCalledWith('5 m to ');

      fireEvent.change(textarea, { target: { value: '10 ' } });
      expect(onChange).toHaveBeenCalledWith('10 ');

      fireEvent.change(textarea, { target: { value: '5 m' } });
      expect(onChange).toHaveBeenCalledWith('5 m');
    });

    test('should handle non-conversion context normally', async () => {
      const onChange = jest.fn();
      render(<ConversionInput value="" onChange={onChange} />);
      const textarea = screen.getByRole('textbox');

      // Type text that's not a conversion pattern
      fireEvent.change(textarea, { target: { value: 'test m' } });
      expect(onChange).toHaveBeenCalledWith('test m');

      fireEvent.change(textarea, { target: { value: 'hello world' } });
      expect(onChange).toHaveBeenCalledWith('hello world');

      fireEvent.change(textarea, { target: { value: 'random text with m inside' } });
      expect(onChange).toHaveBeenCalledWith('random text with m inside');
    });

    test('should handle different number formats in conversion patterns', async () => {
      const onChange = jest.fn();
      render(<ConversionInput value="" onChange={onChange} />);
      const textarea = screen.getByRole('textbox');

      // Test with decimal numbers
      fireEvent.change(textarea, { target: { value: '5.5 m to f' } });
      expect(onChange).toHaveBeenCalledWith('5.5 m to f');

      // Test with scientific notation
      fireEvent.change(textarea, { target: { value: '1e3 kg to l' } });
      expect(onChange).toHaveBeenCalledWith('1e3 kg to l');

      // Test with larger numbers
      fireEvent.change(textarea, { target: { value: '1000 m to f' } });
      expect(onChange).toHaveBeenCalledWith('1000 m to f');
    });

    test('should handle both "to" and "as" conversion keywords', async () => {
      const onChange = jest.fn();
      render(<ConversionInput value="" onChange={onChange} />);
      const textarea = screen.getByRole('textbox');

      // Test "to" keyword
      fireEvent.change(textarea, { target: { value: '5 meters to feet' } });
      expect(onChange).toHaveBeenCalledWith('5 meters to feet');

      // Test "as" keyword  
      fireEvent.change(textarea, { target: { value: '10 inches as cm' } });
      expect(onChange).toHaveBeenCalledWith('10 inches as cm');
    });

    test('should handle special characters in unit names', async () => {
      const onChange = jest.fn();
      render(<ConversionInput value="" onChange={onChange} />);
      const textarea = screen.getByRole('textbox');

      // Test units with special characters commonly found in unit systems
      fireEvent.change(textarea, { target: { value: '32 °F to °C' } });
      expect(onChange).toHaveBeenCalledWith('32 °F to °C');

      fireEvent.change(textarea, { target: { value: '1 m² to f' } });
      expect(onChange).toHaveBeenCalledWith('1 m² to f');

      fireEvent.change(textarea, { target: { value: '5 m³ to l' } });
      expect(onChange).toHaveBeenCalledWith('5 m³ to l');
    });
  });
});
