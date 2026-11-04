import { toast } from 'react-toastify';

export interface BatchResponseLike {
  succeeded?: unknown[];
  failed?: unknown[];
}

export type BatchTranslateFn = (
  key: string,
  options?: { succeeded: number; failed: number } & Record<string, unknown>
) => string;

/**
 * Displays a toast notification (success, warning, or error) based on batch operation outcome.
 *
 * - `failedCount === 0`: `toast.success`
 * - `succeededCount > 0`: `toast.warning` (partial success)
 * - otherwise: `toast.error` (all failed)
 */
export const showBatchToast = (
  res: BatchResponseLike,
  t: BatchTranslateFn,
  summaryKey: string
): void => {
  const succeededCount = res?.succeeded?.length || 0;
  const failedCount = res?.failed?.length || 0;
  const message = t(summaryKey, {
    succeeded: succeededCount,
    failed: failedCount,
  });

  if (failedCount === 0) {
    toast.success(message);
  } else if (succeededCount > 0) {
    toast.warning(message);
  } else {
    toast.error(message);
  }
};

