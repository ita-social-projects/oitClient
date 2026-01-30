import '@testing-library/jest-dom';
import {vi} from 'vitest';

vi.mock('*.svg', () => ({ default: 'mocked.svg' }));