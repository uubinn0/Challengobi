import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',  // FastAPI(8001)에서 Django(8000)로 변경
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

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

// 추천 사용자용 타입
interface RecommendedUser {
  id: number;
  nickname: string;
  profile_image: string;
}

// 기존 User 타입은 유지
interface User {
  id: number;
  nickname: string;
  profile_image: string;
  similarity: number;
}

// 팔로워/팔로잉 타입 정의
export interface FollowUser {
  id: number;
  nickname: string;
  profile_image: string | null;
}

// API 함수들
export const accountApi = {
  // 내 프로필 조회 - Django 서버
  getMyProfile: async () => {
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
    getRecommendations: async (): Promise<User[]> => {
        try {
            const myProfile = await accountApi.getMyProfile();
            const userId = myProfile.data.id;

            const fastApiResponse = await axios.post('http://localhost:8001/api/accounts/recommendations', {
                id: userId
            });

            const recommendations = await Promise.all(
                fastApiResponse.data.map(async (user: { id: number, similarity: number }) => {
                    try {
                        const token = localStorage.getItem('access_token');
                        const userResponse = await axiosInstance.get(`/api/accounts/users/${user.id}/`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        return {
                            id: user.id,
                            nickname: userResponse.data.data.nickname,
                            profile_image: userResponse.data.data.profile_image || '/default-profile.jpg',
                            similarity: user.similarity
                        };
                    } catch (error) {
                        return {
                            id: user.id,
                            nickname: `추천 사용자 ${user.id}`,
                            profile_image: '/default-profile.jpg',
                            similarity: user.similarity
                        };
                    }
                })
            );

            return recommendations;

        } catch (error) {
            console.error('추천 사용자 조회 실패:', error);
            throw new Error('추천 사용자 조회에 실패했습니다.');
        }
    },

    // 특정 사용자의 프로필 정보 가져오기
    getUserProfile: async (userId: number) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`/api/accounts/users/${userId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('프로필 조회 실패:', error);
            throw new Error('프로필 조회에 실패했습니다.');
        }
    },

    // 팔로워 목록 가져오기
    getFollowers: async (userId: number): Promise<any[]> => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`/api/accounts/users/${userId}/followers/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('팔로워 목록 조회 실패:', error);
            return [];
        }
    },

    // 팔로잉 목록 가져오기
    getFollowing: async (userId: number): Promise<any[]> => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axiosInstance.get(`/api/accounts/users/${userId}/following/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('팔로잉 목록 조회 실패:', error);
            return [];
        }
    },

    // 팔로우하기
    followUser: async (userId: number): Promise<void> => {
        try {
            const token = localStorage.getItem('access_token');
            await axiosInstance.post(`/api/accounts/users/${userId}/follow/`, {  // 끝에 슬래시(/) 추가
                user_id: Number(localStorage.getItem('userId'))  // following_id 제거
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('팔로우 실패:', error);
            throw new Error('팔로우에 실패했습니다.');
        }
    },

    // 팔로우 취소하기
    unfollowUser: async (userId: number): Promise<void> => {
        try {
            const token = localStorage.getItem('access_token');
            await axiosInstance.delete(`/api/accounts/users/${userId}/follow/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('팔로우 취소 실패:', error);
            throw new Error('팔로우 취소에 실패했습니다.');
        }
    },

    // 팔로우 상태 확인
    getFollowStatus: async (userId: number): Promise<boolean> => {
        try {
            const token = localStorage.getItem('access_token');
            const myId = localStorage.getItem('userId');
            // 현재 프로필 사용자의 팔로워 목록을 확인
            const response = await axiosInstance.get(`/api/accounts/users/${userId}/followers/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // 팔로워 목록에서 내가 있는지 확인
            return response.data.some((follow: any) => 
                follow.follower === Number(myId)
            );
        } catch (error) {
            console.error('팔로우 상태 확인 실패:', error);
            return false;
        }
    }
};