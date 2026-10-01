import type { StageScope } from '@shared/models/stage';
import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './Stages.module.scss';

interface StageScopeBadgeProps {
  readonly scope: StageScope;
}

const SCOPE_STYLE_MAP: Record<StageScope, string> = {
  CITY: styles.scopeCity,
  DISTRICT: styles.scopeDistrict,
  REGIONAL: styles.scopeRegional,
  NATIONAL: styles.scopeNational,
  FOREIGN: styles.scopeForeign,
  OPEN: styles.scopeOpen,
};

export const StageScopeBadge: React.FC<StageScopeBadgeProps> = ({ scope }) => {
  const { t } = useTranslation('admin');
  const styleClass = SCOPE_STYLE_MAP[scope] || styles.scopeCity;

  return (
    <span className={`${styles.scopeBadge} ${styleClass}`}>
      {t(`stages.scope.${scope}`)}
    </span>
  );
};

export default StageScopeBadge;
