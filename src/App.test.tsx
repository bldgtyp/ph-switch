import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PH-Switch app', () => {
  render(<App />);
  const appTitle = screen.getByText(/PH-Switch/i);
  expect(appTitle).toBeInTheDocument();

  const subtitle = screen.getByText(
    /Unit conversion tool for Passive House professionals/i
  );
  expect(subtitle).toBeInTheDocument();
});
