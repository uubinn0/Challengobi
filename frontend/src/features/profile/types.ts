// 공통으로 사용할 User 타입을 정의
export interface User {
  id: number;
  nickname: string;
  profile_image: string | null;  // undefined 대신 null 사용
  // ... 다른 필요한 필드들
} 