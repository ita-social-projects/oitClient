/**
 * Normalizes rich text spaces by converting HTML non-breaking space entities (&nbsp;)
 * and Unicode non-breaking spaces (\u00A0) into standard breakable spaces.
 * This prevents unbroken character runs from causing unwanted mid-word breaks across lines.
 */
export const normalizeSpaces = (text?: string | null): string => {
  if (!text) return '';
  return text.replace(/&nbsp;|\u00A0/g, ' ');
};
