// 공통으로 사용할 User 타입을 정의
export interface User {
  id: number;
  follower: number;
  following: number;
  follower_nickname: string;
  following_nickname: string;
  created_at: string;
} 