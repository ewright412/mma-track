'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ExerciseSelect } from '@/components/ui/ExerciseSelect';
import { X, Plus, Save, Dumbbell, Trash2 } from 'lucide-react';
import {
  ALL_EXERCISES,
  CATEGORY_LABELS,
  MUSCLE_GROUP_LABELS,
  getExerciseByName,
} from '@/lib/constants/exercises';
import { createStrengthLog, checkAndUpdatePR } from '@/lib/supabase/strength-queries';
import { getWorkoutTemplates, createWorkoutTemplate } from '@/lib/supabase/strength-queries';
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

  // Load templates on mount
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPrResults([]);

    try {
      // Get authenticated user
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate
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

      // Save each exercise as a separate log entry
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

        // Check for PRs (find the best set)
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

      // Save as template if requested
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

      // Show PR results if any
      if (newPRs.length > 0) {
        setPrResults(newPRs);
        setTimeout(() => {
          router.push('/strength');
          router.refresh(); // Force refresh the page data
        }, 3000);
      } else {
        router.push('/strength');
        router.refresh(); // Force refresh the page data
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save workout');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Dumbbell className="w-8 h-8 text-red-500" />
          <h1 className="text-2xl font-bold text-white">Log Workout</h1>
        </div>

        {/* PR Celebration */}
        {prResults.length > 0 && (
          <Card className="mb-6 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <h2 className="text-xl font-bold text-yellow-400 mb-3">🎉 New Personal Record{prResults.length > 1 ? 's' : ''}!</h2>
            {prResults.map((pr, idx) => (
              <div key={idx} className="text-white mb-2">
                <span className="font-semibold">{pr.exercise}</span>: {pr.newValue.toFixed(1)} lbs
                {pr.previousValue && (
                  <span className="text-gray-400 text-sm ml-2">
                    (previous: {pr.previousValue.toFixed(1)} lbs)
                  </span>
                )}
              </div>
            ))}
            <p className="text-sm text-gray-300 mt-3">Redirecting to workout history...</p>
          </Card>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Template Selection */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workout Date
                </label>
                <Input
                  type="date"
                  value={workoutDate}
                  onChange={e => setWorkoutDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start from Template (Optional)
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
          </Card>

          {/* Exercises */}
          <div className="space-y-4">
            {exercises.map((exercise, exerciseIndex) => (
              <Card key={exercise.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 mr-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Exercise {exerciseIndex + 1}
                    </label>
                    <ExerciseSelect
                      value={exercise.exerciseName}
                      onChange={value => updateExerciseName(exercise.id, value)}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(exercise.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sets */}
                <div className="space-y-2 mb-4">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-400 px-2">
                    <div>Set</div>
                    <div>Reps</div>
                    <div>Weight (lbs)</div>
                    <div>RPE</div>
                  </div>
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-4 gap-2 items-center">
                      <div className="text-sm text-gray-300 px-2">{setIndex + 1}</div>
                      <Input
                        type="number"
                        value={set.reps || ''}
                        onChange={e =>
                          updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)
                        }
                        min="0"
                        required
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
                      />
                      <div className="flex items-center gap-1">
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSet(exercise.id, setIndex)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => addSet(exercise.id)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Set
                </Button>
              </Card>
            ))}

            <Button type="button" variant="secondary" onClick={addExercise} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </div>

          {/* Notes */}
          <Card className="p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Workout Notes (Optional)
            </label>
            <textarea
              className="w-full px-4 py-3 bg-[#0f0f13] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any observations?"
            />
          </Card>

          {/* Save as Template */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="saveAsTemplate"
                checked={saveAsTemplate}
                onChange={e => setSaveAsTemplate(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
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
          </Card>

          {/* Total Volume & Submit */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-400">Total Volume</div>
                <div className="text-3xl font-bold text-white">
                  {calculateTotalVolume().toLocaleString()} lbs
                </div>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Workout'}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}
