import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the configuration initializer so tests don't trigger async state updates
jest.mock('./config', () => ({
  initializeConfigurations: async () => true,
}));

test('renders PH-Switch unit converter interface', async () => {
  render(<App />);

  // Wait for app initialization side-effects to settle and check header
  const titleElement = await screen.findByText(/PH-Switch/i);
  expect(titleElement).toBeInTheDocument();

  // Check conversion interface panels using specific selectors
  const inputPanel = screen.getByText('Input');
  expect(inputPanel).toBeInTheDocument();

  const resultsTitle = screen.getByRole('heading', { name: /Results/i });
  expect(resultsTitle).toBeInTheDocument();

  // Check textarea for input
  const textareaElement = screen.getByRole('textbox');
  expect(textareaElement).toBeInTheDocument();
});
