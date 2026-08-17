export interface TaskDto {
  id: number;
  title: string;
  description: string;
  createdBy: number;
  files: FileDetailsDTO[];
  createdByEmail: string;
  ownerIds: number[];
}

export interface TaskResponse {
  content: TaskDto[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface FileDetailsDTO {
  id: number;
  originalFilename: string;
  mimeType: string;
  size: number;
  fileRole: string;
  url: string;
}

export interface AddOwnerRequestDTO {
  newOwnerEmail: string;
}

export interface RemoveOwnerRequestDTO {
  ownerEmail: string;
}