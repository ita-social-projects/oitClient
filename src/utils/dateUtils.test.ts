import { describe, expect, it } from 'vitest';

import { toLocalDatetimeInputValue } from './dateUtils';

describe('toLocalDatetimeInputValue', () => {
  it('returns empty string when input is null, undefined, or empty', () => {
    expect(toLocalDatetimeInputValue(null)).toBe('');
    expect(toLocalDatetimeInputValue(undefined)).toBe('');
    expect(toLocalDatetimeInputValue('')).toBe('');
  });

  it('returns empty string for invalid date strings', () => {
    expect(toLocalDatetimeInputValue('invalid-date')).toBe('');
  });

  it('formats valid ISO date strings to YYYY-MM-DDTHH:mm format', () => {
    const input = '2026-10-15T14:30:00Z';
    const result = toLocalDatetimeInputValue(input);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    const date = new Date(input);
    const expectedYear = date.getFullYear();
    const expectedMonth = String(date.getMonth() + 1).padStart(2, '0');
    const expectedDay = String(date.getDate()).padStart(2, '0');
    const expectedHours = String(date.getHours()).padStart(2, '0');
    const expectedMinutes = String(date.getMinutes()).padStart(2, '0');
    expect(result).toBe(`${expectedYear}-${expectedMonth}-${expectedDay}T${expectedHours}:${expectedMinutes}`);
  });
});
