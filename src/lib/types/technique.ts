export interface Technique {
  id: string;
  name: string;
  discipline: string;
  category: string;
  position: string | null;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  key_points: string[];
  common_mistakes: string[];
  related_techniques: string[];
  created_at: string;
}

export interface TechniqueFilters {
  discipline?: string;
  category?: string;
  position?: string;
  difficulty?: string;
  search?: string;
}

export interface TechniquePracticeLog {
  id: string;
  user_id: string;
  technique_id: string;
  practiced_at: string;
  notes: string | null;
}

export interface CreatePracticeLogInput {
  technique_id: string;
  notes?: string;
}
