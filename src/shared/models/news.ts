export interface NewsDto {
  title: string;
  content: string;
  imageUrl?: string;
  publishNow: boolean;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  publicationDate: string;
}
