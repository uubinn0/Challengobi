import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000', // 8080에서 8000으로 수정
    withCredentials: true,
});

    
// Types
interface Challenge {
    id: number;
    creator_id: number;
    challenge_category: number;
    challenge_title: string;
    challenge_info: string;
    period: number;
    start_date: Date;
    budget: number;
    max_participants: number;
    status: string;
    created_at: Date;
    updated_at: Date;
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
    const response = await axiosInstance.get('/api/challenges/');
    return response.data;
  },

  async getRecruitingChallenges(): Promise<Challenge[]> {
    const response = await axiosInstance.get('/api/challenges/?status=recruit');
    return response.data;
  },

  async getInProgressChallenges(): Promise<Challenge[]> {
    const response = await axiosInstance.get('/api/challenges/?status=in_progress');
    return response.data;
  },

  async getChallengeDetail(challengeId: number): Promise<Challenge> {
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/`);
    return response.data;
  },

  async searchChallenges(keyword: string): Promise<Challenge[]> {
    const response = await axiosInstance.get(`/api/challenges/?search=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  async filterChallenges(category: string): Promise<Challenge[]> {
    const response = await axiosInstance.get(`/api/challenges/?category=${encodeURIComponent(category)}`);
    return response.data;
  },

  async searchAndFilterChallenges(keyword: string, category: string): Promise<Challenge[]> {
    const response = await axiosInstance.get(
      `/api/challenges/?search=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`
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
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/reactions`);
    return response.data;
  }
};

export default ChallengeAPI;
