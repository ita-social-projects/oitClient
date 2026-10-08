import { axiosInstance } from '@shared/api/axiosInstance';
import type {
  ChangeTourStatusRequest,
  CreateTourRequest,
  ReorderToursRequest,
  TourResponse,
  UpdateTourRequest,
} from '@shared/models/tour';

export const tourService = {
  getToursByStage: async (stageId: number): Promise<TourResponse[]> => {
    const { data } = await axiosInstance.get<TourResponse[]>(
      `/api/v1/stages/${stageId}/tours`
    );
    return data;
  },

  getTourById: async (tourId: number): Promise<TourResponse> => {
    const { data } = await axiosInstance.get<TourResponse>(`/api/v1/tours/${tourId}`);
    return data;
  },

  createTour: async (
    stageId: number,
    payload: CreateTourRequest
  ): Promise<TourResponse> => {
    const { data } = await axiosInstance.post<TourResponse>(
      `/api/v1/stages/${stageId}/tours`,
      payload
    );
    return data;
  },

  updateTour: async (
    stageId: number,
    tourId: number,
    payload: UpdateTourRequest
  ): Promise<TourResponse> => {
    const { data } = await axiosInstance.put<TourResponse>(
      `/api/v1/stages/${stageId}/tours/${tourId}`,
      payload
    );
    return data;
  },

  changeTourStatus: async (
    stageId: number,
    tourId: number,
    payload: ChangeTourStatusRequest
  ): Promise<TourResponse> => {
    const { data } = await axiosInstance.patch<TourResponse>(
      `/api/v1/stages/${stageId}/tours/${tourId}/status`,
      payload
    );
    return data;
  },

  reorderTours: async (
    stageId: number,
    payload: ReorderToursRequest
  ): Promise<TourResponse[]> => {
    const { data } = await axiosInstance.patch<TourResponse[]>(
      `/api/v1/stages/${stageId}/tours/order`,
      payload
    );
    return data;
  },

  deleteTour: async (stageId: number, tourId: number): Promise<void> => {
    await axiosInstance.delete(`/api/v1/stages/${stageId}/tours/${tourId}`);
  },
};

export default tourService;
