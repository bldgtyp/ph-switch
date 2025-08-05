import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConverterAppWithSuggestions from './ConverterAppWithSuggestions';

describe('ConverterAppWithSuggestions Integration', () => {
  test('displays unit suggestions when typing', async () => {
    render(<ConverterAppWithSuggestions />);

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 m');

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('meter')).toBeInTheDocument();
      expect(screen.getByText('mile')).toBeInTheDocument();
    });
  });

  test('shows target unit suggestions after source unit', async () => {
    render(<ConverterAppWithSuggestions />);

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 meter as f');

    // Wait for target suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('foot')).toBeInTheDocument();
    });
  });

  test('completes conversion with unit auto-completion', async () => {
    render(<ConverterAppWithSuggestions />);

    const textArea = screen.getByRole('textbox');

    // Type partial unit
    await userEvent.type(textArea, '13 m');

    // Wait for suggestions and click meter
    await waitFor(() => {
      expect(screen.getByText('meter')).toBeInTheDocument();
    });

    // Click on meter suggestion
    const meterSuggestion = screen.getByText('meter');
    await userEvent.click(meterSuggestion);

    // Complete the conversion
    await userEvent.type(textArea, ' as feet');

    // Wait for conversion result
    await waitFor(
      () => {
        expect(screen.getByText(/42\.65/)).toBeInTheDocument();
        expect(screen.getByText(/ft/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('maintains all existing conversion functionality', async () => {
    render(<ConverterAppWithSuggestions />);

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 meters as feet');

    // Wait for conversion to appear
    await waitFor(
      () => {
        const inputTexts = screen.getAllByText('13 meters as feet');
        expect(inputTexts.length).toBeGreaterThanOrEqual(1);

        expect(screen.getByText(/42\.65/)).toBeInTheDocument();
        expect(screen.getByText(/ft/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('displays error messages for invalid input', async () => {
    render(<ConverterAppWithSuggestions />);

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, 'invalid input');

    // Wait for error to appear
    await waitFor(
      () => {
        const inputTexts = screen.getAllByText('invalid input');
        expect(inputTexts.length).toBeGreaterThanOrEqual(1);

        expect(screen.getByText(/Invalid format/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });
});
