// Type definitions for training sessions and related entities

export type MMADiscipline =
  | 'Boxing'
  | 'Muay Thai'
  | 'Kickboxing'
  | 'Wrestling'
  | 'Brazilian Jiu-Jitsu'
  | 'Judo'
  | 'MMA';

export interface SessionTechnique {
  id: string;
  session_id: string;
  technique_name: string;
  notes: string | null;
  created_at: string;
}

export interface TrainingSession {
  id: string;
  user_id: string;
  session_date: string; // ISO 8601 date string
  discipline: MMADiscipline;
  duration_minutes: number;
  intensity: number; // 1-10
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Extended type with techniques included
export interface TrainingSessionWithTechniques extends TrainingSession {
  techniques: SessionTechnique[];
}

// Type for creating a new training session
export interface CreateTrainingSessionInput {
  session_date: string;
  discipline: MMADiscipline;
  duration_minutes: number;
  intensity: number;
  notes?: string;
  techniques: Array<{
    technique_name: string;
    notes?: string;
  }>;
}

// Type for updating a training session
export interface UpdateTrainingSessionInput {
  session_date?: string;
  discipline?: MMADiscipline;
  duration_minutes?: number;
  intensity?: number;
  notes?: string;
}

// Type for filtering training sessions
export interface TrainingSessionFilters {
  discipline?: MMADiscipline | MMADiscipline[];
  startDate?: string;
  endDate?: string;
  minIntensity?: number;
  maxIntensity?: number;
}

// Type for training statistics
export interface TrainingStats {
  totalSessions: number;
  totalMinutes: number;
  averageIntensity: number;
  sessionsByDiscipline: Record<MMADiscipline, number>;
  currentStreak: number;
  longestStreak: number;
}
