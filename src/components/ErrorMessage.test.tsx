import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  describe('Basic Rendering', () => {
    test('renders with simple error message', () => {
      render(<ErrorMessage message="Something went wrong" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('renders with custom className', () => {
      render(
        <ErrorMessage message="Test error" className="custom-error-class" />
      );

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveClass('error-message');
      expect(errorElement).toHaveClass('custom-error-class');
    });

    test('renders with custom aria-label', () => {
      render(
        <ErrorMessage
          message="Test error"
          ariaLabel="Custom error description"
        />
      );

      expect(
        screen.getByLabelText('Custom error description')
      ).toBeInTheDocument();
    });

    test('renders as critical error', () => {
      render(<ErrorMessage message="Critical error" critical={true} />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveClass('error-message--critical');
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    test('renders as non-critical error by default', () => {
      render(<ErrorMessage message="Regular error" />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).not.toHaveClass('error-message--critical');
      expect(screen.getByText('ℹ️')).toBeInTheDocument();
    });
  });

  describe('Suggestions Functionality', () => {
    const mockSuggestions = ['meter', 'millimeter', 'centimeter'];

    test('renders suggestions when provided', () => {
      render(
        <ErrorMessage
          message="Unknown unit 'mtr'"
          suggestions={mockSuggestions}
        />
      );

      expect(screen.getByText('Did you mean:')).toBeInTheDocument();
      expect(screen.getByText('meter')).toBeInTheDocument();
      expect(screen.getByText('millimeter')).toBeInTheDocument();
      expect(screen.getByText('centimeter')).toBeInTheDocument();
    });

    test('does not render suggestions section when empty', () => {
      render(<ErrorMessage message="Error with no suggestions" />);

      expect(screen.queryByText('Did you mean:')).not.toBeInTheDocument();
    });

    test('renders clickable suggestion buttons when onSuggestionClick provided', () => {
      const mockOnClick = jest.fn();

      render(
        <ErrorMessage
          message="Unknown unit"
          suggestions={mockSuggestions}
          onSuggestionClick={mockOnClick}
        />
      );

      const suggestion = screen.getByRole('button', {
        name: 'Use suggestion: meter',
      });
      expect(suggestion).toBeInTheDocument();
    });

    test('renders non-clickable suggestions when no onSuggestionClick', () => {
      render(
        <ErrorMessage message="Unknown unit" suggestions={mockSuggestions} />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByText('meter')).toBeInTheDocument();
    });

    test('calls onSuggestionClick when suggestion is clicked', async () => {
      const mockOnClick = jest.fn();

      render(
        <ErrorMessage
          message="Unknown unit"
          suggestions={mockSuggestions}
          onSuggestionClick={mockOnClick}
        />
      );

      const suggestion = screen.getByRole('button', {
        name: 'Use suggestion: meter',
      });
      await userEvent.click(suggestion);

      expect(mockOnClick).toHaveBeenCalledWith('meter');
    });

    test('handles suggestion click with Enter key', () => {
      const mockOnClick = jest.fn();

      render(
        <ErrorMessage
          message="Unknown unit"
          suggestions={mockSuggestions}
          onSuggestionClick={mockOnClick}
        />
      );

      const suggestion = screen.getByRole('button', {
        name: 'Use suggestion: meter',
      });
      fireEvent.keyDown(suggestion, { key: 'Enter' });

      expect(mockOnClick).toHaveBeenCalledWith('meter');
    });

    test('handles suggestion click with Space key', () => {
      const mockOnClick = jest.fn();

      render(
        <ErrorMessage
          message="Unknown unit"
          suggestions={mockSuggestions}
          onSuggestionClick={mockOnClick}
        />
      );

      const suggestion = screen.getByRole('button', {
        name: 'Use suggestion: meter',
      });
      fireEvent.keyDown(suggestion, { key: ' ' });

      expect(mockOnClick).toHaveBeenCalledWith('meter');
    });

    test('ignores other key presses on suggestions', () => {
      const mockOnClick = jest.fn();

      render(
        <ErrorMessage
          message="Unknown unit"
          suggestions={mockSuggestions}
          onSuggestionClick={mockOnClick}
        />
      );

      const suggestion = screen.getByRole('button', {
        name: 'Use suggestion: meter',
      });
      fireEvent.keyDown(suggestion, { key: 'Tab' });

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper role="alert" for error announcement', () => {
      render(<ErrorMessage message="Accessibility test" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('has aria-hidden on decorative icon', () => {
      render(<ErrorMessage message="Icon test" />);

      const icon = screen.getByText('ℹ️');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    test('suggestions list has proper role="list"', () => {
      render(
        <ErrorMessage message="List test" suggestions={['meter', 'foot']} />
      );

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    test('suggestion buttons have descriptive aria-labels', () => {
      render(
        <ErrorMessage
          message="Label test"
          suggestions={['meter']}
          onSuggestionClick={() => {}}
        />
      );

      expect(
        screen.getByLabelText('Use suggestion: meter')
      ).toBeInTheDocument();
    });

    test('supports keyboard navigation for suggestions', async () => {
      const mockOnClick = jest.fn();

      render(
        <ErrorMessage
          message="Keyboard test"
          suggestions={['meter', 'foot']}
          onSuggestionClick={mockOnClick}
        />
      );

      const firstSuggestion = screen.getByRole('button', {
        name: 'Use suggestion: meter',
      });
      const secondSuggestion = screen.getByRole('button', {
        name: 'Use suggestion: foot',
      });

      // Focus first suggestion
      firstSuggestion.focus();
      expect(document.activeElement).toBe(firstSuggestion);

      // Tab to second suggestion
      await userEvent.tab();
      expect(document.activeElement).toBe(secondSuggestion);
    });
  });

  describe('Error Content Handling', () => {
    test('handles long error messages', () => {
      const longMessage =
        'This is a very long error message that should be handled gracefully by the component without breaking the layout or causing accessibility issues.';

      render(<ErrorMessage message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    test('handles empty error message', () => {
      render(<ErrorMessage message="" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('handles special characters in error message', () => {
      const specialMessage = 'Error: Could not parse "5.5 m²" → check units!';

      render(<ErrorMessage message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    test('handles suggestions with special characters', () => {
      const specialSuggestions = ['m²', 'ft²', 'in²'];

      render(
        <ErrorMessage
          message="Unknown area unit"
          suggestions={specialSuggestions}
        />
      );

      expect(screen.getByText('m²')).toBeInTheDocument();
      expect(screen.getByText('ft²')).toBeInTheDocument();
      expect(screen.getByText('in²')).toBeInTheDocument();
    });
  });

  describe('Component Interaction', () => {
    test('handles multiple suggestion clicks correctly', async () => {
      const mockOnClick = jest.fn();

      render(
        <ErrorMessage
          message="Multiple click test"
          suggestions={['meter', 'foot', 'inch']}
          onSuggestionClick={mockOnClick}
        />
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Use suggestion: meter' })
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Use suggestion: foot' })
      );

      expect(mockOnClick).toHaveBeenCalledTimes(2);
      expect(mockOnClick).toHaveBeenNthCalledWith(1, 'meter');
      expect(mockOnClick).toHaveBeenNthCalledWith(2, 'foot');
    });

    test('prevents default behavior on keyboard events', () => {
      const mockOnClick = jest.fn();

      render(
        <ErrorMessage
          message="Prevent default test"
          suggestions={['meter']}
          onSuggestionClick={mockOnClick}
        />
      );

      const suggestion = screen.getByRole('button', {
        name: 'Use suggestion: meter',
      });
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
      });

      // Mock preventDefault
      enterEvent.preventDefault = jest.fn();
      spaceEvent.preventDefault = jest.fn();

      fireEvent(suggestion, enterEvent);
      fireEvent(suggestion, spaceEvent);

      expect(enterEvent.preventDefault).toHaveBeenCalled();
      expect(spaceEvent.preventDefault).toHaveBeenCalled();
    });
  });
});
