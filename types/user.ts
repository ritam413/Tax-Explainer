export type ThemePreference = 'light' | 'dark';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  country: string;
  profession: string;
  theme_preference: ThemePreference;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfilePayload {
  user_id: string;
  name?: string;
  country?: string;
  profession?: string;
  theme_preference?: ThemePreference;
}

export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: {
    code: string;
    message: string;
  };
}
