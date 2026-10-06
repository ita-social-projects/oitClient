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

export interface DateRangeValidationParams {
  dateStart: string;
  dateFinish: string;
  parentDateStart: string;
  parentDateFinish: string;
  emptyError: string;
  finishBeforeStartError: string;
  outOfBoundsError: (bounds: { start: string; finish: string }) => string;
}

/**
 * Validates that start and finish dates are provided, finish is after start,
 * and the range is within the parent entity's date boundaries.
 */
export const validateDateRange = (params: DateRangeValidationParams): string | null => {
  if (!params.dateStart || !params.dateFinish) {
    return params.emptyError;
  }

  const start = new Date(params.dateStart);
  const finish = new Date(params.dateFinish);
  const parentStart = new Date(params.parentDateStart);
  const parentFinish = new Date(params.parentDateFinish);

  if (finish <= start) {
    return params.finishBeforeStartError;
  }

  if (start < parentStart || finish > parentFinish) {
    return params.outOfBoundsError({
      start: parentStart.toLocaleDateString(),
      finish: parentFinish.toLocaleDateString(),
    });
  }

  return null;
};
