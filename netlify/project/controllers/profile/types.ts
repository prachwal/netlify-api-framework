// Profile controller types

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  picture?: string;
  verified: boolean;
  provider: string;
  lastLogin: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  picture?: string;
}

export interface ProfileUpdateResponse extends ProfileResponse {
  updatedAt: string;
}