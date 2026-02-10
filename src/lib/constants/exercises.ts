// Exercise database for strength tracking
// Pre-populated with MMA-relevant exercises

export type ExerciseCategory = 'compound' | 'mma_specific' | 'accessory';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'legs' | 'arms' | 'core' | 'full_body';

export interface Exercise {
  name: string;
  category: ExerciseCategory;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups: MuscleGroup[];
  bodyweight?: boolean;
}

// ============================================================================
// COMPOUND EXERCISES
// ============================================================================

export const COMPOUND_EXERCISES: Exercise[] = [
  {
    name: 'Squat',
    category: 'compound',
    primaryMuscleGroup: 'legs',
    secondaryMuscleGroups: ['core'],
  },
  {
    name: 'Front Squat',
    category: 'compound',
    primaryMuscleGroup: 'legs',
    secondaryMuscleGroups: ['core', 'shoulders'],
  },
  {
    name: 'Deadlift',
    category: 'compound',
    primaryMuscleGroup: 'back',
    secondaryMuscleGroups: ['legs', 'core'],
  },
  {
    name: 'Romanian Deadlift',
    category: 'compound',
    primaryMuscleGroup: 'legs',
    secondaryMuscleGroups: ['back', 'core'],
  },
  {
    name: 'Bench Press',
    category: 'compound',
    primaryMuscleGroup: 'chest',
    secondaryMuscleGroups: ['shoulders', 'arms'],
  },
  {
    name: 'Incline Bench Press',
    category: 'compound',
    primaryMuscleGroup: 'chest',
    secondaryMuscleGroups: ['shoulders', 'arms'],
  },
  {
    name: 'Overhead Press',
    category: 'compound',
    primaryMuscleGroup: 'shoulders',
    secondaryMuscleGroups: ['arms', 'core'],
  },
  {
    name: 'Barbell Row',
    category: 'compound',
    primaryMuscleGroup: 'back',
    secondaryMuscleGroups: ['arms', 'core'],
  },
  {
    name: 'Pull-ups',
    category: 'compound',
    primaryMuscleGroup: 'back',
    secondaryMuscleGroups: ['arms', 'core'],
    bodyweight: true,
  },
  {
    name: 'Chin-ups',
    category: 'compound',
    primaryMuscleGroup: 'back',
    secondaryMuscleGroups: ['arms'],
    bodyweight: true,
  },
  {
    name: 'Dips',
    category: 'compound',
    primaryMuscleGroup: 'chest',
    secondaryMuscleGroups: ['shoulders', 'arms'],
    bodyweight: true,
  },
];

// ============================================================================
// MMA-SPECIFIC EXERCISES
// ============================================================================

export const MMA_SPECIFIC_EXERCISES: Exercise[] = [
  {
    name: 'Turkish Get-ups',
    category: 'mma_specific',
    primaryMuscleGroup: 'full_body',
    secondaryMuscleGroups: ['core', 'shoulders'],
  },
  {
    name: 'Medicine Ball Slams',
    category: 'mma_specific',
    primaryMuscleGroup: 'core',
    secondaryMuscleGroups: ['shoulders', 'back'],
  },
  {
    name: 'Kettlebell Swings',
    category: 'mma_specific',
    primaryMuscleGroup: 'legs',
    secondaryMuscleGroups: ['back', 'core'],
  },
  {
    name: 'Neck Bridges',
    category: 'mma_specific',
    primaryMuscleGroup: 'core',
    secondaryMuscleGroups: [],
    bodyweight: true,
  },
  {
    name: 'Farmer Carries',
    category: 'mma_specific',
    primaryMuscleGroup: 'full_body',
    secondaryMuscleGroups: ['core', 'arms'],
  },
  {
    name: 'Battle Ropes',
    category: 'mma_specific',
    primaryMuscleGroup: 'shoulders',
    secondaryMuscleGroups: ['arms', 'core'],
  },
  {
    name: 'Sled Push',
    category: 'mma_specific',
    primaryMuscleGroup: 'legs',
    secondaryMuscleGroups: ['core', 'shoulders'],
  },
  {
    name: 'Sled Pull',
    category: 'mma_specific',
    primaryMuscleGroup: 'back',
    secondaryMuscleGroups: ['legs', 'core'],
  },
  {
    name: 'Tire Flips',
    category: 'mma_specific',
    primaryMuscleGroup: 'full_body',
    secondaryMuscleGroups: ['legs', 'back'],
  },
  {
    name: 'Sprawl to Burpees',
    category: 'mma_specific',
    primaryMuscleGroup: 'full_body',
    secondaryMuscleGroups: ['core', 'legs'],
    bodyweight: true,
  },
  {
    name: 'Hip Escapes (weighted)',
    category: 'mma_specific',
    primaryMuscleGroup: 'core',
    secondaryMuscleGroups: ['legs'],
  },
  {
    name: 'Wall Balls',
    category: 'mma_specific',
    primaryMuscleGroup: 'legs',
    secondaryMuscleGroups: ['shoulders', 'core'],
  },
];

