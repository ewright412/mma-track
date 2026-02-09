'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MMA_DISCIPLINES, DISCIPLINE_COLORS } from '@/lib/constants/disciplines';
import { createGoal } from '@/lib/supabase/goalsQueries';
import { MMADiscipline } from '@/lib/types/training';
import { GoalCategory } from '@/lib/types/metrics';
import {
  requestNotificationPermission,
  saveReminderSettings,
} from '@/lib/utils/notifications';
import { markOnboardingComplete } from '@/lib/utils/onboarding';
import {
  ChevronRight,
  ChevronLeft,
  Swords,
  Target,
  Bell,
  CheckCircle,
} from 'lucide-react';

interface QuickGoal {
  title: string;
  category: GoalCategory;
  unit: string;
}

const QUICK_GOALS: QuickGoal[] = [
  { title: 'Train 5 days per week', category: 'other', unit: 'days/week' },
  { title: 'Run 5K under 25 minutes', category: 'cardio', unit: 'min' },
  { title: 'Complete 20 pull-ups', category: 'strength', unit: 'reps' },
  { title: 'Compete in first tournament', category: 'skill', unit: '' },
  { title: 'Reach target weight', category: 'weight', unit: 'lbs' },
  { title: 'Master a new submission', category: 'skill', unit: '' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedDisciplines, setSelectedDisciplines] = useState<MMADiscipline[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<QuickGoal[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalSteps = 4;

  const toggleDiscipline = (discipline: MMADiscipline) => {
    setSelectedDisciplines((prev) =>
      prev.includes(discipline)
        ? prev.filter((d) => d !== discipline)
        : [...prev, discipline]
    );
  };

  const toggleGoal = (goal: QuickGoal) => {
    setSelectedGoals((prev) =>
      prev.some((g) => g.title === goal.title)
        ? prev.filter((g) => g.title !== goal.title)
        : [...prev, goal]
    );
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
      saveReminderSettings({
        enabled: true,
        time: '19:00',
        lastChecked: null,
      });
    }
  };

  const handleFinish = async () => {
    setSaving(true);

    // Save selected goals
    for (const goal of selectedGoals) {
      await createGoal({
        title: goal.title,
        category: goal.category,
        unit: goal.unit || undefined,
      });
    }

    // Save discipline preferences
    if (selectedDisciplines.length > 0) {
      localStorage.setItem(
        'mma-tracker-preferred-disciplines',
        JSON.stringify(selectedDisciplines)
      );
    }

    markOnboardingComplete();
    setSaving(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-accent' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Swords className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Welcome to MMA Tracker</h1>
            <p className="text-white/60 text-lg mb-8">
              Track your training across all martial arts disciplines. Let&apos;s
              set up your profile in a few quick steps.
            </p>
            <button
              onClick={() => setStep(1)}
              className="bg-accent text-white px-8 py-3 rounded-button font-semibold text-lg transition-all duration-150 ease-out hover:opacity-90 flex items-center gap-2 mx-auto"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 1: Pick Disciplines */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">What do you train?</h2>
            <p className="text-white/60 mb-6">
              Select the disciplines you practice. You can always change this later.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {MMA_DISCIPLINES.map((discipline) => {
                const isSelected = selectedDisciplines.includes(discipline);
                const colorClass = DISCIPLINE_COLORS[discipline];
                return (
                  <button
                    key={discipline}
                    onClick={() => toggleDiscipline(discipline)}
                    className={`p-4 rounded-card border text-left transition-all duration-150 ease-out ${
                      isSelected
                        ? 'border-accent bg-accent/10'
                        : 'border-white/[0.08] bg-card hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${colorClass}`}
                      />
                      <span className="text-sm font-medium">{discipline}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-accent mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Set First Goals */}
        {step === 2 && (
          <div>
            <div className="w-14 h-14 rounded-full bg-accent-blue/10 flex items-center justify-center mb-4">
              <Target className="w-7 h-7 text-accent-blue" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Set your first goals</h2>
            <p className="text-white/60 mb-6">
              Pick a few goals to get started, or skip and add your own later.
            </p>
            <div className="space-y-3 mb-8">
              {QUICK_GOALS.map((goal) => {
                const isSelected = selectedGoals.some(
                  (g) => g.title === goal.title
                );
                return (
                  <button
                    key={goal.title}
                    onClick={() => toggleGoal(goal)}
                    className={`w-full p-4 rounded-card border text-left transition-all duration-150 ease-out flex items-center justify-between ${
                      isSelected
                        ? 'border-accent-blue bg-accent-blue/10'
                        : 'border-white/[0.08] bg-card hover:border-white/20'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium">{goal.title}</span>
                      <span className="text-xs text-white/40 ml-2 capitalize">
                        {goal.category}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-accent-blue flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Notifications */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-warning" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Training Reminders</h2>
            <p className="text-white/60 mb-8">
              Get a daily reminder if you haven&apos;t logged any training. Stay
              consistent and build your streak.
            </p>
            {notificationsEnabled ? (
              <div className="flex items-center justify-center gap-2 text-success mb-8">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Reminders enabled!</span>
              </div>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="bg-card border border-white/[0.08] text-white px-6 py-3 rounded-button font-medium transition-all duration-150 ease-out hover:border-white/20 mb-4"
              >
                Enable Reminders
              </button>
            )}
            <p className="text-white/40 text-sm">
              You can change this anytime in your profile settings.
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        {step > 0 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(step - 1)}
              className="text-white/60 hover:text-white flex items-center gap-1 transition-colors duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="bg-accent text-white px-6 py-2.5 rounded-button font-medium transition-all duration-150 ease-out hover:opacity-90 flex items-center gap-1"
              >
                {step === 1 && selectedDisciplines.length === 0
                  ? 'Skip'
                  : step === 2 && selectedGoals.length === 0
                  ? 'Skip'
                  : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="bg-accent text-white px-6 py-2.5 rounded-button font-medium transition-all duration-150 ease-out hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
              >
                {saving ? 'Setting up...' : "Let's Go!"}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
