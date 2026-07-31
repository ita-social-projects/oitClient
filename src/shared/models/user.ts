export type UserRole = 'USER' | 'ADMIN' | 'ORG' | 'JURY' | 'AUTHOR';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'DELETED';

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
}

export interface UserResponse {
  content: UserDto[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface ChangeUserRoleRequest {
  role: UserRole;
}

export interface ChangeUserStatusRequest {
  status: UserStatus;
}
