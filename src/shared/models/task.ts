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
