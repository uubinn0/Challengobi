import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 서버 URL
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

interface LoginData {
  email: string;
  password: string;
}

// 회원가입 관련 API
export const register = async (data: RegisterData) => {
  const response = await axiosInstance.post('/api/accounts/register', data);
  return response.data;
};

export const validateEmail = async (email: string) => {
  const response = await axiosInstance.get(`/api/accounts/validate?email=${email}`);
  return response.data;
};

export const validateNickname = async (nickname: string) => {
  const response = await axiosInstance.get(`/api/accounts/validate?nickname=${nickname}`);
  return response.data;
};

export const sendVerificationEmail = async () => {
  const response = await axiosInstance.post('/api/accounts/email/verify');
  return response.data;
};

export const verifyEmailToken = async (token: string) => {
  const response = await axiosInstance.post(`/api/accounts/email/verify/${token}`);
  return response.data;
};

// 로그인 관련 API
export const login = async (data: LoginData) => {
  const response = await axiosInstance.post('/api/accounts/login', data);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.get('/api/accounts/logout');
  return response.data;
};

export const resetPassword = async (password: string) => {
  const response = await axiosInstance.put('/api/accounts/password', { password });
  return response.data;
};