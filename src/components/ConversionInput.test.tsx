import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConversionInput from './ConversionInput';

describe('ConversionInput Component', () => {
  const mockOnConversion = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with placeholder text', () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByPlaceholderText(/13 meters as feet/i);
    expect(textArea).toBeInTheDocument();
  });

  test('handles multi-line input', async () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 meters as feet{enter}5 km to miles');

    expect(textArea).toHaveValue('13 meters as feet\n5 km to miles');
  });

  test('calls onConversion with valid input', async () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 meters as feet');

    // Wait for debounced input processing
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

  test('calls onError with invalid input', async () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, 'invalid input');

    await waitFor(
      () => {
        expect(mockOnError).toHaveBeenCalledWith([
          expect.objectContaining({
            lineNumber: 0,
            input: 'invalid input',
            error: expect.stringContaining('Invalid format'),
          }),
        ]);
      },
      { timeout: 1000 }
    );
  });

  test('processes multiple lines independently', async () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(
      textArea,
      '13 meters as feet{enter}invalid{enter}5 km to miles'
    );

    await waitFor(
      () => {
        expect(mockOnConversion).toHaveBeenCalledWith([
          expect.objectContaining({
            lineNumber: 0,
            input: '13 meters as feet',
            parsed: expect.objectContaining({ isValid: true }),
          }),
          expect.objectContaining({
            lineNumber: 2,
            input: '5 km to miles',
            parsed: expect.objectContaining({ isValid: true }),
          }),
        ]);

        expect(mockOnError).toHaveBeenCalledWith([
          expect.objectContaining({
            lineNumber: 1,
            input: 'invalid',
            error: expect.stringContaining('Invalid format'),
          }),
        ]);
      },
      { timeout: 1000 }
    );
  });

  test('handles empty lines gracefully', async () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(
      textArea,
      '13 meters as feet{enter}{enter}5 km to miles'
    );

    await waitFor(
      () => {
        expect(mockOnConversion).toHaveBeenCalledWith([
          expect.objectContaining({
            lineNumber: 0,
            input: '13 meters as feet',
          }),
          expect.objectContaining({ lineNumber: 2, input: '5 km to miles' }),
        ]);
      },
      { timeout: 1000 }
    );
  });

  test('calls onError with invalid input', async () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, 'invalid input');

    await waitFor(
      () => {
        expect(mockOnError).toHaveBeenCalledWith([
          expect.objectContaining({
            lineNumber: 0,
            input: 'invalid input',
            error: expect.stringContaining('Invalid format'),
          }),
        ]);
      },
      { timeout: 1000 }
    );
  });

  test('processes multiple lines independently', async () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(textArea, '13 meters as feet\ninvalid\n5 km to miles');

    await waitFor(
      () => {
        expect(mockOnConversion).toHaveBeenCalledWith([
          expect.objectContaining({
            lineNumber: 0,
            input: '13 meters as feet',
            parsed: expect.objectContaining({ isValid: true }),
          }),
          expect.objectContaining({
            lineNumber: 2,
            input: '5 km to miles',
            parsed: expect.objectContaining({ isValid: true }),
          }),
        ]);

        expect(mockOnError).toHaveBeenCalledWith([
          expect.objectContaining({
            lineNumber: 1,
            input: 'invalid',
            error: expect.stringContaining('Invalid format'),
          }),
        ]);
      },
      { timeout: 1000 }
    );
  });

  test('handles empty lines gracefully', async () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByRole('textbox');
    await userEvent.type(
      textArea,
      '13 meters as feet{enter}{enter}5 km to miles'
    );

    await waitFor(
      () => {
        expect(mockOnConversion).toHaveBeenCalledWith([
          expect.objectContaining({
            lineNumber: 0,
            input: '13 meters as feet',
          }),
          expect.objectContaining({ lineNumber: 2, input: '5 km to miles' }),
        ]);
      },
      { timeout: 1000 }
    );
  });

  test('supports keyboard navigation', () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByRole('textbox');

    // Test that textarea is focusable
    textArea.focus();
    expect(textArea).toHaveFocus();

    // Test tab navigation
    fireEvent.keyDown(textArea, { key: 'Tab' });
    // The component should handle tab appropriately
  });

  test('maintains cursor position during updates', async () => {
    render(
      <ConversionInput onConversion={mockOnConversion} onError={mockOnError} />
    );

    const textArea = screen.getByRole('textbox') as HTMLTextAreaElement;
    await userEvent.type(textArea, '13 meters as feet');

    // Set cursor position to middle of text
    textArea.setSelectionRange(5, 5);
    const initialPosition = textArea.selectionStart;

    // Add more text
    await userEvent.type(textArea, ' extra');

    // Cursor position should be maintained appropriately
    expect(textArea.selectionStart).toBeGreaterThan(initialPosition);
  });
});
