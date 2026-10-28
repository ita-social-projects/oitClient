import { axiosInstance } from '@shared/api/axiosInstance';
import type {
  CreateTaskAssignmentRequestDTO,
  DetailedTaskAssignmentResponseDTO,
  TaskAssignmentResponseDTO,
  UpdateTaskAssignmentRequestDTO,
} from '@shared/models/taskAssignment';

interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export const taskAssignmentService = {
  getTourAssignments: async (tourId: number): Promise<TaskAssignmentResponseDTO[]> => {
    const response = await axiosInstance.get<PageResponse<TaskAssignmentResponseDTO>>(
      `/api/v1/tours/${tourId}/task-assignments?page=0&size=100&sort=createdAt,asc`
    );
    return response.data?.content ?? [];
  },

  getAssignmentDetails: async (assignmentId: number): Promise<DetailedTaskAssignmentResponseDTO> => {
    const response = await axiosInstance.get<DetailedTaskAssignmentResponseDTO>(
      `/api/v1/task-assignments/${assignmentId}`
    );
    return response.data;
  },

  assignTask: async (
    tourId: number,
    payload: CreateTaskAssignmentRequestDTO
  ): Promise<DetailedTaskAssignmentResponseDTO> => {
    const response = await axiosInstance.post<DetailedTaskAssignmentResponseDTO>(
      `/api/v1/tours/${tourId}/task-assignments`,
      payload
    );
    return response.data;
  },

  updateAssignment: async (
    assignmentId: number,
    payload: UpdateTaskAssignmentRequestDTO
  ): Promise<DetailedTaskAssignmentResponseDTO> => {
    const response = await axiosInstance.patch<DetailedTaskAssignmentResponseDTO>(
      `/api/v1/task-assignments/${assignmentId}`,
      payload
    );
    return response.data;
  },

  deleteAssignment: async (assignmentId: number): Promise<void> => {
    await axiosInstance.delete(`/api/v1/task-assignments/${assignmentId}`);
  },
};

export default taskAssignmentService;
