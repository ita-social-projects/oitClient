import { axiosInstance } from '@shared/api/axiosInstance';
import type {
  ChangeCompetitionStatusRequest,
  CompetitionListParams,
  CompetitionPageResponse,
  CompetitionResponse,
  CreateCompetitionRequest,
  UpdateCompetitionRequest,
} from '@shared/models/competition';

export const competitionService = {
  getCompetitions: async (params: CompetitionListParams = {}): Promise<CompetitionPageResponse> => {
    const { page = 0, size = 10, title, statuses, dateStart, dateFinish, sort } = params;
    const queryParams: Record<string, string | number> = { page, size };
    if (title) queryParams.title = title;
    if (statuses && statuses.length > 0) queryParams.statuses = statuses.join(',');
    if (dateStart) queryParams.dateStart = dateStart;
    if (dateFinish) queryParams.dateFinish = dateFinish;
    if (sort) queryParams.sort = sort;

    const { data } = await axiosInstance.get<CompetitionPageResponse>('/api/v1/competitions', {
      params: queryParams,
    });
    return data;
  },

  getCompetitionById: async (id: number): Promise<CompetitionResponse> => {
    const { data } = await axiosInstance.get<CompetitionResponse>(`/api/v1/competitions/${id}`);
    return data;
  },

  createCompetition: async (payload: CreateCompetitionRequest): Promise<CompetitionResponse> => {
    const { data } = await axiosInstance.post<CompetitionResponse>('/api/v1/competitions', payload);
    return data;
  },

  updateCompetition: async (id: number, payload: UpdateCompetitionRequest): Promise<CompetitionResponse> => {
    const { data } = await axiosInstance.put<CompetitionResponse>(`/api/v1/competitions/${id}`, payload);
    return data;
  },

  changeStatus: async (id: number, payload: ChangeCompetitionStatusRequest): Promise<CompetitionResponse> => {
    const { data } = await axiosInstance.patch<CompetitionResponse>(
      `/api/v1/competitions/${id}/status`,
      payload
    );
    return data;
  },
};
