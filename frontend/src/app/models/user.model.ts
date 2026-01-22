export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt?: Date;
  followersCount?: number;
  followingCount?: number;
}

export type UserRole = 'USER' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  email?: string;
}
export interface PageResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
  totalElements: number;
}
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