// ============================================================================
// ACCESSORY EXERCISES
// ============================================================================

export const ACCESSORY_EXERCISES: Exercise[] = [
  {
    name: 'Bicep Curls',
    category: 'accessory',
    primaryMuscleGroup: 'arms',
    secondaryMuscleGroups: [],
  },
  {
    name: 'Tricep Pushdowns',
    category: 'accessory',
    primaryMuscleGroup: 'arms',
    secondaryMuscleGroups: [],
  },
  {
    name: 'Lateral Raises',
    category: 'accessory',
    primaryMuscleGroup: 'shoulders',
    secondaryMuscleGroups: [],
  },
  {
    name: 'Face Pulls',
    category: 'accessory',
    primaryMuscleGroup: 'shoulders',
    secondaryMuscleGroups: ['back'],
  },
  {
    name: 'Leg Curls',
    category: 'accessory',
    primaryMuscleGroup: 'legs',
    secondaryMuscleGroups: [],
  },
  {
    name: 'Leg Extensions',
    category: 'accessory',
    primaryMuscleGroup: 'legs',
    secondaryMuscleGroups: [],
  },
  {
    name: 'Calf Raises',
    category: 'accessory',
    primaryMuscleGroup: 'legs',
    secondaryMuscleGroups: [],
  },
  {
    name: 'Ab Rollouts',
    category: 'accessory',
    primaryMuscleGroup: 'core',
    secondaryMuscleGroups: ['shoulders'],
    bodyweight: true,
  },
  {
    name: 'Hanging Leg Raises',
    category: 'accessory',
    primaryMuscleGroup: 'core',
    secondaryMuscleGroups: ['arms'],
    bodyweight: true,
  },
  {
    name: 'Russian Twists',
    category: 'accessory',
    primaryMuscleGroup: 'core',
    secondaryMuscleGroups: [],
    bodyweight: true,
  },
  {
    name: 'Planks',
    category: 'accessory',
    primaryMuscleGroup: 'core',
    secondaryMuscleGroups: ['shoulders'],
    bodyweight: true,
  },
];

// ============================================================================
// ALL EXERCISES (COMBINED)
// ============================================================================

export const ALL_EXERCISES: Exercise[] = [
  ...COMPOUND_EXERCISES,
  ...MMA_SPECIFIC_EXERCISES,
  ...ACCESSORY_EXERCISES,
].sort((a, b) => a.name.localeCompare(b.name));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getExerciseByName(name: string): Exercise | undefined {
  return ALL_EXERCISES.find(ex => ex.name.toLowerCase() === name.toLowerCase());
}

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return ALL_EXERCISES.filter(ex => ex.category === category);
}

export function isBodyweightExercise(name: string): boolean {
  const exercise = getExerciseByName(name);
  return exercise?.bodyweight === true;
}

export function getExercisesByMuscleGroup(muscleGroup: MuscleGroup): Exercise[] {
  return ALL_EXERCISES.filter(
    ex => ex.primaryMuscleGroup === muscleGroup || ex.secondaryMuscleGroups.includes(muscleGroup)
  );
}

// ============================================================================
// DISPLAY CONSTANTS
// ============================================================================

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  compound: 'Compound',
  mma_specific: 'MMA-Specific',
  accessory: 'Accessory',
};

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  legs: 'Legs',
  arms: 'Arms',
  core: 'Core',
  full_body: 'Full Body',
};

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  chest: '#ef4444',      // red
  back: '#3b82f6',       // blue
  shoulders: '#f59e0b',  // amber
  legs: '#22c55e',       // green
  arms: '#a855f7',       // purple
  core: '#f97316',       // orange
  full_body: '#6366f1',  // indigo
};
