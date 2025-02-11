export interface UserProfile {
  email: string;
  userId: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  gender: string;
  birthDate: Date | null;
  occupation: string;
  profileImage?: string;
  introduction: string;
  keywords: string[];
}

export const initialUserProfile: UserProfile = {
  email: '',
  userId: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  gender: '',
  birthDate: null,
  occupation: '',
  profileImage: undefined,
  introduction: '',
  keywords: []
}; 