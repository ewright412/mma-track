'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MMA_DISCIPLINES, DISCIPLINE_HEX_COLORS, DURATION_PRESETS, getIntensityColor } from '@/lib/constants/disciplines';
import { createTrainingSession } from '@/lib/supabase/queries';
import { createNote } from '@/lib/supabase/notebookQueries';
import { CreateTrainingSessionInput, MMADiscipline } from '@/lib/types/training';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface Technique {
  id: string;
  technique_name: string;
  notes: string;
}

export default function NewTrainingSessionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [sessionDate, setSessionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [discipline, setDiscipline] = useState<MMADiscipline>(MMA_DISCIPLINES[0]);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [bjjType, setBjjType] = useState<'gi' | 'nogi'>('gi');
  const [techniques, setTechniques] = useState<Technique[]>([]);

  // Post-save note prompt
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [showLearnPrompt, setShowLearnPrompt] = useState(false);
  const [learnContent, setLearnContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const handleAddTechnique = () => {
    const newTechnique: Technique = {
      id: Date.now().toString(),
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
      const input: CreateTrainingSessionInput = {
        session_date: sessionDate,
        discipline,
        duration_minutes: durationMinutes,
        intensity,
        notes: (discipline === 'Brazilian Jiu-Jitsu' ? `[${bjjType === 'gi' ? 'Gi' : 'No-Gi'}] ` : '') + (notes.trim() || '') || undefined,
        techniques: techniques
          .filter((t) => t.technique_name.trim())
          .map((t) => ({
            technique_name: t.technique_name.trim(),
            notes: t.notes.trim() || undefined,
          })),
      };

      const { data, error: submitError } = await createTrainingSession(input);

      if (submitError) {
        setError(submitError.message);
        setIsSubmitting(false);
        return;
      }

      if (data) {
        setSavedSessionId(data.id);
        setShowLearnPrompt(true);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!learnContent.trim() || !savedSessionId) return;
    setSavingNote(true);
    await createNote({
      content: learnContent.trim(),
      discipline: discipline !== 'MMA' ? discipline : undefined,
      session_id: savedSessionId,
    });
    router.push('/training');
  };

  const handleSkipNote = () => {
    router.push('/training');
  };

  const getIntensityLabel = (val: number): string => {
    if (val <= 3) return 'Easy';
    if (val <= 6) return 'Moderate';
    if (val <= 9) return 'Hard';
    return 'Max';
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Log Training Session</h1>
          <p className="text-gray-500 text-sm">Track your progress across all disciplines</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Session Info */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Session Info</h2>
            <Input
              type="date"
              label="Session Date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
            />
          </div>

          {/* Discipline */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Discipline</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MMA_DISCIPLINES.map((d) => {
                const color = DISCIPLINE_HEX_COLORS[d];
                const isSelected = discipline === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiscipline(d)}
                    className={`relative p-3 rounded-lg text-sm font-medium transition-all text-left ${
                      isSelected
                        ? 'text-white'
                        : 'bg-[#1a1a24] border border-white/10 text-gray-400 hover:text-white'
                    }`}
                    style={isSelected ? {
                      backgroundColor: `${color}20`,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: color,
                      color: color,
                    } : undefined}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
                    {d}
                  </button>
                );
              })}
            </div>

            {/* BJJ Gi/No-Gi Toggle */}
            {discipline === 'Brazilian Jiu-Jitsu' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBjjType('gi')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      bjjType === 'gi'
                        ? 'bg-red-500/20 border border-red-500 text-red-400'
                        : 'bg-[#1a1a24] border border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    Gi
                  </button>
                  <button
                    type="button"
                    onClick={() => setBjjType('nogi')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      bjjType === 'nogi'
                        ? 'bg-red-500/20 border border-red-500 text-red-400'
                        : 'bg-[#1a1a24] border border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    No-Gi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Duration</h2>
            <div className="flex gap-2 mb-3 flex-wrap">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDurationMinutes(preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    durationMinutes === preset
                      ? 'bg-red-500/20 border border-red-500 text-red-400 font-medium'
                      : 'bg-[#1a1a24] border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {preset} min
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
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Intensity</h2>
            <div className="flex items-center gap-4 mb-3">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: getIntensityColor(intensity) }}
              >
                {intensity}
              </span>
              <span
                className="text-sm font-medium px-2 py-0.5 rounded"
                style={{
                  color: getIntensityColor(intensity),
                  backgroundColor: `${getIntensityColor(intensity)}20`,
                }}
              >
                {getIntensityLabel(intensity)}
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
                background: `linear-gradient(to right, #22c55e, #22c55e 22%, #f59e0b 33%, #f59e0b 55%, #ef4444 66%, #ef4444 88%, #991b1b 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1.5">
              <span>Light</span>
              <span>Moderate</span>
              <span>Hard</span>
              <span>Max</span>
            </div>
          </div>

          {/* Session Notes */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the session go?"
              rows={3}
              className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
            />
          </div>

          {/* Techniques */}
          <div className="mb-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4">
              <h2 className="text-lg font-semibold text-white">Techniques</h2>
              <button
                type="button"
                onClick={handleAddTechnique}
                className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {techniques.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">Click &quot;Add&quot; to track specific techniques</p>
              </div>
            ) : (
              <div className="space-y-3">
                {techniques.map((technique) => (
                  <div
                    key={technique.id}
                    className="bg-[#1a1a24] border border-white/10 rounded-lg p-3"
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
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
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
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          {!showLearnPrompt && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto sm:min-w-[200px] py-3">
                {isSubmitting ? 'Saving...' : 'Save Session'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/training')}
                disabled={isSubmitting}
                className="w-full sm:w-auto py-3"
              >
                Cancel
              </Button>
            </div>
          )}
        </form>

        {/* Post-save: What did you learn? */}
        {showLearnPrompt && (
          <div className="mt-6 bg-[#1a1a24] border border-white/10 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowLearnPrompt(true)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-sm font-medium">Session saved!</span>
                <span className="text-white/60 text-sm">— What did you learn?</span>
              </div>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </button>
            <div className="px-4 pb-4">
              <textarea
                value={learnContent}
                onChange={(e) => setLearnContent(e.target.value)}
                placeholder="Quick takeaway — a technique tip, something to drill next time..."
                rows={3}
                autoFocus
                className="w-full px-4 py-3 bg-[#0f0f13] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none text-sm"
              />
              <div className="flex gap-3 mt-3">
                <Button
                  onClick={handleSaveNote}
                  disabled={!learnContent.trim() || savingNote}
                  className="text-sm px-4 py-2"
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </Button>
                <Button variant="ghost" onClick={handleSkipNote} className="text-sm px-4 py-2">
                  Skip
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
