import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PolishedConverterApp } from './PolishedConverterApp';

describe('PolishedConverterApp', () => {
  describe('Consistent Styling and Theming', () => {
    it('applies consistent design system colors', () => {
      render(<PolishedConverterApp />);

      const app = screen.getByTestId('polished-converter');
      expect(app).toHaveClass('design-system-theme');

      // Check for consistent color scheme
      const styles = window.getComputedStyle(app);
      expect(styles.getPropertyValue('--primary-color')).toBe('#007bff');
      expect(styles.getPropertyValue('--secondary-color')).toBe('#6c757d');
      expect(styles.getPropertyValue('--success-color')).toBe('#28a745');
      expect(styles.getPropertyValue('--danger-color')).toBe('#dc3545');
    });

    it('applies consistent typography scale', () => {
      render(<PolishedConverterApp />);

      const heading = screen.getByRole('heading', { level: 1 });
      const styles = window.getComputedStyle(heading);

      expect(styles.fontFamily).toContain('Inter');
      expect(styles.fontWeight).toBe('300');
      expect(styles.fontSize).toBe('2.5rem');
    });

    it('uses consistent spacing system', () => {
      render(<PolishedConverterApp />);

      const app = screen.getByTestId('polished-converter');
      const styles = window.getComputedStyle(app);

      // Check CSS custom properties for spacing
      expect(styles.getPropertyValue('--spacing-xs')).toBe('4px');
      expect(styles.getPropertyValue('--spacing-sm')).toBe('8px');
      expect(styles.getPropertyValue('--spacing-md')).toBe('16px');
      expect(styles.getPropertyValue('--spacing-lg')).toBe('24px');
      expect(styles.getPropertyValue('--spacing-xl')).toBe('32px');
    });

    it('applies consistent border radius system', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      const styles = window.getComputedStyle(input);

      expect(styles.borderRadius).toBe('8px');
    });
  });

  describe('Visual Feedback and Micro-interactions', () => {
    it('shows hover states on interactive elements', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');

      // Simulate hover
      fireEvent.mouseEnter(input);

      expect(input).toHaveClass('hover-state');
    });

    it('provides focus indicators for accessibility', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');

      // Simulate focus
      fireEvent.focus(input);

      const styles = window.getComputedStyle(input);
      expect(styles.boxShadow).toContain('0 0 0 3px rgba(0, 123, 255, 0.25)');
    });

    it('shows loading states during conversion', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 feet as meters' } });

      // Should show loading indicator
      const loadingIndicator = screen.getByTestId('conversion-loading');
      expect(loadingIndicator).toBeInTheDocument();
      expect(loadingIndicator).toHaveClass('pulse-animation');
    });

    it('animates result appearance', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 feet as meters' } });

      // Result should have entrance animation
      const result = screen.getByTestId('conversion-result');
      expect(result).toHaveClass('fade-in-animation');
    });

    it('provides visual feedback for successful conversions', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 feet as meters' } });

      // Should show success state
      const result = screen.getByTestId('conversion-result');
      expect(result).toHaveClass('success-state');
    });

    it('shows error states for invalid inputs', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'invalid input' } });

      // Should show error state
      expect(input).toHaveClass('error-state');

      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('error-animation');
    });
  });

  describe('Enhanced Accessibility Features', () => {
    it('provides ARIA labels for all interactive elements', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Enter conversion query');
      expect(input).toHaveAttribute('aria-describedby', 'conversion-help');
    });

    it('supports keyboard navigation', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');

      // Tab should move focus
      fireEvent.keyDown(input, { key: 'Tab' });

      // Next focusable element should receive focus
      const helpText = screen.getByTestId('conversion-help');
      expect(helpText).toHaveAttribute('tabindex', '0');
    });

    it('provides screen reader announcements', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 feet as meters' } });

      // Should have aria-live region for announcements
      const announcements = screen.getByTestId('conversion-announcements');
      expect(announcements).toHaveAttribute('aria-live', 'polite');
      expect(announcements).toHaveTextContent(
        'Conversion completed: 10 feet equals 3.048 meters'
      );
    });

    it('supports high contrast mode', () => {
      // Mock high contrast preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<PolishedConverterApp />);

      const app = screen.getByTestId('polished-converter');
      expect(app).toHaveClass('high-contrast-mode');
    });

    it('provides sufficient color contrast ratios', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      const styles = window.getComputedStyle(input);

      // Verify contrast meets WCAG AA standards (simplified test)
      expect(styles.color).toBe('rgb(33, 37, 41)'); // Dark text
      expect(styles.backgroundColor).toBe('rgb(255, 255, 255)'); // Light background
    });
  });

  describe('Improved Input Validation and Error Messages', () => {
    it('shows helpful error messages for invalid units', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, {
        target: { value: '10 invalidunit as meters' },
      });

      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toHaveTextContent(
        'Unknown unit: "invalidunit". Did you mean "inch" or "yard"?'
      );
    });

    it('provides real-time validation feedback', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');

      // Type incomplete conversion
      fireEvent.change(input, { target: { value: '10 feet' } });

      const validationHint = screen.getByTestId('validation-hint');
      expect(validationHint).toHaveTextContent(
        'Add target unit (e.g., "as meters" or "to inches")'
      );
    });

    it('shows precision handling options', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 feet as meters' } });

      const precisionControl = screen.getByTestId('precision-control');
      expect(precisionControl).toBeInTheDocument();

      const precisionSlider = screen.getByRole('slider');
      expect(precisionSlider).toHaveAttribute(
        'aria-label',
        'Decimal precision'
      );
      expect(precisionSlider).toHaveAttribute('min', '0');
      expect(precisionSlider).toHaveAttribute('max', '6');
    });
  });

  describe('Enhanced Placeholder Text and Labels', () => {
    it('provides contextual placeholder examples', () => {
      render(<PolishedConverterApp />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder');

      const placeholder = input.getAttribute('placeholder');
      expect(placeholder).toContain('13 meters as feet');
      expect(placeholder).toContain('5.5 km to miles');
      expect(placeholder).toContain('100 cm as inches');
    });

    it('shows helpful labels and descriptions', () => {
      render(<PolishedConverterApp />);

      const helpText = screen.getByTestId('conversion-help');
      expect(helpText).toHaveTextContent(
        'Enter natural language conversions like "13 meters as feet" or "5.5 km to miles"'
      );

      const suggestionHint = screen.getByTestId('suggestion-hint');
      expect(suggestionHint).toHaveTextContent(
        'Type partial unit names to see suggestions • Click suggestions to auto-complete'
      );
    });
  });
});
