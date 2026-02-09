import { MMADiscipline } from '../types/training';

// All MMA disciplines supported in the app
export const MMA_DISCIPLINES: MMADiscipline[] = [
  'Boxing',
  'Muay Thai',
  'Kickboxing',
  'Wrestling',
  'Brazilian Jiu-Jitsu',
  'MMA',
];

// Hex colors for each discipline
export const DISCIPLINE_HEX_COLORS: Record<MMADiscipline, string> = {
  'Boxing': '#ef4444',
  'Muay Thai': '#f97316',
  'Kickboxing': '#f59e0b',
  'Wrestling': '#22c55e',
  'Brazilian Jiu-Jitsu': '#3b82f6',
  'MMA': '#a855f7',
};

// Discipline color mapping for UI (using Tailwind color values)
export const DISCIPLINE_COLORS: Record<MMADiscipline, string> = {
  'Boxing': 'bg-red-500',
  'Muay Thai': 'bg-orange-500',
  'Kickboxing': 'bg-amber-500',
  'Wrestling': 'bg-green-500',
  'Brazilian Jiu-Jitsu': 'bg-blue-500',
  'MMA': 'bg-purple-500',
};

// Text color for discipline badges
export const DISCIPLINE_TEXT_COLORS: Record<MMADiscipline, string> = {
  'Boxing': 'text-red-100',
  'Muay Thai': 'text-orange-100',
  'Kickboxing': 'text-amber-100',
  'Wrestling': 'text-green-100',
  'Brazilian Jiu-Jitsu': 'text-blue-100',
  'MMA': 'text-purple-100',
};

// Quick duration presets (in minutes)
export const DURATION_PRESETS = [30, 45, 60, 90, 120];

// Intensity levels with descriptions
export const INTENSITY_LEVELS = [
  { value: 1, label: 'Very Light', description: 'Light drilling, technique review' },
  { value: 2, label: 'Light', description: 'Easy pace, focused on form' },
  { value: 3, label: 'Light-Moderate', description: 'Comfortable intensity' },
  { value: 4, label: 'Moderate', description: 'Steady work, breaking a sweat' },
  { value: 5, label: 'Moderate', description: 'Challenging but sustainable' },
  { value: 6, label: 'Moderate-High', description: 'Getting tough' },
  { value: 7, label: 'High', description: 'Hard sparring/drilling' },
  { value: 8, label: 'High', description: 'Very demanding session' },
  { value: 9, label: 'Very High', description: 'Near-maximal effort' },
  { value: 10, label: 'Maximum', description: 'All-out, competition pace' },
];

// Helper to get intensity color gradient
export function getIntensityColor(intensity: number): string {
  if (intensity <= 3) return 'rgb(34, 197, 94)'; // green
  if (intensity <= 6) return 'rgb(234, 179, 8)'; // yellow
  return 'rgb(239, 68, 68)'; // red
}

// Helper to get intensity gradient for slider
export function getIntensityGradient(): string {
  return 'linear-gradient(to right, rgb(34, 197, 94), rgb(234, 179, 8), rgb(239, 68, 68))';
}
