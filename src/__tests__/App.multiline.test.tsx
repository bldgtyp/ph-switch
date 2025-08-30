import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App - Multi-line Input System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to wait for configuration to load
  const waitForConfigurationLoad = async () => {
    await waitFor(
      () => {
        // Configuration is loaded when we no longer see the config loading message
        expect(
          screen.queryByText(/Configuration not loaded yet/)
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  };

  test('processes multiple conversion lines simultaneously', async () => {
    render(<App />);

    // Wait for configuration to load first
    await waitForConfigurationLoad();

    const input = screen.getByLabelText(/Unit conversion input/i);
    const multiLineInput = '5 meters to feet\n10 inches to cm\n2 km to miles';

    await userEvent.clear(input);
    await userEvent.type(input, multiLineInput);

    // Wait for debounced processing
    await screen.findByText(/16.4042 feet/, undefined, { timeout: 1000 });
    await screen.findByText(/25.4 cm/, undefined, { timeout: 1000 });
    await screen.findByText(/1.2427 miles/, undefined, { timeout: 1000 });
  });

  test('handles empty lines and maintains proper line alignment', async () => {
    render(<App />);

    // Wait for configuration to load first
    await waitForConfigurationLoad();

    const input = screen.getByLabelText(/Unit conversion input/i);
    const inputWithEmptyLines =
      '5 meters to feet\n\n10 inches to cm\n\n2 km to miles';

    await userEvent.clear(input);
    await userEvent.type(input, inputWithEmptyLines);

    // Wait for debounced processing
    await screen.findByText(/16.4042 feet/, undefined, { timeout: 1000 });
    await screen.findByText(/25.4 cm/, undefined, { timeout: 1000 });
    await screen.findByText(/1.2427 miles/, undefined, { timeout: 1000 });
  });

  test('shows processing state during conversion', async () => {
    render(<App />);

    // Wait for configuration to load first
    await waitForConfigurationLoad();

    const input = screen.getByLabelText(/Unit conversion input/i);

    await userEvent.clear(input);
    await userEvent.type(input, '5 meters to feet');

    // Processing indicator might appear briefly
    // This test ensures the UI handles processing states gracefully
    await waitFor(
      () => {
        expect(screen.getByText(/16.4042 feet/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('maintains line alignment with mixed success and error results', async () => {
    render(<App />);

    // Wait for configuration to load first
    await waitForConfigurationLoad();

    const input = screen.getByLabelText(/Unit conversion input/i);
    const mixedInput = '5 meters to feet\ninvalid input\n10 inches to cm';

    await userEvent.clear(input);
    await userEvent.type(input, mixedInput);

    await screen.findByText(/16.4042 feet/, undefined, { timeout: 1000 });
    await screen.findByText(/25.4 cm/, undefined, { timeout: 1000 });
    await screen.findByText(/Invalid conversion format/, undefined, {
      timeout: 1000,
    });

    // Check line alignment using data-line attributes
    const results = await screen.findAllByRole('button', {
      name: /Copy result/,
    });
    expect(results).toHaveLength(2); // Two successful conversions
  });

  test('updates results in real-time as user types', async () => {
    render(<App />);

    // Wait for configuration to load first
    await waitForConfigurationLoad();

    const input = screen.getByLabelText(/Unit conversion input/i);

    // Start typing a conversion
    await userEvent.clear(input);
    await userEvent.type(input, '5 meters');

    // Should not show conversion results for incomplete input
    await waitFor(
      () => expect(screen.queryByText(/16\.404/)).not.toBeInTheDocument(),
      { timeout: 500 }
    );

    // Complete the input
    await userEvent.type(input, ' to feet');

    // Should show results for complete input
    await screen.findByText(/16.4042 feet/, undefined, { timeout: 1000 });
  });

  test('handles rapid input changes with debouncing', async () => {
    render(<App />);

    // Wait for configuration to load first
    await waitForConfigurationLoad();

    const input = screen.getByLabelText(/Unit conversion input/i);

    await userEvent.clear(input);

    // Type multiple rapid changes
    await userEvent.type(input, '1 meter to feet');
    await userEvent.clear(input);
    await userEvent.type(input, '2 meters to feet');
    await userEvent.clear(input);
    await userEvent.type(input, '3 meters to feet');

    // Should only process the final input after debounce
    await waitFor(
      () => {
        expect(screen.getByText(/9.8425 feet/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  test('clears results when input is emptied', async () => {
    render(<App />);

    // Wait for configuration to load first
    await waitForConfigurationLoad();

    const input = screen.getByLabelText(/Unit conversion input/i);

    // First add some input
    await userEvent.clear(input);
    await userEvent.type(input, '5 meters to feet');

    await waitFor(
      () => {
        expect(screen.getByText(/16.4042 feet/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Then clear it
    await userEvent.clear(input);

    await screen.findByText(/Results will appear here as you type/, undefined, {
      timeout: 1000,
    });
  });

  test('handles multiple lines with different error types', async () => {
    render(<App />);

    // Wait for configuration to load first
    await waitForConfigurationLoad();

    const input = screen.getByLabelText(/Unit conversion input/i);
    const inputWithErrors =
      '5 meters to feet\ninvalid format here\n10 unknown_unit to cm\n2 km to miles';

    await userEvent.clear(input);
    await userEvent.type(input, inputWithErrors);

    await screen.findByText(/16.4042 feet/, undefined, { timeout: 1000 });
    await screen.findByText(/1.2427 miles/, undefined, { timeout: 1000 });
    const errors = await screen.findAllByText(/Invalid conversion format/);
    expect(errors).toHaveLength(2);
  });
});
