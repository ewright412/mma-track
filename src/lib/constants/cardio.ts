import { CardioType, CardioTemplate } from '../types/cardio';

// All cardio types supported in the app
export const CARDIO_TYPES: CardioType[] = [
  'Running',
  'Cycling',
  'Swimming',
  'Jump Rope',
  'Heavy Bag Rounds',
  'Rowing',
  'Circuit Training',
  'HIIT',
  'Other',
];

// Cardio type color mapping for UI
export const CARDIO_TYPE_COLORS: Record<CardioType, string> = {
  'Running': 'bg-blue-500',
  'Cycling': 'bg-green-500',
  'Swimming': 'bg-cyan-500',
  'Jump Rope': 'bg-yellow-500',
  'Heavy Bag Rounds': 'bg-red-500',
  'Rowing': 'bg-indigo-500',
  'Circuit Training': 'bg-orange-500',
  'HIIT': 'bg-purple-500',
  'Other': 'bg-gray-500',
};

// Text color for cardio type badges
export const CARDIO_TYPE_TEXT_COLORS: Record<CardioType, string> = {
  'Running': 'text-blue-100',
  'Cycling': 'text-green-100',
  'Swimming': 'text-cyan-100',
  'Jump Rope': 'text-yellow-100',
  'Heavy Bag Rounds': 'text-red-100',
  'Rowing': 'text-indigo-100',
  'Circuit Training': 'text-orange-100',
  'HIIT': 'text-purple-100',
  'Other': 'text-gray-100',
};

// Pre-built cardio templates
export const CARDIO_TEMPLATES: CardioTemplate[] = [
  {
    name: '5K Run',
    cardio_type: 'Running',
    duration_minutes: 30,
    distance_km: 5,
    intervals: false,
    description: 'Standard 5K run at steady pace',
  },
  {
    name: '10K Run',
    cardio_type: 'Running',
    duration_minutes: 60,
    distance_km: 10,
    intervals: false,
    description: 'Long-distance 10K run',
  },
  {
    name: 'Interval Sprints',
    cardio_type: 'Running',
    duration_minutes: 20,
    intervals: true,
    interval_description: '8x 200m sprints with 90s rest',
    description: 'High-intensity sprint intervals',
  },
  {
    name: '3x5min Heavy Bag Rounds',
    cardio_type: 'Heavy Bag Rounds',
    duration_minutes: 15,
    intervals: true,
    interval_description: '3 rounds of 5 minutes, 1 minute rest between',
    description: 'Classic boxing conditioning rounds',
  },
  {
    name: '5x3min Heavy Bag Rounds',
    cardio_type: 'Heavy Bag Rounds',
    duration_minutes: 15,
    intervals: true,
    interval_description: '5 rounds of 3 minutes, 1 minute rest between',
    description: 'MMA-style bag work',
  },
  {
    name: 'Jump Rope Intervals',
    cardio_type: 'Jump Rope',
    duration_minutes: 20,
    intervals: true,
    interval_description: '10x 2min rounds, 30s rest',
    description: 'Classic boxing jump rope conditioning',
  },
  {
    name: '30min Cycling',
    cardio_type: 'Cycling',
    duration_minutes: 30,
    distance_km: 15,
    intervals: false,
    description: 'Steady-state cycling session',
  },
  {
    name: 'Bike Sprints',
    cardio_type: 'Cycling',
    duration_minutes: 20,
    intervals: true,
    interval_description: '8x 30s all-out, 90s recovery',
    description: 'High-intensity bike intervals',
  },
  {
    name: 'HIIT Circuit',
    cardio_type: 'HIIT',
    duration_minutes: 20,
    intervals: true,
    interval_description: '40s work / 20s rest, 6 exercises x 3 rounds',
    description: 'Full-body HIIT workout',
  },
  {
    name: '2K Row',
    cardio_type: 'Rowing',
    duration_minutes: 10,
    distance_km: 2,
    intervals: false,
    description: 'Standard 2000m rowing test',
  },
];

// Quick duration presets for cardio (in minutes)
export const CARDIO_DURATION_PRESETS = [15, 20, 30, 45, 60];

// Helper to calculate pace (min/km)
export function calculatePace(durationMinutes: number, distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  return durationMinutes / distanceKm;
}

// Helper to format pace as MM:SS per km
export function formatPace(paceMinPerKm: number): string {
  if (!paceMinPerKm || paceMinPerKm === 0) return 'N/A';
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
}

// Helper to estimate calories burned (simplified formula)
// Based on MET (Metabolic Equivalent of Task) values
export function estimateCalories(
  cardioType: CardioType,
  durationMinutes: number,
  userWeightKg: number = 75 // default to 75kg if not provided
): number {
  // MET values for different cardio types (approximate)
  const MET_VALUES: Record<CardioType, number> = {
    'Running': 9.8, // ~10 min/mile pace
    'Cycling': 7.5, // moderate pace
    'Swimming': 8.3, // moderate pace
    'Jump Rope': 11.0, // high intensity
    'Heavy Bag Rounds': 12.0, // very high intensity
    'Rowing': 8.5, // moderate pace
    'Circuit Training': 8.0,
    'HIIT': 10.0,
    'Other': 6.0,
  };

  const met = MET_VALUES[cardioType];
  // Calories = MET × weight (kg) × time (hours)
  return Math.round(met * userWeightKg * (durationMinutes / 60));
}

// Heart rate zones helper
export function getHeartRateZone(heartRate: number, maxHeartRate: number = 185): {
  zone: number;
  zoneName: string;
  color: string;
} {
  const percentage = (heartRate / maxHeartRate) * 100;

  if (percentage < 60) {
    return { zone: 1, zoneName: 'Very Light', color: 'text-gray-400' };
  } else if (percentage < 70) {
    return { zone: 2, zoneName: 'Light', color: 'text-blue-400' };
  } else if (percentage < 80) {
    return { zone: 3, zoneName: 'Moderate', color: 'text-green-400' };
  } else if (percentage < 90) {
    return { zone: 4, zoneName: 'Hard', color: 'text-orange-400' };
  } else {
    return { zone: 5, zoneName: 'Maximum', color: 'text-red-400' };
  }
}
