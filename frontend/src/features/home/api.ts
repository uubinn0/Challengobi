import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
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
    participants_nicknames: string[];
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

interface ChallengeResponse {
  recruiting: Challenge[];
  in_progress: Challenge[];
}

export const HomeAPI = {
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

  // 챌린지 조회
  async getAllChallenges(): Promise<ChallengeResponse> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get<ChallengeResponse>('/api/challenges/', {
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
      const response = await axiosInstance.get('/api/challenges/?status=recruit', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('API Response:', response); // 응답 확인용
      return response.data.recruiting;
    } catch (error) {
      console.error('API Error:', error); // 에러 상세 확인용
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
    const token = localStorage.getItem('access_token');
    await axiosInstance.post(`/api/challenges/${challengeId}/join/`, null, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  },

  
  async inviteToChallenge(challengeId: number, fromUserId: number, toUserId: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await axiosInstance.post(`/api/challenges/${challengeId}/invite/`, {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      challenge_id: challengeId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  async leaveChallenge(challengeId: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await axiosInstance.delete(`/api/challenges/${challengeId}/leave/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 챌린지 반응
  async toggleReaction(challengeId: number, reaction: {
    encourage: boolean;
    want_to_join: boolean;
  }): Promise<void> {
    const token = localStorage.getItem('access_token');
    await axiosInstance.post(`/api/challenges/${challengeId}/reactions/toggle/`, reaction, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  async getReactions(challengeId: number): Promise<any> {
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/reactions`);
    return response.data;
  },

  // 게시글 관련
  async getPosts(challengeId: number): Promise<any[]> {
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/posts`);
    return response.data;
  },

  async createPost(challengeId: number, data: {
    user_id: number;
    board_title: string;
    board_content: string;
    board_image?: File;
  }): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.post(`/api/challenges/${challengeId}/posts`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  async getPostDetail(challengeId: number, postId: number): Promise<any> {
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/posts/${postId}`);
    return response.data;
  },

  async updatePost(challengeId: number, postId: number, data: {
    board_title: string;
    board_content: string;
    board_image?: File;
  }): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.put(`/api/challenges/${challengeId}/posts/${postId}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  async deletePost(challengeId: number, postId: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await axiosInstance.delete(`/api/challenges/${challengeId}/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  async getMyPosts(): Promise<any[]> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get('/api/accounts/me/posts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  async getUserPosts(userId: number): Promise<any[]> {
    const response = await axiosInstance.get(`/api/accounts/${userId}/posts`);
    return response.data;
  },

  async togglePostLike(challengeId: number, postId: number, userId: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await axiosInstance.post(`/api/challenges/${challengeId}/posts/${postId}/likes`, {
      user_id: userId,
      board_id: postId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // 댓글 관련
  async getComments(challengeId: number, postId: number): Promise<any[]> {
    const response = await axiosInstance.get(`/api/challenges/${challengeId}/posts/${postId}/comments`);
    return response.data;
  },

  async createComment(challengeId: number, postId: number, data: {
    user_id: number;
    comment_content: string;
  }): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.post(`/api/challenges/${challengeId}/posts/${postId}/commentsz`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  async updateComment(challengeId: number, postId: number, commentId: number, data: {
    user_id: number;
    comment_content: string;
  }): Promise<any> {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.put(`/api/challenges/${challengeId}/posts/${postId}/comments/${commentId}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  async deleteComment(challengeId: number, postId: number, commentId: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await axiosInstance.delete(`/api/challenges/${challengeId}/posts/${postId}/comments/${commentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};


export default HomeAPI;
