import {
  Swords,
  Flame,
  Shield,
  Trophy,
  Target,
  Dumbbell,
  TrendingUp,
  MapPin,
  Users,
  LucideIcon,
} from 'lucide-react';

export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    key: 'first_blood',
    name: 'First Blood',
    description: 'Log your first training session',
    icon: Swords,
    color: '#ef4444',
  },
  {
    key: 'week_warrior',
    name: 'Week Warrior',
    description: '5 sessions in one week',
    icon: Flame,
    color: '#f97316',
  },
  {
    key: 'iron_will',
    name: 'Iron Will',
    description: '7-day training streak',
    icon: Shield,
    color: '#3b82f6',
  },
  {
    key: 'unstoppable',
    name: 'Unstoppable',
    description: '30-day training streak',
    icon: Trophy,
    color: '#f59e0b',
  },
  {
    key: 'well_rounded',
    name: 'Well Rounded',
    description: '4+ disciplines in one week',
    icon: Target,
    color: '#22c55e',
  },
  {
    key: 'thousand_lb_club',
    name: '1000lb Club',
    description: 'Bench + Squat + Deadlift >= 1000 lbs',
    icon: Dumbbell,
    color: '#a855f7',
  },
  {
    key: 'pr_machine',
    name: 'PR Machine',
    description: '3+ personal records in one month',
    icon: TrendingUp,
    color: '#ec4899',
  },
  {
    key: 'road_warrior',
    name: 'Road Warrior',
    description: '50km total cardio distance',
    icon: MapPin,
    color: '#f97316',
  },
  {
    key: 'sparring_veteran',
    name: 'Sparring Veteran',
    description: '10 sparring sessions logged',
    icon: Users,
    color: '#6366f1',
  },
];

export const BADGE_MAP: Record<string, BadgeDefinition> = Object.fromEntries(
  BADGE_DEFINITIONS.map((b) => [b.key, b])
);
