export interface NewsDto {
  title: string;
  content: string;
  imageUrl?: string;
  publishNow: boolean;
}

export interface NewsItem {
  id: number;
  title: string;
  contentPreview: string;
  publishedAt: string;
}

export interface NewsResponse {
  content: NewsItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}