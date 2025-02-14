export interface Challenge {
    id: number
    title: string
    period: string
    amount: string
    category: string
    currentMembers: number
    maxMembers: number
    likes: number
    wants: number
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
  
  