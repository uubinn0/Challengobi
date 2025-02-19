import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // 8080에서 8000으로 수정
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RegisterData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  sex: string;
  phone: string;
  birth_date: Date;
  career: number;
  categories: string[];
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: number;
    email: string;
    nickname: string;
    sex: string;
    birth_date: string;
    career: number;
    total_saving: number;
    introduction: string | null;
    profile_image: string | null;
    challenge_streak: number;
    follower_count: number;
    following_count: number;
    is_following: boolean;
  };
  tokens: {
    refresh: string;
    access: string;
  };
}


// 회원가입 관련 API
export const register = async (data: RegisterData) => {
  const response = await axiosInstance.post('/api/accounts/register/', data);
  return response.data;
};

export const validateEmail = async (email: string) => {
  const response = await axiosInstance.get(`/api/accounts/validate/?email=${email}`);
  return response.data;
};

export const validateNickname = async (nickname: string) => {
  const response = await axiosInstance.get(`/api/accounts/validate/?nickname=${nickname}`);
  return response.data;
};

export const sendVerificationEmail = async () => {
  const response = await axiosInstance.post('/api/accounts/email/verify/');
  return response.data;
};

export const verifyEmailToken = async (token: string) => {
  const response = await axiosInstance.post(`/api/accounts/email/verify/${token}/`);
  return response.data;
};

// 로그인 관련 API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // 입력값 검증
    if (!credentials.email?.trim() || !credentials.password?.trim()) {
      throw new Error('이메일과 비밀번호를 모두 입력해주세요.');
    }

    try {
      const response = await axiosInstance.post<LoginResponse>(
        '/api/accounts/login/',
        {
          email: credentials.email,
          password: credentials.password
        }
      );
      
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);

      return response.data;
    } catch (error) {
      console.log(error); // console.log 추가 나중에 삭제해도됨됨
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK') {
          throw new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
        throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
      }
      throw error;
    }
    
  },
};

export const logout = async () => {
  const response = await axiosInstance.get('/api/accounts/logout/');
  return response.data;
};

export const resetPassword = async (password: string) => {
  const response = await axiosInstance.put('/api/accounts/password/', { password });
  return response.data;
};
