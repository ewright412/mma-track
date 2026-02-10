// Type definitions for sparring sessions and related entities

export type OpponentSkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';

export type SparringType = 'mma' | 'striking' | 'grappling';

export interface SparringRound {
  id: string;
  session_id: string;
  round_number: number;
  ratings: Record<string, number>; // Dynamic category ratings (e.g. { striking: 7, defense: 8 })
  // Legacy columns (nullable, kept for backward compat)
  striking_offense: number | null;
  striking_defense: number | null;
  takedowns: number | null;
  ground_game: number | null;
  notes: string | null;
  created_at: string;
}

export interface SparringSession {
  id: string;
  user_id: string;
  session_date: string; // ISO 8601 date string
  sparring_type: SparringType;
  total_rounds: number;
  opponent_skill_level: OpponentSkillLevel;
  notes: string | null;
  what_went_well: string | null;
  what_to_improve: string | null;
  created_at: string;
  updated_at: string;
}

// Extended type with rounds included
export interface SparringSessionWithRounds extends SparringSession {
  rounds: SparringRound[];
}

// Type for creating a new sparring session
export interface CreateSparringSessionInput {
  session_date: string;
  sparring_type: SparringType;
  total_rounds: number;
  opponent_skill_level: OpponentSkillLevel;
  notes?: string;
  what_went_well?: string;
  what_to_improve?: string;
  rounds: Array<{
    round_number: number;
    ratings: Record<string, number>;
    notes?: string;
  }>;
}

// Type for updating a sparring session
export interface UpdateSparringSessionInput {
  session_date?: string;
  sparring_type?: SparringType;
  total_rounds?: number;
  opponent_skill_level?: OpponentSkillLevel;
  notes?: string;
  what_went_well?: string;
  what_to_improve?: string;
}

// Type for filtering sparring sessions
export interface SparringSessionFilters {
  opponent_skill_level?: OpponentSkillLevel | OpponentSkillLevel[];
  sparring_type?: SparringType;
  startDate?: string;
  endDate?: string;
}

// Type for sparring statistics and trends
export interface SparringStats {
  totalSessions: number;
  totalRounds: number;
  averageRatings: Record<string, number>; // Dynamic: key is category, value is average
  sessionsByOpponentLevel: Record<OpponentSkillLevel, number>;
  sessionsBySparringType: Record<SparringType, number>;
}

// Type for trend data (for charts)
export interface SparringTrendData {
  date: string;
  sparring_type: SparringType;
  ratings: Record<string, number>;
}

// Type for focus areas (patterns detector)
export interface FocusArea {
  category: string;
  categoryLabel: string;
  averageRating: number;
  trend: 'improving' | 'declining' | 'stable';
  message: string;
  priority: 'high' | 'medium' | 'low';
}
