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
  message: string;
  data: {
    id: number;
    email: string;
    nickname: string;
    sex: 'M' | 'F';
    birth_date: string;
    career: number;
    introduction: string | null;
    profile_image: string | null;
    total_saving: number;
    challenge_categories: {
      cafe: boolean;
      restaurant: boolean;
      grocery: boolean;
      shopping: boolean;
      culture: boolean;
      hobby: boolean;
      drink: boolean;
      transportation: boolean;
      etc: boolean;
    };
    my_badge: Array<{
      imageUrl: string;
      name: string;
      description: string;
    }>;
    complete_challenge: Array<{
      title: string;
      period: string;
      saving: number;
    }>;
  };
}

export interface ProfileUpdateData {
  user_id: number;
  profile_image?: File;
  password?: string;
  nickname: string;
  phone: string;
  birth_date: string;
  career: number;
  sex: 'M' | 'F';
  introduction: string;
  categories: string[];
}

export interface DeleteAccountData {
  user_id: number;
  password: string;
}

// API 응답 타입 수정
export interface RecommendedUser {
  id: number;
  nickname: string;
  profile_image: string;
  similarity: number;
}

// API 함수들
export const accountApi = {
  // 내 프로필 조회
  getMyProfile: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get('/api/accounts/me/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;  // 서버에서 오는 응답 그대로 반환
    } catch (error) {
      console.error('API 에러:', error);
      throw new Error('프로필 조회에 실패했습니다.');
    }
  },

  // 프로필 수정
  updateProfile: async (data: ProfileUpdateData): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('프로필 수정 에러:', error);
      throw new Error('프로필 수정에 실패했습니다.');
    }
  },

  // 회원 탈퇴
  deleteAccount: async (data: DeleteAccountData): Promise<void> => {
    try {
      const token = localStorage.getItem('access_token');
      await axiosInstance.delete('/api/accounts/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: data  // user_id와 password 전송
      });
    } catch (error) {
      console.error('회원 탈퇴 에러:', error);
      throw new Error('회원 탈퇴에 실패했습니다.');
    }
  },

  // 추천 사용자 목록 가져오기
  getRecommendations: async (): Promise<RecommendedUser[]> => {
    try {
      const token = localStorage.getItem('access_token');
      const myProfile = await accountApi.getMyProfile();
      const userId = myProfile.data.id;

      // FastAPI의 /recommend 엔드포인트로 요청
      const response = await axiosInstance.post('/recommend', {  // 백엔드 엔드포인트와 일치하도록 수정
        id: userId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('추천 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('추천 사용자 조회 실패:', error);
      throw new Error('추천 사용자 조회에 실패했습니다.');
    }
  },
};