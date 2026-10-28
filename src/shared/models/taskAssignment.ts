export type AssignmentVisibility = 'VISIBLE' | 'HIDDEN';

export interface RequiredFileRule {
  prompt: string;
  namingRule: string;
  allowedExtensions: string[];
  maxFileSizeMb: number;
}

export interface TaskRequirements {
  requiredFiles: RequiredFileRule[];
}

export interface TaskAssignmentResponseDTO {
  id: number;
  taskBodyId: number;
  taskTitle: string;
  tourId: number;
  maxPoints: number;
  createdBy: number;
  version: number;
}

export interface DetailedTaskAssignmentResponseDTO {
  id: number;
  taskBodyId: number;
  taskTitle: string;
  taskDescription?: string;
  tourId: number;
  visibility: AssignmentVisibility;
  maxPoints: number;
  requirements: TaskRequirements;
  createdBy: number;
  version: number;
}

export interface CreateTaskAssignmentRequestDTO {
  taskBodyId: number;
  visibility?: AssignmentVisibility;
  maxPoints: number;
  requirements: TaskRequirements;
}

export interface UpdateTaskAssignmentRequestDTO {
  visibility?: AssignmentVisibility;
  maxPoints?: number;
  requirements?: TaskRequirements;
  version: number;
}
