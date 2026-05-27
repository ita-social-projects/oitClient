export interface NewsDto {
  title: string;
  content: string;
  imageUrl?: string;
  publishNow: boolean;
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

export interface FileResponseDto {
  id: number;
  storageKey: string;
  mimeType: string;
  size: number;
  url: string;
}