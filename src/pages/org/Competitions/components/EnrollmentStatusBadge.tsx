import type { RequestStatus } from '@shared/models/enrollment';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface EnrollmentStatusBadgeProps {
  readonly status: RequestStatus;
}

const STATUS_STYLE_MAP: Record<RequestStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const EnrollmentStatusBadge: React.FC<EnrollmentStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation('admin');
  const styleClass = STATUS_STYLE_MAP[status] || STATUS_STYLE_MAP.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{t(`enrollment.status.${status}`, { defaultValue: status })}</span>
    </span>
  );
};

export default EnrollmentStatusBadge;

