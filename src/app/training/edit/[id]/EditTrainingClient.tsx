'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { MMA_DISCIPLINES, DURATION_PRESETS, getIntensityColor } from '@/lib/constants/disciplines';
import { getTrainingSessionById, updateTrainingSession, updateSessionTechniques } from '@/lib/supabase/queries';
import { X, Plus } from 'lucide-react';

interface Technique {
  id: string;
  technique_name: string;
  notes: string;
}

export default function EditTrainingSessionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [sessionDate, setSessionDate] = useState('');
  const [discipline, setDiscipline] = useState(MMA_DISCIPLINES[0]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [bjjType, setBjjType] = useState<'gi' | 'nogi'>('gi');
  const [techniques, setTechniques] = useState<Technique[]>([]);

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await getTrainingSessionById(params.id);

      if (fetchError) {
        setError(fetchError.message);
        setIsLoading(false);
        return;
      }

      if (data) {
        setSessionDate(data.session_date);
        setDiscipline(data.discipline);
        setDurationMinutes(data.duration_minutes);
        setIntensity(data.intensity);
        setNotes(data.notes || '');
        setTechniques(
          data.techniques.map((t) => ({
            id: t.id,
            technique_name: t.technique_name,
            notes: t.notes || '',
          }))
        );
      }

      setIsLoading(false);
    };

    loadSession();
  }, [params.id]);

  const handleAddTechnique = () => {
    const newTechnique: Technique = {
      id: `new-${Date.now()}`,
      technique_name: '',
      notes: '',
    };
    setTechniques([...techniques, newTechnique]);
  };

  const handleRemoveTechnique = (id: string) => {
    setTechniques(techniques.filter((t) => t.id !== id));
  };

  const handleTechniqueChange = (id: string, field: 'technique_name' | 'notes', value: string) => {
    setTechniques(
      techniques.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Update session
      const { error: updateError } = await updateTrainingSession(params.id, {
        session_date: sessionDate,
        discipline,
        duration_minutes: durationMinutes,
        intensity,
        notes: notes.trim() || undefined,
      });

      if (updateError) {
        setError(updateError.message);
        setIsSubmitting(false);
        return;
      }

      // Update techniques
      const techniquesData = techniques
        .filter((t) => t.technique_name.trim())
        .map((t) => ({
          technique_name: t.technique_name.trim(),
          notes: t.notes.trim() || undefined,
        }));

      const { error: techniquesError } = await updateSessionTechniques(params.id, techniquesData);

      if (techniquesError) {
        setError(techniquesError.message);
        setIsSubmitting(false);
        return;
      }

      // Success - redirect to training history
      router.push('/training');
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 h-96 animate-pulse">
            <div className="h-full bg-white/5 rounded" />
          </Card>
        </div>
      </div>
    );
  }

  if (error && !sessionDate) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push('/training')}>Back to Training</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Training Session</h1>
          <p className="text-white/60">Update your training session details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            {/* Date */}
            <div className="mb-4">
              <Input
                type="date"
                label="Session Date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>

            {/* Discipline */}
            <div className="mb-4">
              <Select
                label="Discipline"
                value={discipline}
                onChange={(value) => setDiscipline(value as typeof MMA_DISCIPLINES[number])}
                options={MMA_DISCIPLINES.map((d) => ({ value: d, label: d }))}
                required
              />
            </div>

            {/* BJJ Gi/No-Gi Toggle */}
            {discipline === 'Brazilian Jiu-Jitsu' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/80 mb-2">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBjjType('gi')}
                    className={`flex-1 py-2 rounded-button text-sm font-medium transition-default ${
                      bjjType === 'gi'
                        ? 'bg-red-500 text-white'
                        : 'bg-card border border-border text-white/80 hover:bg-white/5'
                    }`}
                  >
                    Gi
                  </button>
                  <button
                    type="button"
                    onClick={() => setBjjType('nogi')}
                    className={`flex-1 py-2 rounded-button text-sm font-medium transition-default ${
                      bjjType === 'nogi'
                        ? 'bg-red-500 text-white'
                        : 'bg-card border border-border text-white/80 hover:bg-white/5'
                    }`}
                  >
                    No-Gi
                  </button>
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Duration (minutes)
              </label>
              <div className="flex gap-2 mb-2">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDurationMinutes(preset)}
                    className={`px-3 py-1.5 rounded-button text-sm font-medium transition-default ${
                      durationMinutes === preset
                        ? 'bg-accent text-white'
                        : 'bg-card border border-border text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={1}
                max={300}
                required
              />
            </div>

            {/* Intensity */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-white/80">
                  Intensity
                </label>
                <span
                  className="text-lg font-bold px-3 py-1 rounded-md"
                  style={{ color: getIntensityColor(intensity) }}
                >
                  {intensity}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(34, 197, 94), rgb(234, 179, 8), rgb(239, 68, 68))`,
                }}
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>Light</span>
                <span>Moderate</span>
                <span>Maximum</span>
              </div>
            </div>

            {/* Session Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Session Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the session go? Any observations..."
                rows={3}
                className="w-full bg-background border border-border rounded-input px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent transition-default resize-none"
              />
            </div>
          </Card>

          {/* Techniques Section */}
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Techniques Practiced</h2>
                <p className="text-sm text-white/60">What specific techniques did you work on?</p>
              </div>
              <Button type="button" onClick={handleAddTechnique} variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {techniques.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <p>No techniques added yet</p>
                <p className="text-sm mt-1">Click &quot;Add&quot; to track specific techniques</p>
              </div>
            ) : (
              <div className="space-y-3">
                {techniques.map((technique) => (
                  <div
                    key={technique.id}
                    className="bg-background border border-border rounded-lg p-3"
                  >
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Technique name (e.g., Jab-Cross combo)"
                        value={technique.technique_name}
                        onChange={(e) =>
                          handleTechniqueChange(technique.id, 'technique_name', e.target.value)
                        }
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTechnique(technique.id)}
                        className="p-2 text-white/60 hover:text-red-500 transition-default"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <Input
                      placeholder="Notes (optional)"
                      value={technique.notes}
                      onChange={(e) => handleTechniqueChange(technique.id, 'notes', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : 'Update Session'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/training')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
