import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './App.tsx';

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
