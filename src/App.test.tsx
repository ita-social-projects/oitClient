import { render, screen } from '@testing-library/react';

import App from './App.tsx';

describe('App', () => {
  test('should create', () => {
    render(<App />);
    expect(screen.getByText('Click on', { exact: false })).toBeInTheDocument();
  });
});
