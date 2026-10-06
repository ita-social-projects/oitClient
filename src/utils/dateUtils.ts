/**
 * Formats an ISO date string to `YYYY-MM-DDTHH:mm` format suitable for
 * HTML5 `<input type="datetime-local" />`.
 */
export const toLocalDatetimeInputValue = (isoStr?: string | null): string => {
  if (!isoStr) return '';
  try {
    const date = new Date(isoStr);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};
