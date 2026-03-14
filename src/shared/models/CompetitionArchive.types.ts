export type CompetitionLevel = 'CITY' | 'REGION' | 'NATIONAL' | 'OPEN';

export type CompetitionStatus = 'INCOMING' | 'INPROGRESS' | 'FINISED' | 'ARCHIVED';

export interface Competition {
  id: number;
  name: string;
  year: number;
  level: CompetitionLevel;
  competitionStatus: CompetitionStatus;
  startAt: string;
  entAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  competitionId: number;
}

export interface CompetitionFilters {
  years: number[];
  levels: CompetitionLevel[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}
