import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedConverterApp } from './UnifiedConverterApp';

// Mock matchMedia for responsive and accessibility tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: query.includes('max-width: 768px')
      ? false
      : query.includes('prefers-contrast: high')
        ? false
        : false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('UnifiedConverterApp', () => {
  beforeEach(() => {
    // Reset matchMedia mock before each test
    (window.matchMedia as jest.Mock).mockClear();
  });

  describe('Core Functionality', () => {
    it('renders the main converter interface', () => {
      render(<UnifiedConverterApp />);

      expect(screen.getByText('PH-Switch')).toBeInTheDocument();
      expect(screen.getByLabelText(/enter conversion/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('handles basic conversion input and displays results', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 meters as feet' } });

      await waitFor(() => {
        // Should show conversion result
        expect(screen.getByText(/32\.8/)).toBeInTheDocument();
      });
    });

    it('handles multi-line conversions', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, {
        target: { value: '10 meters as feet\n5 kg as pounds' },
      });

      await waitFor(() => {
        // Should show multiple conversion results
        expect(screen.getByText(/32\.8.*feet/)).toBeInTheDocument();
        expect(screen.getByText(/11\.0.*pounds/)).toBeInTheDocument();
      });
    });

    it('displays conversion errors for invalid input', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 invalidunit as feet' } });

      await waitFor(() => {
        expect(screen.getByText(/unknown unit/i)).toBeInTheDocument();
      });
    });
  });

  describe('Unit Suggestions Feature', () => {
    it('shows unit suggestions when typing partial unit names', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 met' } });

      await waitFor(() => {
        expect(screen.getByText(/meter/i)).toBeInTheDocument();
      });
    });

    it('allows clicking suggestions to auto-complete', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 met' } });

      await waitFor(() => {
        const suggestion = screen.getByText(/meter/i);
        fireEvent.click(suggestion);
        expect(input).toHaveValue(expect.stringContaining('meter'));
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders with desktop layout by default', () => {
      render(<UnifiedConverterApp />);

      const container = screen.getByTestId('unified-converter');
      expect(container).toHaveClass('desktop-layout');
    });

    it('switches to mobile layout on small screens', () => {
      // Mock mobile viewport
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<UnifiedConverterApp />);

      const container = screen.getByTestId('unified-converter');
      expect(container).toHaveClass('mobile-layout');
    });

    it('adapts input size for mobile', () => {
      // Mock mobile viewport
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('mobile-input');
    });
  });

  describe('Design System and Theming', () => {
    it('applies design system CSS variables', () => {
      render(<UnifiedConverterApp />);

      const container = screen.getByTestId('unified-converter');
      const styles = getComputedStyle(container);

      // Check for CSS custom properties
      expect(container).toHaveStyle({
        '--primary-color': '#007bff',
        '--secondary-color': '#6c757d',
        '--success-color': '#28a745',
        '--danger-color': '#dc3545',
      });
    });

    it('applies design system theme class', () => {
      render(<UnifiedConverterApp />);

      const container = screen.getByTestId('unified-converter');
      expect(container).toHaveClass('design-system-theme');
    });

    it('uses Inter font family', () => {
      render(<UnifiedConverterApp />);

      const title = screen.getByText('PH-Switch');
      expect(title).toHaveStyle({
        fontFamily: expect.stringContaining('Inter'),
      });
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper ARIA labels', () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute(
        'aria-label',
        expect.stringContaining('conversion')
      );
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('supports high contrast mode', () => {
      // Mock high contrast preference
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query.includes('prefers-contrast: high'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(<UnifiedConverterApp />);

      const container = screen.getByTestId('unified-converter');
      expect(container).toHaveClass('high-contrast-mode');
    });

    it('provides screen reader announcements for conversions', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 feet as meters' } });

      await waitFor(() => {
        const announcements = screen.getByTestId('conversion-announcements');
        expect(announcements).toHaveTextContent(/conversion completed/i);
      });
    });

    it('has proper heading hierarchy', () => {
      render(<UnifiedConverterApp />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('PH-Switch');
    });
  });

  describe('Visual Feedback and Interactions', () => {
    it('shows loading state during conversion', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 meters as feet' } });

      // Should briefly show loading indicator
      expect(screen.getByTestId('conversion-loading')).toBeInTheDocument();
    });

    it('applies hover states to interactive elements', () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('hover-state');
    });

    it('shows focus states with proper styling', () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(input).toHaveStyle({
        boxShadow: expect.stringContaining('rgba(0, 123, 255, 0.25)'),
      });
    });

    it('includes animation classes for smooth transitions', () => {
      render(<UnifiedConverterApp />);

      const results = screen.getByTestId('conversion-result');
      expect(results).toHaveClass('fade-in-animation');
    });
  });

  describe('Real-time Validation', () => {
    it('provides syntax hints for incomplete input', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 meters' } });

      await waitFor(() => {
        expect(screen.getByTestId('validation-hint')).toHaveTextContent(
          /add target unit/i
        );
      });
    });

    it('shows error messages for invalid units with suggestions', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'invalid input' } });

      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message');
        expect(errorMessage).toHaveTextContent(/unknown unit/i);
        expect(errorMessage).toHaveTextContent(/did you mean/i);
      });
    });

    it('validates input in real-time without submission', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '10 invalidunit as feet' } });

      // Should show validation immediately
      await waitFor(() => {
        expect(screen.getByText(/unknown unit/i)).toBeInTheDocument();
      });
    });
  });

  describe('Enhanced Input Features', () => {
    it('provides helpful placeholder text', () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute(
        'placeholder',
        expect.stringContaining('13 meters as feet')
      );
    });

    it('supports spell check disabled for technical input', () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('spellcheck', 'false');
    });

    it('includes precision control slider', () => {
      render(<UnifiedConverterApp />);

      const precisionSlider = screen.getByTestId('precision-control');
      expect(precisionSlider).toBeInTheDocument();

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '6');
    });

    it('adjusts precision when slider is changed', async () => {
      render(<UnifiedConverterApp />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '4' } });

      expect(screen.getByText(/decimal precision: 4/i)).toBeInTheDocument();
    });
  });

  describe('Integration and Performance', () => {
    it('handles rapid input changes without errors', async () => {
      render(<UnifiedConverterApp />);

      const input = screen.getByRole('textbox');

      // Simulate rapid typing
      fireEvent.change(input, { target: { value: '1' } });
      fireEvent.change(input, { target: { value: '10' } });
      fireEvent.change(input, { target: { value: '10 ' } });
      fireEvent.change(input, { target: { value: '10 m' } });
      fireEvent.change(input, { target: { value: '10 meters as feet' } });

      await waitFor(() => {
        expect(screen.getByText(/32\.8/)).toBeInTheDocument();
      });
    });

    it('cleans up event listeners on unmount', () => {
      const { unmount } = render(<UnifiedConverterApp />);

      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      unmount();

      // Should clean up media query listeners
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });
});
