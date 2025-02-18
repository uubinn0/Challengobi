export interface Challenge {
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
  challenge_info?: string;
}

export interface OngoingChallenge {
  id: number
  title: string
  subtitle: string
  category: string
  amount: string
  period: string
  progress: number
  successRate: number
  supports: number
  wants: number
}

