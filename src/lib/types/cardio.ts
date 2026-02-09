// Type definitions for cardio logs and related entities

export type CardioType =
  | 'Running'
  | 'Cycling'
  | 'Swimming'
  | 'Jump Rope'
  | 'Heavy Bag Rounds'
  | 'Rowing'
  | 'Circuit Training'
  | 'HIIT'
  | 'Other';

export interface CardioLog {
  id: string;
  user_id: string;
  session_date: string; // ISO 8601 date string
  cardio_type: CardioType;
  duration_minutes: number;
  distance_km: number | null;
  average_heart_rate: number | null;
  max_heart_rate: number | null;
  intervals: boolean;
  interval_description: string | null;
  calories_estimate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Type for creating a new cardio log
export interface CreateCardioLogInput {
  session_date: string;
  cardio_type: CardioType;
  duration_minutes: number;
  distance_km?: number;
  average_heart_rate?: number;
  max_heart_rate?: number;
  intervals?: boolean;
  interval_description?: string;
  calories_estimate?: number;
  notes?: string;
}

// Type for updating a cardio log
export interface UpdateCardioLogInput {
  session_date?: string;
  cardio_type?: CardioType;
  duration_minutes?: number;
  distance_km?: number | null;
  average_heart_rate?: number | null;
  max_heart_rate?: number | null;
  intervals?: boolean;
  interval_description?: string | null;
  calories_estimate?: number | null;
  notes?: string;
}

// Type for filtering cardio logs
export interface CardioLogFilters {
  cardio_type?: CardioType | CardioType[];
  startDate?: string;
  endDate?: string;
  intervals?: boolean;
}

// Type for cardio statistics
export interface CardioStats {
  totalSessions: number;
  totalMinutes: number;
  totalDistance: number; // in km
  averageHeartRate: number;
  sessionsByType: Record<CardioType, number>;
  totalCalories: number;
}

// Type for weekly cardio summary
export interface WeeklyCardioSummary {
  weekStart: string; // ISO date of Monday
  weekEnd: string; // ISO date of Sunday
  totalMinutes: number;
  totalCalories: number;
  totalDistance: number; // in km
  sessionsByType: Record<CardioType, number>;
  avgHeartRate: number;
}

// Type for cardio trend data (for charts)
export interface CardioTrendData {
  date: string;
  duration: number;
  distance: number | null;
  pace: number | null; // min/km
  heartRate: number | null;
}

// Type for pre-built cardio template
export interface CardioTemplate {
  name: string;
  cardio_type: CardioType;
  duration_minutes: number;
  distance_km?: number;
  intervals: boolean;
  interval_description?: string;
  description: string;
}
