export type TaskFileRole = 'PROBLEM' | 'REFERENCE' | 'SOLUTION';

export interface FileDetailsDTO {
  id: number;
  originalFilename: string;
  mimeType: string;
  size: number;
  fileRole: TaskFileRole;
  url: string;
}

export interface TaskDTO {
  id: number;
  title: string;
  description: string;
  files: FileDetailsDTO[];
  createdBy: number;
  createdByEmail: string;
  ownerIds: number[];
}

export interface TaskListResponse {
  content: TaskDTO[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  fileIds: number[];
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  fileIds?: number[];
  removedFileIds?: number[];
}

export interface TaskApiError {
  code: string;
  message: string;
  path: string;
  status: number;
  timestamp: string;
}

export interface PendingFile {
  tempId: string;
  file: File;
  role: TaskFileRole | null;
}

export type ExecutionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'CLOSED' | 'FINISHED' | 'CANCELLED';

export interface LinkedTour {
  tourId: number;
  title: string;
  description: string;
  location: string;
  executionStatus: ExecutionStatus;
}

export const EXECUTION_STATUS_OPTIONS: {
  value: ExecutionStatus;
  labelKey: string;
  color: string;
}[] = [
  { value: 'SCHEDULED', labelKey: 'task-detail.statusScheduled', color: '#6b7280' },
  { value: 'IN_PROGRESS', labelKey: 'task-detail.statusInProgress', color: '#2563eb' },
  { value: 'CLOSED', labelKey: 'task-detail.statusClosed', color: '#d97706' },
  { value: 'FINISHED', labelKey: 'task-detail.statusFinished', color: '#16a34a' },
  { value: 'CANCELLED', labelKey: 'task-detail.statusCancelled', color: '#dc2626' },
];

export const TASK_EXTENSIONS_PROBLEM = [
  '.docx',
  '.xlsx',
  '.pptx',
  '.accdb',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
];

export const TASK_EXTENSIONS_REFERENCE = [
  '.docx',
  '.xlsx',
  '.pptx',
  '.accdb',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.mp4'
];

export const TASK_EXTENSIONS_SOLUTION = ['.docx', '.xlsx', '.pptx', '.accdb'];

export const TASK_ALLOWED_EXTENSIONS = [
  ...new Set([...TASK_EXTENSIONS_PROBLEM, ...TASK_EXTENSIONS_REFERENCE, ...TASK_EXTENSIONS_SOLUTION]),
];

export const getAllowedExtensionsForRole = (role: TaskFileRole): string[] => {
  switch (role) {
    case 'PROBLEM':
      return TASK_EXTENSIONS_PROBLEM;
    case 'REFERENCE':
      return TASK_EXTENSIONS_REFERENCE;
    case 'SOLUTION':
      return TASK_EXTENSIONS_SOLUTION;
  }
};

export const TASK_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per file
export const TASK_MAX_BATCH_SIZE = 50 * 1024 * 1024; // 50 MB total per upload
export const TASK_TITLE_MAX_LENGTH = 255;

export const TASK_FILE_ROLE_OPTIONS: {
  value: TaskFileRole;
  labelKey: string;
  hintKey: string;
}[] = [
  { value: 'PROBLEM', labelKey: 'task-form.roleProblem', hintKey: 'task-form.roleProblemHint' },
  {
    value: 'REFERENCE',
    labelKey: 'task-form.roleReference',
    hintKey: 'task-form.roleReferenceHint',
  },
  { value: 'SOLUTION', labelKey: 'task-form.roleSolution', hintKey: 'task-form.roleSolutionHint' },
];

export interface AddOwnerRequestDTO {
  newOwnerEmail: string;
}

export interface RemoveOwnerRequestDTO {
  ownerEmail: string;
}