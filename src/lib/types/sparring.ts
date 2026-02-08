// Type definitions for sparring sessions and related entities

export type OpponentSkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';

export interface SparringRound {
  id: string;
  session_id: string;
  round_number: number;
  striking_offense: number; // 1-10
  striking_defense: number; // 1-10
  takedowns: number; // 1-10
  ground_game: number; // 1-10
  notes: string | null;
  created_at: string;
}

export interface SparringSession {
  id: string;
  user_id: string;
  session_date: string; // ISO 8601 date string
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
  total_rounds: number;
  opponent_skill_level: OpponentSkillLevel;
  notes?: string;
  what_went_well?: string;
  what_to_improve?: string;
  rounds: Array<{
    round_number: number;
    striking_offense: number;
    striking_defense: number;
    takedowns: number;
    ground_game: number;
    notes?: string;
  }>;
}

// Type for updating a sparring session
export interface UpdateSparringSessionInput {
  session_date?: string;
  total_rounds?: number;
  opponent_skill_level?: OpponentSkillLevel;
  notes?: string;
  what_went_well?: string;
  what_to_improve?: string;
}

// Type for filtering sparring sessions
export interface SparringSessionFilters {
  opponent_skill_level?: OpponentSkillLevel | OpponentSkillLevel[];
  startDate?: string;
  endDate?: string;
}

// Type for sparring statistics and trends
export interface SparringStats {
  totalSessions: number;
  totalRounds: number;
  averageRatings: {
    striking_offense: number;
    striking_defense: number;
    takedowns: number;
    ground_game: number;
  };
  sessionsByOpponentLevel: Record<OpponentSkillLevel, number>;
}

// Type for trend data (for charts)
export interface SparringTrendData {
  date: string;
  striking_offense: number;
  striking_defense: number;
  takedowns: number;
  ground_game: number;
}

// Type for focus areas (patterns detector)
export interface FocusArea {
  category: 'striking_offense' | 'striking_defense' | 'takedowns' | 'ground_game';
  categoryLabel: string;
  averageRating: number;
  trend: 'improving' | 'declining' | 'stable';
  message: string;
  priority: 'high' | 'medium' | 'low';
}
