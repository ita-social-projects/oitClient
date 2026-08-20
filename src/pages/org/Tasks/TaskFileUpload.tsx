import type { FileDetailsDTO, TaskFileRole, PendingFile } from '@shared/models/task.ts';
import {
  TASK_ALLOWED_EXTENSIONS,
  TASK_FILE_ROLE_OPTIONS,
  TASK_MAX_BATCH_SIZE,
  TASK_MAX_FILE_SIZE,
  getAllowedExtensionsForRole,
} from '@shared/models/task.ts';
import { formatFileSize, makeTempId } from '@utils/taskUtils.ts';
import { AlertTriangle, CloudUpload, FileText, Trash2 } from 'lucide-react';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import styles from './Tasks.module.scss';

type TaskFileUploadProps = {
  readonly existingFiles: FileDetailsDTO[];
  readonly pendingFiles: PendingFile[];
  readonly removedFileIds: number[];
  readonly onExistingRemove: (fileId: number) => void;
  readonly onPendingAdd: (files: PendingFile[]) => void;
  readonly onPendingRemove: (tempId: string) => void;
  readonly onPendingRoleChange: (tempId: string, role: TaskFileRole) => void;
  readonly onExistingRoleChange: (fileId: number, role: TaskFileRole) => void;
};

const getFileExtension = (fileName: string): string =>
  '.' + fileName.split('.').pop()?.toLowerCase();

const isExtensionAllowed = (fileName: string) =>
  TASK_ALLOWED_EXTENSIONS.includes(getFileExtension(fileName));

const isExtensionAllowedForRole = (fileName: string, role: TaskFileRole) =>
  getAllowedExtensionsForRole(role).includes(getFileExtension(fileName));

const TaskFileUpload: React.FC<TaskFileUploadProps> = ({
  existingFiles,
  pendingFiles,
  removedFileIds,
  onExistingRemove,
  onPendingAdd,
  onPendingRemove,
  onPendingRoleChange,
  onExistingRoleChange,
}) => {
  const { t } = useTranslation('admin');
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleExisting = existingFiles.filter(f => !removedFileIds.includes(f.id));

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    const validFiles: PendingFile[] = [];

    for (const file of selected) {
      if (!isExtensionAllowed(file.name)) {
        toast.error(
          t('task-form.invalidExtension', {
            name: file.name,
            allowedExtensions: TASK_ALLOWED_EXTENSIONS.join(', '),
          }),
        );
        continue;
      }
      if (file.size > TASK_MAX_FILE_SIZE) {
        toast.error(t('task-form.fileTooLarge', { name: file.name }));
        continue;
      }
      validFiles.push({ tempId: makeTempId(), file, role: null });
    }

    const currentPendingSize = pendingFiles.reduce((sum, pf) => sum + pf.file.size, 0);
    const newSize = validFiles.reduce((sum, pf) => sum + pf.file.size, 0);
    if (currentPendingSize + newSize > TASK_MAX_BATCH_SIZE) {
      toast.error(t('task-form.batchTooLarge'));
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (validFiles.length > 0) {
      onPendingAdd(validFiles);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const totalFiles = visibleExisting.length + pendingFiles.length;
  const unmarkedCount =
    visibleExisting.filter(f => !f.fileRole).length +
    pendingFiles.filter(f => f.role === null).length;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>{t('task-form.filesSection')}</h3>
        <button
          type="button"
          className="btn-stroked"
          onClick={() => inputRef.current?.click()}
          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
        >
          <i className="fa-solid fa-plus" style={{ marginRight: 6 }} />
          {t('task-form.addFiles')}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={TASK_ALLOWED_EXTENSIONS.join(',')}
        style={{ display: 'none' }}
        onChange={handleFilePick}
      />

      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 16 }}>
        {t('task-form.dropZoneHint', { allowedExtensions: TASK_ALLOWED_EXTENSIONS.join(', ') })}
      </p>

      {totalFiles === 0 ? (
        <button type="button" className={styles.dropZone} onClick={() => inputRef.current?.click()}>
          <CloudUpload size={24} color="#9ca3af" />
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{t('task-form.noFiles')}</p>
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleExisting.map(file => (
            <ExistingFileRow
              key={file.id}
              file={file}
              onRemove={() => onExistingRemove(file.id)}
              onRoleChange={role => onExistingRoleChange(file.id, role)}
            />
          ))}
          {pendingFiles.map(pf => (
            <PendingFileRow
              key={pf.tempId}
              pendingFile={pf}
              onRemove={() => onPendingRemove(pf.tempId)}
              onRoleChange={role => onPendingRoleChange(pf.tempId, role)}
            />
          ))}
        </div>
      )}

      {unmarkedCount > 0 && (
        <div className={styles.warningBanner} style={{ marginTop: 12 }}>
          <AlertTriangle size={16} />
          <span>{t('task-form.unmarkedWarning', { count: unmarkedCount })}</span>
        </div>
      )}
    </section>
  );
};

