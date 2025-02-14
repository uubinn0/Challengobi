import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // 8080에서 8000으로 수정
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 타입 정의    
export interface ProfileData {
    nickname: string;
    challenge_cnt: number;
    follow: number;
    follower: number;
    total_saving: number;
    my_badge: any[];
    complete_challenge: any[];
  }
  
  export interface ProfileUpdateData {
    user_id: number;
    profile_image?: File;
    password?: string;
    nickname?: string;
    phone?: string;
    birth_date?: string;
    career?: number;
    categories?: string[];
  }
  
  // API 함수들
  export const accountApi = {
    // 내 프로필 조회
    getMyProfile: async (): Promise<ProfileData> => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axiosInstance.get('/api/accounts/me/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('API 에러:', error);
        throw new Error('프로필 조회에 실패했습니다.');
      }
    },
  
    // 프로필 수정
    updateProfile: async (data: ProfileUpdateData): Promise<void> => {
      try {
        // FormData 사용 (이미지 업로드를 위해)
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            if (key === 'categories') {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });
  
        await axiosInstance.put('/api/accounts/me/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        throw new Error('프로필 수정에 실패했습니다.');
      }
    },
  
    // 회원 탈퇴
    deleteAccount: async (userId: number): Promise<void> => {
      try {
        await axiosInstance.delete('/api/accounts/me/', {
          data: { user_id: userId }
        });
      } catch (error) {
        throw new Error('회원 탈퇴에 실패했습니다.');
      }
    },
  
  };