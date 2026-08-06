export interface NewsDto {
  title: string;
  content: string;
  publishNow: boolean;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  publishNow: boolean;
  fileIds?: number[];
}

export interface UpdateNewsRequest {
  id: number;
  title: string;
  content: string;
  publishNow: boolean;
  fileIds?: number[];
  removedFileIds?: number[];
}

export interface NewsItem {
  id: number;
  title: string;
  publishedAt: string;
}

export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export const NEWS_STATUSES: NewsStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export interface NewsCardItem extends NewsItem {
  contentPreview: string;
  status: NewsStatus;
}

export interface NewsAdminItem extends NewsItem {
  contentPreview: string;
  status: NewsStatus;
  createdAt: string;
  archivedAt: string | null;
}

export interface NewsDetailItem extends NewsItem {
  content: string;
  status: NewsStatus;
  fileIds?: number[];
}

export interface NewsResponse {
  content: NewsCardItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface NewsAdminResponse {
  content: NewsAdminItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface FileDto {
  id: number;
  storageKey: string;
  mimeType: string;
  size: number;
  url: string;
}