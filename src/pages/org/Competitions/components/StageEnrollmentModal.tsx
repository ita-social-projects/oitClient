import { DialogContent, DialogTitle, Modal, ModalClose, ModalDialog } from '@mui/joy';
import type { StageResponse } from '@shared/models/stage';
import { FileText, Mail, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import StageApplicationsTab from './StageApplicationsTab';
import StageInvitationsTab from './StageInvitationsTab';
import StageParticipantsTab from './StageParticipantsTab';
import StageScopeBadge from './StageScopeBadge';

export type EnrollmentTab = 'applications' | 'invitations' | 'participants';

export interface StageEnrollmentModalProps {
  readonly isOpen: boolean;
  readonly stage: StageResponse;
  readonly isArchived?: boolean;
  readonly onClose: () => void;
}

export const StageEnrollmentModal: React.FC<StageEnrollmentModalProps> = ({
  isOpen,
  stage,
  isArchived = false,
  onClose,
}) => {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState<EnrollmentTab>('applications');

  const tabs: { id: EnrollmentTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'applications',
      label: t('enrollment.tabs.applications'),
      icon: <FileText size={16} />,
    },
    {
      id: 'invitations',
      label: t('enrollment.tabs.invitations'),
      icon: <Mail size={16} />,
    },
    {
      id: 'participants',
      label: t('enrollment.tabs.participants'),
      icon: <Users size={16} />,
    },
  ];

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog
        layout="center"
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
      >
        <ModalClose aria-label="close" />
        <DialogTitle className="flex flex-col gap-2 border-b pb-4">
          <div className="flex items-center gap-3 flex-wrap pr-8">
            <span className="text-xl font-bold text-gray-900">
              {t('enrollment.modalTitle', { stageTitle: stage.title })}
            </span>
            <StageScopeBadge scope={stage.scope} />
          </div>

          {/* Navigation Tabs */}
          <div
            role="tablist"
            className="flex items-center gap-2 border-b border-gray-200 -mb-4 pt-2 overflow-x-auto"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-emerald-600 text-emerald-600 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </DialogTitle>

        <DialogContent className="pt-6">
          <div role="tabpanel" className="w-full min-h-[300px]">
            {activeTab === 'applications' && (
              <div data-testid="tab-applications">
                <StageApplicationsTab
                  competitionId={stage.competitionId}
                  stageId={stage.id}
                  isArchived={isArchived}
                />
              </div>
            )}
            {activeTab === 'invitations' && (
              <div data-testid="tab-invitations">
                <StageInvitationsTab
                  competitionId={stage.competitionId}
                  stageId={stage.id}
                  isArchived={isArchived}
                />
              </div>
            )}
            {activeTab === 'participants' && (
              <div data-testid="tab-participants">
                <StageParticipantsTab
                  competitionId={stage.competitionId}
                  stageId={stage.id}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default StageEnrollmentModal;
