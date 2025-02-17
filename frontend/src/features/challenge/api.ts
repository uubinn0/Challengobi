import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000', // 8080에서 8000으로 수정
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Token applied:', token); // 토큰 적용 확인용
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

    
// Types
interface Challenge {
    challenge_id: number;
    challenge_title: string;
    creator_nickname: string;
    period: number;
    period_display: string;
    start_date: string;
    end_date: string;
    budget: number;
    budget_display: string;
    challenge_category: number;
    category_name: string;
    max_participants: number;
    current_participants: number;
    participants_display: string;
    encourage_cnt: number;
    want_cnt: number;
}

interface ChallengeResponse {
    recruiting: Challenge[];
    in_progress: Challenge[];
}

interface ChallengeCreate {
    challenge_category: number;
    creator_id: number;
    challenge_title: string;
    challenge_info: string;
    period: number;
    start_date: Date;
    budget: number;
    max_participants: number;
    is_private: boolean;
}

const ChallengeAPI = {
  // 챌린지 관리
  async createChallenge(data: ChallengeCreate): Promise<Challenge> {
    const token = localStorage.getItem('access_token');
    
    const formattedData = {
      ...data,
      start_date: data.start_date.toISOString().split('T')[0]
    };

    const response = await axiosInstance.post('/api/challenges/', formattedData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async updateChallenge(challengeId: number, data: ChallengeCreate): Promise<Challenge> {
    const response = await axiosInstance.put(`/api/challenges/${challengeId}/`, data);
    return response.data;
  },

  async deleteChallenge(challengeId: number): Promise<void> {
    await axiosInstance.delete(`/api/challenges/${challengeId}/`);
  },

  // 챌린지 참여자 관리
  async getParticipants(challengeId: number): Promise<any[]> {
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/participants/`);
    return response.data;
  },

  async removeParticipant(challengeId: number, userId: number): Promise<void> {
    await axiosInstance.delete(`/api/challenges/${challengeId}/participants/${userId}/`);
  },

  // 챌린지 조회
  async getAllChallenges(): Promise<Challenge[]> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get('/api/challenges/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async getRecruitingChallenges(): Promise<Challenge[]> {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axiosInstance.get<ChallengeResponse>('/api/challenges/?status=recruit', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('API Response:', response);
      
      if (!response.data.recruiting) {
        return [];
      }
      
      return response.data.recruiting;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getInProgressChallenges(): Promise<Challenge[]> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get('/api/challenges/?status=in_progress', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.in_progress;
  },

  async getChallengeDetail(challengeId: number): Promise<Challenge> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async searchChallenges(keyword: string): Promise<Challenge[]> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get(`/api/challenges/?search=${encodeURIComponent(keyword)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async filterChallenges(category: string): Promise<Challenge[]> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get(`/api/challenges/?category=${encodeURIComponent(category)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async searchAndFilterChallenges(keyword: string, category: string): Promise<Challenge[]> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get(
      `/api/challenges/?search=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // 챌린지 참여/초대
  async joinChallenge(challengeId: number): Promise<void> {
    await axiosInstance.post(`/api/challenges/${challengeId}/join/`);
  },

  async inviteToChallenge(data: {
    from_user_id: number;
    to_user_id: number;
    challenge_id: number;
  }): Promise<void> {
    await axiosInstance.post(`/api/challenges/${data.challenge_id}/invite/`, data);
  },

  async leaveChallenge(challengeId: number): Promise<void> {
    await axiosInstance.delete(`/api/challenges/${challengeId}/leave/`);
  },

  // 챌린지 반응
  async toggleReaction(challengeId: number, reaction: {
    encourage: boolean;
    want_to_join: boolean;
  }): Promise<void> {
    await axiosInstance.post(`/api/challenges/${challengeId}/reactions/toggle/`, reaction);
  },

  async getReactions(challengeId: number): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/reactions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async getPosts(challengeId: number): Promise<any[]> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async getPostDetail(challengeId: number, postId: number): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async getUserPosts(userId: number): Promise<any[]> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get(`/api/accounts/${userId}/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  async getComments(challengeId: number, postId: number): Promise<any[]> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }
};

export default ChallengeAPI;