function ExistingFileRow({
  file,
  onRemove,
  onRoleChange,
}: Readonly<{
  file: FileDetailsDTO;
  onRemove: () => void;
  onRoleChange: (role: TaskFileRole) => void;
}>) {
  const { t } = useTranslation('admin');

  return (
    <div className={styles.attachmentRow}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <FileText size={20} className="shrink-0 text-primary-100" />
        <span className="flex-1 truncate text-sm font-medium min-w-0">{file.originalFilename}</span>
        <span className="shrink-0 text-xs text-gray-400">{formatFileSize(file.size)}</span>
        <button type="button" onClick={onRemove} aria-label="Remove file">
          <Trash2 size={16} className="text-gray-400 hover:text-red-500 transition-colors" />
        </button>
      </div>

      <RolePicker
        currentRole={file.fileRole}
        onChange={onRoleChange}
        fileName={file.originalFilename}
      />

      <p className={file.fileRole ? styles.roleHint : `${styles.roleHint} ${styles.unmarkedHint}`}>
        {file.fileRole
          ? t(TASK_FILE_ROLE_OPTIONS.find(o => o.value === file.fileRole)!.hintKey)
          : t('task-form.chooseRole')}
      </p>
    </div>
  );
}

function PendingFileRow({
  pendingFile,
  onRemove,
  onRoleChange,
}: Readonly<{
  pendingFile: PendingFile;
  onRemove: () => void;
  onRoleChange: (role: TaskFileRole) => void;
}>) {
  const { t } = useTranslation('admin');
  const unmarked = pendingFile.role === null;

  return (
    <div className={`${styles.attachmentRow} ${unmarked ? styles.unmarked : ''}`}>
      <div className="flex items-center gap-3">
        <FileText size={20} className="shrink-0 text-primary-100" />
        <span className="flex-1 truncate text-sm font-medium">{pendingFile.file.name}</span>
        <span className="shrink-0 text-xs text-gray-400">
          {formatFileSize(pendingFile.file.size)}
        </span>
        <button type="button" onClick={onRemove} aria-label="Remove file">
          <Trash2 size={16} className="text-gray-400 hover:text-red-500 transition-colors" />
        </button>
      </div>

      <RolePicker
        currentRole={pendingFile.role}
        onChange={onRoleChange}
        fileName={pendingFile.file.name}
      />

      <p className={unmarked ? `${styles.roleHint} ${styles.unmarkedHint}` : styles.roleHint}>
        {pendingFile.role
          ? t(TASK_FILE_ROLE_OPTIONS.find(o => o.value === pendingFile.role)!.hintKey)
          : t('task-form.chooseRole')}
      </p>
    </div>
  );
}

function RolePicker({
  currentRole,
  onChange,
  fileName,
}: Readonly<{
  currentRole: TaskFileRole | null;
  onChange: (role: TaskFileRole) => void;
  fileName: string;
}>) {
  const { t } = useTranslation('admin');

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
      <span
        style={{
          fontSize: '0.7rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#9ca3af',
        }}
      >
        {t('task-form.markAs')}
      </span>
      <div className={styles.rolePills} style={{ marginTop: 6 }}>
        {TASK_FILE_ROLE_OPTIONS.map(opt => {
          const disabled = !isExtensionAllowedForRole(fileName, opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              className={`${styles.rolePill} ${currentRole === opt.value ? styles.active : ''}`}
              onClick={() => onChange(opt.value)}
              disabled={disabled}
              title={disabled ? t('task-form.extensionNotAllowedForRole') : undefined}
            >
              {t(opt.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TaskFileUpload;
