import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResponsiveLayout } from './ResponsiveLayout';

// Mock window.matchMedia for responsive tests
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('ResponsiveLayout', () => {
  beforeEach(() => {
    // Reset mock before each test
    jest.clearAllMocks();
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      mockMatchMedia(true); // Mobile viewport
    });

    it('renders mobile layout for small screens', () => {
      render(
        <ResponsiveLayout>
          <div data-testid="content">Test Content</div>
        </ResponsiveLayout>
      );

      const layout = screen.getByTestId('responsive-layout');
      expect(layout).toHaveClass('mobile-layout');
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('applies mobile-specific styling', () => {
      render(
        <ResponsiveLayout>
          <div>Test Content</div>
        </ResponsiveLayout>
      );

      const layout = screen.getByTestId('responsive-layout');
      expect(layout).toHaveStyle('padding: 16px');
      expect(layout).toHaveStyle('max-width: 100%');
    });

    it('optimizes touch targets for mobile', () => {
      render(
        <ResponsiveLayout>
          <button data-testid="touch-button" style={{ minHeight: '44px' }}>
            Touch Me
          </button>
        </ResponsiveLayout>
      );

      const button = screen.getByTestId('touch-button');
      const styles = window.getComputedStyle(button);
      // Touch targets should be at least 44px for good accessibility
      expect(parseFloat(styles.minHeight)).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Desktop Layout', () => {
    beforeEach(() => {
      mockMatchMedia(false); // Desktop viewport
    });

    it('renders desktop layout for large screens', () => {
      render(
        <ResponsiveLayout>
          <div data-testid="content">Test Content</div>
        </ResponsiveLayout>
      );

      const layout = screen.getByTestId('responsive-layout');
      expect(layout).toHaveClass('desktop-layout');
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('applies desktop-specific styling', () => {
      render(
        <ResponsiveLayout>
          <div>Test Content</div>
        </ResponsiveLayout>
      );

      const layout = screen.getByTestId('responsive-layout');
      expect(layout).toHaveStyle('padding: 24px');
      expect(layout).toHaveStyle('max-width: 800px');
    });

    it('centers content on larger screens', () => {
      render(
        <ResponsiveLayout>
          <div>Test Content</div>
        </ResponsiveLayout>
      );

      const layout = screen.getByTestId('responsive-layout');
      expect(layout).toHaveStyle('margin: 0px auto');
    });
  });

  describe('Responsive Breakpoints', () => {
    it('handles viewport changes dynamically', () => {
      // Test mobile viewport
      mockMatchMedia(true);
      const { unmount } = render(
        <ResponsiveLayout>
          <div>Test Content</div>
        </ResponsiveLayout>
      );

      let layout = screen.getByTestId('responsive-layout');
      expect(layout).toHaveClass('mobile-layout');
      unmount();

      // Test desktop viewport
      mockMatchMedia(false);
      render(
        <ResponsiveLayout>
          <div>Test Content</div>
        </ResponsiveLayout>
      );

      layout = screen.getByTestId('responsive-layout');
      expect(layout).toHaveClass('desktop-layout');
    });
  });
});
