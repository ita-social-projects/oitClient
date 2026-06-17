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

export interface NewsCardItem extends NewsItem {
  contentPreview: string;
}

export interface NewsDetailItem extends NewsItem {
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
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

export interface FileDto {
  id: number;
  storageKey: string;
  mimeType: string;
  size: number;
  url: string;
}