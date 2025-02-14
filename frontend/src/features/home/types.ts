export interface Challenge {
  id: number;
  title: string;
  category: string;
  period: string;
  amount: string;
  currentMembers: number;
  maxMembers: number;
  likes: number;
  wants: number;
  description?: string;
}

export interface OngoingChallenge {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  amount: string;
  period: string;
  progress: number;
  successRate: number;
  supports: number;
  wants: number;
} 