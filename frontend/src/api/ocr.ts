// 백엔드 연동을 위한 타입 정의
interface OcrResponse {
  place: string;
  usage_time: Date;
  amount_spent: number;
}

// 나중에 실제 구현할 API 함수들의 인터페이스만 정의
export const ocrApi = {
  uploadImage: async (challengeId: string, images: FormData) => {
    // TODO: 실제 백엔드 연동 시 구현
    return Promise.resolve(null);
  },

  getResult: async (challengeId: string, ocrId: string) => {
    // TODO: 실제 백엔드 연동 시 구현
    return Promise.resolve(null);
  },

  updateResult: async (challengeId: string, ocrId: string, data: OcrResponse) => {
    // TODO: 실제 백엔드 연동 시 구현
    return Promise.resolve(null);
  }
};