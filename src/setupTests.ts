import '@testing-library/jest-dom';

vi.mock('/vite.svg', () => ({ default: 'mocked.svg' }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { 
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('./i18n', () => ({
  default: {
    t: (key: string) => key,
    exists: () => false,
    language: 'en',
    use: vi.fn().mockReturnThis(),
    init: vi.fn(),
  },
}));
