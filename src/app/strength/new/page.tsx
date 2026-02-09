'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ExerciseSelect } from '@/components/ui/ExerciseSelect';
import { X, Plus, Save, Dumbbell, Trash2 } from 'lucide-react';
import {
  getExerciseByName,
} from '@/lib/constants/exercises';
import { createStrengthLog, checkAndUpdatePR } from '@/lib/supabase/strength-queries';
import { getWorkoutTemplates, createWorkoutTemplate } from '@/lib/supabase/strength-queries';
import { checkAndAwardBadges } from '@/lib/supabase/badgeQueries';
import { BADGE_MAP } from '@/lib/constants/badges';
import { WorkoutTemplate } from '@/lib/types/strength';
import { StrengthSet } from '@/lib/types/strength';

interface ExerciseEntry {
  id: string;
  exerciseName: string;
  sets: StrengthSet[];
}

export default function NewStrengthLogPage() {
  const router = useRouter();
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prResults, setPrResults] = useState<Array<{ exercise: string; newValue: number; previousValue?: number }>>([]);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await getWorkoutTemplates(user.id);
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }

  function addExercise() {
    setExercises([
      ...exercises,
      {
        id: crypto.randomUUID(),
        exerciseName: '',
        sets: [{ reps: 0, weight: 0, rpe: 5 }],
      },
    ]);
  }

  function removeExercise(id: string) {
    setExercises(exercises.filter(ex => ex.id !== id));
  }

  function updateExerciseName(id: string, name: string) {
    setExercises(
      exercises.map(ex => (ex.id === id ? { ...ex, exerciseName: name } : ex))
    );
  }

  function addSet(exerciseId: string) {
    setExercises(
      exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0, rpe: 5 }] }
          : ex
      )
    );
  }

  function removeSet(exerciseId: string, setIndex: number) {
    setExercises(
      exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
          : ex
      )
    );
  }

  function updateSet(
    exerciseId: string,
    setIndex: number,
    field: keyof StrengthSet,
    value: number
  ) {
    setExercises(
      exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, i) =>
                i === setIndex ? { ...set, [field]: value } : set
              ),
            }
          : ex
      )
    );
  }

  function loadTemplate(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const loadedExercises: ExerciseEntry[] = template.exercises.map(ex => ({
      id: crypto.randomUUID(),
      exerciseName: ex.exercise_name,
      sets: Array(ex.default_sets).fill(null).map(() => ({
        reps: ex.default_reps,
        weight: 0,
        rpe: 5,
      })),
    }));

    setExercises(loadedExercises);
    setSelectedTemplate(templateId);
  }

  function calculateTotalVolume(): number {
    return exercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce(
        (sum, set) => sum + set.reps * set.weight,
        0
      );
      return total + exerciseVolume;
    }, 0);
  }

  function calculateExerciseVolume(exercise: ExerciseEntry): number {
    return exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPrResults([]);

    try {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (exercises.length === 0) {
        throw new Error('Add at least one exercise');
      }

      for (const exercise of exercises) {
        if (!exercise.exerciseName) {
          throw new Error('All exercises must have a name');
        }
        if (exercise.sets.length === 0) {
          throw new Error(`${exercise.exerciseName} must have at least one set`);
        }
      }

      const newPRs: Array<{ exercise: string; newValue: number; previousValue?: number }> = [];

      for (const exercise of exercises) {
        const exerciseData = getExerciseByName(exercise.exerciseName);

        if (!exerciseData) {
          throw new Error(`Exercise "${exercise.exerciseName}" not found in database`);
        }

        await createStrengthLog({
          exercise_name: exercise.exerciseName,
          exercise_category: exerciseData.category,
          muscle_group: exerciseData.primaryMuscleGroup,
          sets: exercise.sets,
          notes,
          workout_date: workoutDate,
        });

        const bestSet = exercise.sets.reduce((best, set) => {
          const currentEstimate = set.weight * (1 + set.reps / 30);
          const bestEstimate = best.weight * (1 + best.reps / 30);
          return currentEstimate > bestEstimate ? set : best;
        });

        const prResult = await checkAndUpdatePR(
          user.id,
          exercise.exerciseName,
          bestSet.weight,
          bestSet.reps
        );

        if (prResult.isNewPR) {
          newPRs.push({
            exercise: exercise.exerciseName,
            newValue: prResult.newValue,
            previousValue: prResult.previousValue,
          });
        }
      }

      if (saveAsTemplate && templateName.trim()) {
        await createWorkoutTemplate({
          template_name: templateName,
          exercises: exercises.map(ex => {
            const exerciseData = getExerciseByName(ex.exerciseName)!;
            return {
              exercise_name: ex.exerciseName,
              exercise_category: exerciseData.category,
              muscle_group: exerciseData.primaryMuscleGroup,
              default_sets: ex.sets.length,
              default_reps: ex.sets[0]?.reps || 0,
            };
          }),
        });
      }

      // Check badges in background
      checkAndAwardBadges(user.id).then((newBadges) => {
        if (newBadges.length > 0) {
          const name = BADGE_MAP[newBadges[0]]?.name || newBadges[0];
          setBadgeToast(name);
          setTimeout(() => setBadgeToast(null), 4000);
        }
      });

      if (newPRs.length > 0) {
        setPrResults(newPRs);
        setTimeout(() => {
          router.push('/strength');
          router.refresh();
        }, 3000);
      } else {
        router.push('/strength');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save workout';
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Dumbbell className="w-7 h-7 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Log Workout</h1>
            <p className="text-gray-500 text-sm">Track your strength training</p>
          </div>
        </div>

        {/* PR Celebration */}
        {prResults.length > 0 && (
          <div className="mb-6 p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h2 className="text-lg font-bold text-yellow-400 mb-2">New PR{prResults.length > 1 ? 's' : ''}!</h2>
            {prResults.map((pr, idx) => (
              <div key={idx} className="text-white mb-1 text-sm">
                <span className="font-semibold">{pr.exercise}</span>: {pr.newValue.toFixed(1)} lbs
                {pr.previousValue && (
                  <span className="text-gray-400 ml-2">
                    (was {pr.previousValue.toFixed(1)} lbs)
                  </span>
                )}
              </div>
            ))}
            <p className="text-xs text-gray-400 mt-2">Redirecting...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Date and Template */}
          <div>
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Workout Date"
                value={workoutDate}
                onChange={e => setWorkoutDate(e.target.value)}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Template (Optional)
                </label>
                <Select
                  value={selectedTemplate}
                  onChange={value => loadTemplate(value)}
                  options={[
                    { value: '', label: '-- None --' },
                    ...templates.map(template => ({
                      value: template.id,
                      label: template.template_name,
                    })),
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div>
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Exercises</h2>
            <div className="space-y-4">
              {exercises.map((exercise, exerciseIndex) => (
                <div key={exercise.id} className="bg-[#1a1a24] border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-3">
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Exercise {exerciseIndex + 1}
                      </label>
                      <ExerciseSelect
                        value={exercise.exerciseName}
                        onChange={value => updateExerciseName(exercise.id, value)}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sets Table */}
                  <div className="space-y-2 mb-3">
                    <div className="grid grid-cols-[40px_1fr_1fr_80px_32px] gap-2 text-xs font-medium text-gray-500 px-1">
                      <div>Set</div>
                      <div>Reps</div>
                      <div>Weight (lbs)</div>
                      <div>RPE</div>
                      <div></div>
                    </div>
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-[40px_1fr_1fr_80px_32px] gap-2 items-center">
                        <div className="text-sm text-gray-400 text-center font-medium">{setIndex + 1}</div>
                        <Input
                          type="number"
                          value={set.reps || ''}
                          onChange={e =>
                            updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)
                          }
                          min="0"
                          required
                          className="!py-2 !px-3"
                        />
                        <Input
                          type="number"
                          value={set.weight || ''}
                          onChange={e =>
                            updateSet(exercise.id, setIndex, 'weight', parseFloat(e.target.value) || 0)
                          }
                          min="0"
                          step="0.5"
                          required
                          className="!py-2 !px-3"
                        />
                        <Select
                          value={set.rpe.toString()}
                          onChange={value =>
                            updateSet(exercise.id, setIndex, 'rpe', parseInt(value))
                          }
                          options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rpe => ({
                            value: rpe.toString(),
                            label: rpe.toString(),
                          }))}
                        />
                        {exercise.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSet(exercise.id, setIndex)}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Set - dashed border */}
                  <button
                    type="button"
                    onClick={() => addSet(exercise.id)}
                    className="w-full py-2 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Set
                  </button>

                  {/* Exercise volume */}
                  {calculateExerciseVolume(exercise) > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs">
                      <span className="text-gray-500">Volume</span>
                      <span className="text-gray-300 font-medium">{calculateExerciseVolume(exercise).toLocaleString()} lbs</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Exercise */}
              <button
                type="button"
                onClick={addExercise}
                className="w-full py-3 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Exercise
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Notes</h2>
            <textarea
              className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did the workout feel?"
            />
          </div>

          {/* Save as Template */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="saveAsTemplate"
                checked={saveAsTemplate}
                onChange={e => setSaveAsTemplate(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-[#1a1a24] text-red-500 focus:ring-red-500/20 focus:ring-offset-[#0f0f13]"
              />
              <label htmlFor="saveAsTemplate" className="text-sm font-medium text-gray-300">
                Save as Template
              </label>
            </div>
            {saveAsTemplate && (
              <Input
                type="text"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="Template name (e.g., Push Day, Leg Day)"
                required
              />
            )}
          </div>

          {/* Total Volume Bar + Submit */}
          <div className="bg-[#1a1a24] border border-white/10 rounded-lg p-4">
            {exercises.length > 0 && (
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <span className="text-sm text-gray-400">Total Volume</span>
                <span className="text-2xl font-bold text-white">
                  {calculateTotalVolume().toLocaleString()} lbs
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={loading} className="w-full sm:flex-1 py-3">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Workout'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/strength')}
                disabled={loading}
                className="w-full sm:w-auto py-3"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Badge Toast */}
      {badgeToast && (
        <div className="fixed bottom-6 right-6 bg-[#f59e0b] text-black px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <span className="text-lg">🏆</span>
          <span className="text-sm font-medium">Achievement Unlocked: {badgeToast}!</span>
        </div>
      )}
    </div>
  );
}
