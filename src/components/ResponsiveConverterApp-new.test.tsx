import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponsiveConverterApp } from './ResponsiveConverterApp';

// Mock window.matchMedia for responsive tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('ResponsiveConverterApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mobile Interface', () => {
    beforeEach(() => {
      mockMatchMedia(true); // Mobile viewport
    });

    it('renders converter with mobile-optimized layout', () => {
      render(<ResponsiveConverterApp />);

      const app = screen.getByTestId('responsive-converter');
      expect(app).toHaveClass('mobile-layout');

      // Check that input field exists (textarea in this case)
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('applies mobile layout class', () => {
      render(<ResponsiveConverterApp />);

      const app = screen.getByTestId('responsive-converter');
      expect(app).toHaveClass('mobile-layout');
      expect(app).toHaveClass('responsive-converter');
    });

    it('wraps content in responsive layout', () => {
      render(<ResponsiveConverterApp />);

      const layout = screen.getByTestId('responsive-layout');
      expect(layout).toHaveClass('mobile-layout');
      expect(layout).toBeInTheDocument();
    });

    it('renders the converter app within responsive wrapper', () => {
      render(<ResponsiveConverterApp />);

      // Should contain the main converter functionality
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();

      const resultSection = screen.getByTestId('conversion-result');
      expect(resultSection).toBeInTheDocument();
    });
  });

  describe('Desktop Interface', () => {
    beforeEach(() => {
      mockMatchMedia(false); // Desktop viewport
    });

    it('renders converter with desktop layout', () => {
      render(<ResponsiveConverterApp />);

      const app = screen.getByTestId('responsive-converter');
      expect(app).toHaveClass('desktop-layout');
    });

    it('applies desktop layout class', () => {
      render(<ResponsiveConverterApp />);

      const app = screen.getByTestId('responsive-converter');
      expect(app).toHaveClass('desktop-layout');
      expect(app).toHaveClass('responsive-converter');
    });

    it('wraps content in responsive layout for desktop', () => {
      render(<ResponsiveConverterApp />);

      const layout = screen.getByTestId('responsive-layout');
      expect(layout).toHaveClass('desktop-layout');
      expect(layout).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('switches layout classes based on viewport', () => {
      // Test mobile
      mockMatchMedia(true);
      const { unmount } = render(<ResponsiveConverterApp />);

      let app = screen.getByTestId('responsive-converter');
      expect(app).toHaveClass('mobile-layout');
      unmount();

      // Test desktop
      mockMatchMedia(false);
      render(<ResponsiveConverterApp />);

      app = screen.getByTestId('responsive-converter');
      expect(app).toHaveClass('desktop-layout');
    });

    it('maintains converter functionality across viewports', () => {
      mockMatchMedia(true); // Mobile
      render(<ResponsiveConverterApp />);

      // Should have input and result sections
      const input = screen.getByRole('textbox');
      const resultSection = screen.getByTestId('conversion-result');

      expect(input).toBeInTheDocument();
      expect(resultSection).toBeInTheDocument();
    });
  });

  describe('Integration with existing converter', () => {
    beforeEach(() => {
      mockMatchMedia(true); // Test on mobile
    });

    it('integrates with ConverterAppWithSuggestions', () => {
      render(<ResponsiveConverterApp />);

      const input = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(input, { target: { value: '10 feet as meters' } });

      // Should show conversion results
      expect(input.value).toBe('10 feet as meters');
    });

    it('maintains suggestions functionality', () => {
      render(<ResponsiveConverterApp />);

      const input = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(input, { target: { value: 'fe' } });

      // The input should show the partial text
      expect(input.value).toBe('fe');
    });

    it('provides responsive wrapper around existing functionality', () => {
      render(<ResponsiveConverterApp />);

      // Should have all the main elements wrapped appropriately
      const layout = screen.getByTestId('responsive-layout');
      const converter = screen.getByTestId('responsive-converter');

      expect(layout).toContainElement(converter);
      expect(converter).toBeInTheDocument();
    });
  });
});
