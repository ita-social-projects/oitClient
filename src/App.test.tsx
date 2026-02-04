import { render, screen } from '@testing-library/react';

import App from './App.tsx';
import { MemoryRouter } from 'react-router-dom';

describe('App', () => {
  test('should create', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('Home', { exact: false })).toBeInTheDocument();
  });
});
