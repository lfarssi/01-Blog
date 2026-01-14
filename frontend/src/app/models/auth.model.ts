export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  // Define based on your backend response
  message?: string;
  user?: any;
}