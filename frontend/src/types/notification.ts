export type NotificationType = 'FOLLOW' | 'VERIFY' | 'INVITE' | 'COMPLETE';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  data: {
    userId?: string;    // FOLLOW 타입일 때 필요
    nickname?: string;  // FOLLOW, INVITE 타입일 때 필요
    challengeId?: string;  // VERIFY, INVITE, COMPLETE 타입일 때 필요
  };
} 