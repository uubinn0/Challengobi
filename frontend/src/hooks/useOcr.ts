import { useMutation, useQuery } from '@tanstack/react-query';
import * as ocrApi from '../api/ocr';

// 임시 더미 데이터
const dummyOcrResult = {
  place: "스타벅스",
  usage_time: new Date(),
  amount_spent: 4500
};

export const useUploadOcr = () => {
  return useMutation({
    mutationFn: ({ challengeId, images }: { challengeId: string; images: FormData }) => 
      // 실제 API 호출 대신 더미 데이터 반환
      Promise.resolve({ success: true, data: dummyOcrResult })
  });
};

export const useGetOcrResult = (challengeId: string, ocrId: string) => {
  return useQuery({
    queryKey: ['ocr', challengeId, ocrId],
    // 실제 API 호출 대신 더미 데이터 반환
    queryFn: () => Promise.resolve(dummyOcrResult),
    enabled: false  // 자동 호출 비활성화
  });
}; 