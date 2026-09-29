export type StageScope =
  | 'CITY'
  | 'DISTRICT'
  | 'REGIONAL'
  | 'NATIONAL'
  | 'FOREIGN'
  | 'OPEN';

export const STAGE_SCOPES: StageScope[] = [
  'CITY',
  'DISTRICT',
  'REGIONAL',
  'NATIONAL',
  'FOREIGN',
  'OPEN',
];

export type StageStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';

export const STAGE_STATUSES: StageStatus[] = [
  'SCHEDULED',
  'IN_PROGRESS',
  'FINISHED',
  'CANCELLED',
];

export interface StageResponse {
  id: number;
  competitionId: number;
  title: string;
  description: string | null;
  dateStart: string; // ISO-8601
  dateFinish: string; // ISO-8601
  sortPosition: number;
  scope: StageScope;
  status: StageStatus;
  version: number;
}

export interface CreateStageRequest {
  title: string;
  description?: string | null;
  dateStart: string; // ISO-8601
  dateFinish: string; // ISO-8601
  scope: StageScope;
}

export interface UpdateStageRequest {
  title: string;
  description?: string | null;
  dateStart: string; // ISO-8601
  dateFinish: string; // ISO-8601
  scope: StageScope;
  sortPosition?: number;
  version: number;
}

export interface ChangeStageStatusRequest {
  status: StageStatus;
  version: number;
}

export interface StageTourItem {
  id: number;
  stageId: number;
  title: string;
  description?: string | null;
  location?: string | null;
  executionStatus: string;
  sortPosition: number;
  version: number;
}

export interface StageTreeNode {
  stage: StageResponse;
  tours: StageTourItem[];
}

export interface CompetitionTreeResponse {
  competition: {
    id: number;
    title: string;
    competitionStatus: string;
    version: number;
  };
  stages: StageTreeNode[];
}
