import { axiosInstance } from '@shared/api/axiosInstance';
import type {
  ChangeStageStatusRequest,
  CompetitionTreeResponse,
  CreateStageRequest,
  StageResponse,
  UpdateStageRequest,
} from '@shared/models/stage';

export const stageService = {
  getCompetitionTree: async (competitionId: number): Promise<CompetitionTreeResponse> => {
    const { data } = await axiosInstance.get<CompetitionTreeResponse>(
      `/api/v1/competitions/${competitionId}/tree`
    );
    return data;
  },

  getStages: async (competitionId: number): Promise<StageResponse[]> => {
    const { data } = await axiosInstance.get<StageResponse[]>(
      `/api/v1/competitions/${competitionId}/stages`
    );
    return data;
  },

  getStageById: async (stageId: number): Promise<StageResponse> => {
    const { data } = await axiosInstance.get<StageResponse>(`/api/v1/stages/${stageId}`);
    return data;
  },

  createStage: async (
    competitionId: number,
    payload: CreateStageRequest
  ): Promise<StageResponse> => {
    const { data } = await axiosInstance.post<StageResponse>(
      `/api/v1/competitions/${competitionId}/stages`,
      payload
    );
    return data;
  },

  updateStage: async (
    competitionId: number,
    stageId: number,
    payload: UpdateStageRequest
  ): Promise<StageResponse> => {
    const { data } = await axiosInstance.put<StageResponse>(
      `/api/v1/competitions/${competitionId}/stages/${stageId}`,
      payload
    );
    return data;
  },

  changeStageStatus: async (
    competitionId: number,
    stageId: number,
    payload: ChangeStageStatusRequest
  ): Promise<StageResponse> => {
    const { data } = await axiosInstance.patch<StageResponse>(
      `/api/v1/competitions/${competitionId}/stages/${stageId}/status`,
      payload
    );
    return data;
  },

  deleteStage: async (competitionId: number, stageId: number): Promise<void> => {
    await axiosInstance.delete(`/api/v1/competitions/${competitionId}/stages/${stageId}`);
  },
};
