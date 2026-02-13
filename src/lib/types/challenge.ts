export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  discipline: string;
  category: 'Striking' | 'Grappling' | 'Conditioning' | 'Technique' | 'Mental';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Impossible';
  duration_minutes: number;
  instructions: string[];
  points: number;
  created_at: string;
}

export interface ChallengeCompletion {
  id: string;
  user_id: string;
  challenge_id: string;
  completed_at: string;
  notes: string | null;
}

export interface CreateChallengeCompletionInput {
  challenge_id: string;
  notes?: string;
}

export interface ChallengeStats {
  total_points: number;
  current_streak: number;
  completions_this_month: number;
  most_completed_category: string | null;
  completed_dates: string[]; // Array of YYYY-MM-DD dates
}

export interface TodaysChallengeWithCompletion {
  challenge: DailyChallenge;
  completed: boolean;
  completion?: ChallengeCompletion;
}
