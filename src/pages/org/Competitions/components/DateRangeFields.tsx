import { Calendar } from 'lucide-react';
import React from 'react';

import styles from './Stages.module.scss';

export interface DateRangeFieldsProps {
  readonly idPrefix: string;
  readonly startLabel: string;
  readonly finishLabel: string;
  readonly dateStart: string;
  readonly dateFinish: string;
  readonly onChangeStart: (value: string) => void;
  readonly onChangeFinish: (value: string) => void;
  readonly onClearError?: () => void;
  readonly dateError: string | null;
}

export const DateRangeFields: React.FC<DateRangeFieldsProps> = ({
  idPrefix,
  startLabel,
  finishLabel,
  dateStart,
  dateFinish,
  onChangeStart,
  onChangeFinish,
  onClearError,
  dateError,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={styles.fieldGroup}>
          <label htmlFor={`${idPrefix}-date-start`} className={styles.fieldLabel}>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span>{startLabel}</span>
              <span className={styles.requiredAsterisk}>*</span>
            </span>
          </label>
          <input
            id={`${idPrefix}-date-start`}
            type="datetime-local"
            value={dateStart}
            onChange={(e) => {
              onChangeStart(e.target.value);
              if (dateError && onClearError) onClearError();
            }}
            className={`${styles.input} ${dateError ? styles.inputInvalid : ''}`}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor={`${idPrefix}-date-finish`} className={styles.fieldLabel}>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span>{finishLabel}</span>
              <span className={styles.requiredAsterisk}>*</span>
            </span>
          </label>
          <input
            id={`${idPrefix}-date-finish`}
            type="datetime-local"
            value={dateFinish}
            onChange={(e) => {
              onChangeFinish(e.target.value);
              if (dateError && onClearError) onClearError();
            }}
            className={`${styles.input} ${dateError ? styles.inputInvalid : ''}`}
          />
        </div>
      </div>
      {dateError && <span className={styles.fieldError}>{dateError}</span>}
    </>
  );
};

export default DateRangeFields;
