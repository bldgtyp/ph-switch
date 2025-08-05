import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConversionInputWithSuggestions from './ConversionInputWithSuggestions';

describe('ConversionInputWithSuggestions Component', () => {
  const mockOnConversion = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    mockOnConversion.mockClear();
    mockOnError.mockClear();
  });

  test('shows unit suggestions when typing partial unit names', async () => {
    render(
      <ConversionInputWithSuggestions
        onConversion={mockOnConversion}
        onError={mockOnError}
      />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 m');

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('meter')).toBeInTheDocument();
      expect(screen.getByText('mile')).toBeInTheDocument();
    });
  });

  test('hides suggestions when typing space after unit', async () => {
    render(
      <ConversionInputWithSuggestions
        onConversion={mockOnConversion}
        onError={mockOnError}
      />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 meter ');

    // Suggestions should be hidden
    await waitFor(() => {
      expect(screen.queryByText('millimeter')).not.toBeInTheDocument();
    });
  });

  test('shows target unit suggestions after "as" or "to"', async () => {
    render(
      <ConversionInputWithSuggestions
        onConversion={mockOnConversion}
        onError={mockOnError}
      />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 meter as f');

    // Wait for target suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('foot')).toBeInTheDocument();
    });
  });

  test('completes unit when suggestion is clicked', async () => {
    render(
      <ConversionInputWithSuggestions
        onConversion={mockOnConversion}
        onError={mockOnError}
      />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 m');

    // Wait for suggestions and click meter
    await waitFor(() => {
      expect(screen.getByText('meter')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('meter'));

    // Check that the input was updated
    expect(textArea).toHaveValue('13 meter');
  });

  test('processes completed conversion', async () => {
    render(
      <ConversionInputWithSuggestions
        onConversion={mockOnConversion}
        onError={mockOnError}
      />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 meters as feet');

    await waitFor(
      () => {
        expect(mockOnConversion).toHaveBeenCalledWith([
          expect.objectContaining({
            lineNumber: 0,
            input: '13 meters as feet',
            parsed: expect.objectContaining({
              value: 13,
              sourceUnit: 'meters',
              targetUnit: 'feet',
              isValid: true,
            }),
          }),
        ]);
      },
      { timeout: 1000 }
    );
  });

  test('handles keyboard navigation (future enhancement)', async () => {
    render(
      <ConversionInputWithSuggestions
        onConversion={mockOnConversion}
        onError={mockOnError}
      />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 m');

    // Wait for suggestions
    await waitFor(() => {
      expect(screen.getByText('meter')).toBeInTheDocument();
    });

    // TODO: Implement arrow key navigation in future iteration
    // For now, just verify suggestions are shown
    expect(screen.getByText('meter')).toBeInTheDocument();
  });
});
