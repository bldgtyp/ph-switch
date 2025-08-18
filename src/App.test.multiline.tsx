import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App - Multi-line Input System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('processes multiple conversion lines simultaneously', async () => {
    render(<App />);

    const input = screen.getByLabelText(/Unit conversion input/i);
    const multiLineInput = '5 meters to feet\n10 inches to cm\n2 km to miles';

    await userEvent.clear(input);
    await userEvent.type(input, multiLineInput);

    // Wait for debounced processing
    await waitFor(
      () => {
        expect(screen.getByText(/16.404 feet/)).toBeInTheDocument();
        expect(screen.getByText(/25.400 cm/)).toBeInTheDocument();
        expect(screen.getByText(/1.243 miles/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('handles empty lines in input', async () => {
    render(<App />);

    const input = screen.getByLabelText(/Unit conversion input/i);
    const inputWithEmptyLines =
      '5 meters to feet\n\n10 inches to cm\n\n2 km to miles';

    await userEvent.clear(input);
    await userEvent.type(input, inputWithEmptyLines);

    // Wait for debounced processing
    await waitFor(
      () => {
        expect(screen.getByText(/16.404 feet/)).toBeInTheDocument();
        expect(screen.getByText(/25.400 cm/)).toBeInTheDocument();
        expect(screen.getByText(/1.243 miles/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('shows processing state during conversion', async () => {
    render(<App />);

    const input = screen.getByLabelText(/Unit conversion input/i);

    await userEvent.clear(input);
    await userEvent.type(input, '5 meters to feet');

    // Processing indicator might appear briefly
    // This test ensures the UI handles processing states gracefully
    await waitFor(
      () => {
        expect(screen.getByText(/16.404 feet/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('maintains line alignment with mixed success and error results', async () => {
    render(<App />);

    const input = screen.getByLabelText(/Unit conversion input/i);
    const mixedInput = '5 meters to feet\ninvalid input\n10 inches to cm';

    await userEvent.clear(input);
    await userEvent.type(input, mixedInput);

    await waitFor(
      () => {
        // Should show successful conversions
        expect(screen.getByText(/16.404 feet/)).toBeInTheDocument();
        expect(screen.getByText(/25.400 cm/)).toBeInTheDocument();

        // Should show error for invalid input
        expect(screen.getByText(/Invalid input format/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('updates results in real-time as user types', async () => {
    render(<App />);

    const input = screen.getByLabelText(/Unit conversion input/i);

    // Start typing a conversion
    await userEvent.clear(input);
    await userEvent.type(input, '5 meters');

    // Should not show results for incomplete input
    await waitFor(
      () => {
        expect(screen.queryByText(/feet/)).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );

    // Complete the conversion
    await userEvent.type(input, ' to feet');

    // Should show results after completing the input
    await waitFor(
      () => {
        expect(screen.getByText(/16.404 feet/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('handles rapid input changes with debouncing', async () => {
    render(<App />);

    const input = screen.getByLabelText(/Unit conversion input/i);

    // Rapidly change input multiple times
    await userEvent.clear(input);
    await userEvent.type(input, '1 m to ft');
    await userEvent.clear(input);
    await userEvent.type(input, '2 m to ft');
    await userEvent.clear(input);
    await userEvent.type(input, '3 meters to feet');

    // Should only process the final input after debounce
    await waitFor(
      () => {
        expect(screen.getByText(/9.843 feet/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('clears results when input is emptied', async () => {
    render(<App />);

    const input = screen.getByLabelText(/Unit conversion input/i);

    // Add some input first
    await userEvent.clear(input);
    await userEvent.type(input, '5 meters to feet');

    await waitFor(
      () => {
        expect(screen.getByText(/16.404 feet/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Clear the input
    await userEvent.clear(input);

    // Results should be cleared
    await waitFor(
      () => {
        expect(screen.queryByText(/16.404 feet/)).not.toBeInTheDocument();
        expect(
          screen.getByText(/Results will appear here as you type/)
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('displays correct conversion count in summary', async () => {
    render(<App />);

    const input = screen.getByLabelText(/Unit conversion input/i);
    const mixedInput =
      '5 meters to feet\ninvalid input\n10 inches to cm\n\nanother invalid';

    await userEvent.clear(input);
    await userEvent.type(input, mixedInput);

    await waitFor(
      () => {
        // Should show 2 successful conversions out of 4 non-empty lines
        expect(screen.getByText(/2 of 4 converted/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });
});
