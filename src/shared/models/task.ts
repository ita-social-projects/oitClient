export type TaskFileRole = 'PROBLEM' | 'REFERENCE' | 'SOLUTION';

export interface TaskFileDto {
  id: number;
  originalFilename: string;
  mimeType: string;
  size: number;
  fileRole: TaskFileRole;
  url: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  files: TaskFileDto[];
  createdBy: number;
  createdByEmail: string;
  ownerIds: number[];
}

export interface TaskListResponse {
  content: TaskItem[];
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

export const TASK_ALLOWED_EXTENSIONS = ['.docx', '.xlsx', '.pptx', '.accdb'];
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

