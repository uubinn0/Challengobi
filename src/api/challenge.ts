import api from './axios';

// 챌린지 생성
export const createChallenge = async (challengeData: {
  challenge_category: number;
  creator_id: number;
  challenge_title: string;
  challenge_info: string;
  period: number;
  start_date: Date;
  budget: number;
  max_participants: number;
}) => {
  const response = await api.post('/api/challenges/', challengeData);
  return response.data;
};

// 챌린지 수정
export const updateChallenge = async (
  challengeId: number,
  challengeData: {
    challenge_category: number;
    creator_id: number;
    challenge_title: string;
    challenge_info: string;
    period: number;
    start_date: Date;
    budget: number;
    max_participants: number;
  }
) => {
  const response = await api.put(`/api/challenges/${challengeId}/`, challengeData);
  return response.data;
};

// OCR 이미지 분석
export const analyzeReceiptImage = async (challengeId: number, formData: FormData) => {
  const response = await api.post(`/api/challenges/${challengeId}/expenses/ocr`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}; 