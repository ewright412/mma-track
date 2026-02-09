// TypeScript types for competition tracking

export interface Competition {
  id: string;
  user_id: string;
  name: string;
  competition_date: string; // ISO date string
  weight_class: string;
  target_weight: number | null;
  notes: string | null;
  created_at: string;
}

export interface CreateCompetitionInput {
  name: string;
  competition_date: string;
  weight_class: string;
  target_weight?: number;
  notes?: string;
}
