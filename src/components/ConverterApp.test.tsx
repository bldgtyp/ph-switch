import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConverterApp from './ConverterApp';

describe('ConverterApp Integration', () => {
  test('renders input and result components', () => {
    render(<ConverterApp />);

    // Check that input textarea is present
    const textArea = screen.getByPlaceholderText(/13 meters as feet/i);
    expect(textArea).toBeInTheDocument();

    // Check that result container is present
    const resultContainer = screen.getByTestId('conversion-result');
    expect(resultContainer).toBeInTheDocument();
  });

  test('displays conversion results when valid input is entered', async () => {
    render(<ConverterApp />);

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 meters as feet');

    // Wait for conversion to appear
    await waitFor(
      () => {
        // Check that the text appears in both input and result areas
        const inputTexts = screen.getAllByText('13 meters as feet');
        expect(inputTexts.length).toBeGreaterThanOrEqual(1);

        // Check for the conversion result specifically
        expect(screen.getByText(/42\.65/)).toBeInTheDocument();
        expect(screen.getByText(/ft/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('displays error messages for invalid input', async () => {
    render(<ConverterApp />);

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, 'invalid input');

    // Wait for error to appear
    await waitFor(
      () => {
        // Check that the text appears in both input and result areas
        const inputTexts = screen.getAllByText('invalid input');
        expect(inputTexts.length).toBeGreaterThanOrEqual(1);

        // Check for the error message specifically
        expect(screen.getByText(/Invalid format/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('handles mixed valid and invalid input', async () => {
    render(<ConverterApp />);

    const textArea = screen.getByRole('textbox');
    await userEvent.type(
      textArea,
      '13 meters as feet{enter}invalid{enter}5 km to miles'
    );

    // Wait for both results and errors to appear
    await waitFor(
      () => {
        // Valid conversions
        expect(screen.getByText('13 meters as feet')).toBeInTheDocument();
        expect(screen.getByText(/42\.65 ft/)).toBeInTheDocument();
        expect(screen.getByText('5 km to miles')).toBeInTheDocument();
        expect(screen.getByText(/3\.1\d+ mi/)).toBeInTheDocument();

        // Error
        expect(screen.getByText('invalid')).toBeInTheDocument();
        expect(screen.getByText(/Invalid format/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('shows initial state message when no input', () => {
    render(<ConverterApp />);

    expect(
      screen.getByText('Enter a conversion above to see results...')
    ).toBeInTheDocument();
  });

  test('clears results when input is cleared', async () => {
    render(<ConverterApp />);

    const textArea = screen.getByRole('textbox');

    // Add some input
    await userEvent.type(textArea, '13 meters as feet');

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText('13 meters as feet')).toBeInTheDocument();
    });

    // Clear input
    await userEvent.clear(textArea);

    // Wait for results to clear
    await waitFor(
      () => {
        expect(
          screen.getByText('Enter a conversion above to see results...')
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });
});
