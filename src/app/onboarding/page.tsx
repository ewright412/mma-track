'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MMA_DISCIPLINES, DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
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
  Plus,
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
  const [customGoalTitle, setCustomGoalTitle] = useState('');
  const [customGoalCategory, setCustomGoalCategory] = useState<GoalCategory>('other');
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

  const addCustomGoal = () => {
    if (!customGoalTitle.trim()) return;
    const newGoal: QuickGoal = {
      title: customGoalTitle.trim(),
      category: customGoalCategory,
      unit: '',
    };
    setSelectedGoals((prev) => [...prev, newGoal]);
    setCustomGoalTitle('');
  };

  const CATEGORY_BADGE_COLORS: Record<GoalCategory, string> = {
    weight: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    cardio: 'bg-green-500/20 text-green-300 border-green-500/30',
    strength: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    skill: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    other: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
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
                const hexColor = DISCIPLINE_HEX_COLORS[discipline];
                return (
                  <button
                    key={discipline}
                    onClick={() => toggleDiscipline(discipline)}
                    className={`p-4 rounded-card text-left transition-all duration-150 ease-out ${
                      isSelected
                        ? 'bg-card'
                        : 'border border-white/[0.08] bg-card hover:border-white/20'
                    }`}
                    style={isSelected ? {
                      borderLeft: `3px solid ${hexColor}`,
                      borderTop: '1px solid rgba(255,255,255,0.12)',
                      borderRight: '1px solid rgba(255,255,255,0.12)',
                      borderBottom: '1px solid rgba(255,255,255,0.12)',
                      backgroundColor: `${hexColor}08`,
                    } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected && (
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: hexColor }}
                        />
                      )}
                      <span className="text-sm font-medium">{discipline}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 mt-2" style={{ color: hexColor }} />
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
            <p className="text-white/60 mb-4">
              Create a custom goal or pick from suggestions below.
            </p>

            {/* Custom Goal Input */}
            <div className="bg-card border border-white/[0.08] rounded-card p-4 mb-6">
              <label className="block text-sm font-medium text-white/80 mb-2">Create Custom Goal</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customGoalTitle}
                  onChange={(e) => setCustomGoalTitle(e.target.value)}
                  placeholder="e.g., Deadlift 2x bodyweight"
                  className="flex-1 bg-background border border-border rounded-input px-3 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomGoal())}
                />
                <button
                  type="button"
                  onClick={addCustomGoal}
                  disabled={!customGoalTitle.trim()}
                  className="px-3 py-2 bg-blue-500 text-white rounded-button text-sm font-medium transition-default hover:bg-blue-600 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['strength', 'cardio', 'weight', 'skill', 'other'] as GoalCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCustomGoalCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-default capitalize ${
                      customGoalCategory === cat
                        ? CATEGORY_BADGE_COLORS[cat]
                        : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Goals */}
            {selectedGoals.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Your goals ({selectedGoals.length})</label>
                <div className="flex flex-wrap gap-2">
                  {selectedGoals.map((goal) => (
                    <span
                      key={goal.title}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-sm text-blue-300"
                    >
                      {goal.title}
                      <button
                        onClick={() => toggleGoal(goal)}
                        className="text-blue-400 hover:text-white ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Goals */}
            <div className="mb-8">
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Suggested goals</label>
              <div className="space-y-2">
                {QUICK_GOALS.filter((g) => !selectedGoals.some((s) => s.title === g.title)).map((goal) => (
                  <button
                    key={goal.title}
                    onClick={() => toggleGoal(goal)}
                    className="w-full p-3 rounded-card border border-white/[0.08] bg-card/50 hover:border-white/20 text-left transition-all duration-150 ease-out flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/80">{goal.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${CATEGORY_BADGE_COLORS[goal.category]}`}>
                        {goal.category}
                      </span>
                    </div>
                    <Plus className="w-4 h-4 text-white/30" />
                  </button>
                ))}
              </div>
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
