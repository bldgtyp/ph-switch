import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PH-Switch unit converter interface', () => {
  render(<App />);

  // Check header elements
  const titleElement = screen.getByText(/PH-Switch Unit Converter/i);
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
