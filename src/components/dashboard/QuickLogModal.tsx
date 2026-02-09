'use client';

import React, { useState } from 'react';
import { X, Target, Dumbbell, Heart, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MMA_DISCIPLINES, DURATION_PRESETS, getIntensityColor } from '@/lib/constants/disciplines';
import { createTrainingSession } from '@/lib/supabase/queries';
import { checkAndAwardBadges } from '@/lib/supabase/badgeQueries';
import { BADGE_MAP } from '@/lib/constants/badges';
import { supabase } from '@/lib/supabase/client';
import { MMADiscipline } from '@/lib/types/training';
import { useRouter } from 'next/navigation';

type LogType = 'training' | 'strength' | 'cardio' | 'note';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function QuickLogModal({ isOpen, onClose, onSaved }: QuickLogModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [logType, setLogType] = useState<LogType | null>(null);

  // Training quick log state
  const [discipline, setDiscipline] = useState<MMADiscipline>('Boxing');
  const [duration, setDuration] = useState(60);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSelectType = (type: LogType) => {
    setLogType(type);
    if (type === 'strength' || type === 'cardio' || type === 'note') {
      onClose();
      if (type === 'strength') router.push('/strength/new');
      else if (type === 'cardio') router.push('/cardio/new');
      else router.push('/notebook/new');
      return;
    }
    setStep(2);
  };

  const handleSaveTraining = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await createTrainingSession({
        session_date: today,
        discipline,
        duration_minutes: duration,
        intensity,
        notes: notes.trim() || undefined,
        techniques: [],
      });

      if (error) {
        alert('Error saving session: ' + error.message);
      } else {
        // Check badges in background
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          checkAndAwardBadges(authUser.id).then((newBadges) => {
            if (newBadges.length > 0) {
              const name = BADGE_MAP[newBadges[0]]?.name || newBadges[0];
              alert(`🏆 Achievement Unlocked: ${name}!`);
            }
          });
        }
        onSaved?.();
        handleReset();
        onClose();
      }
    } catch {
      alert('Error saving session');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setLogType(null);
    setDiscipline('Boxing');
    setDuration(60);
    setIntensity(5);
    setNotes('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50">
      <div
        className="absolute inset-0"
        onClick={handleClose}
      />
      <Card className="relative w-full sm:max-w-lg mx-0 sm:mx-4 p-6 rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">
            {step === 1 ? 'Quick Log' : `Log ${logType === 'training' ? 'Training' : logType}`}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Pick type */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSelectType('training')}
              className="flex flex-col items-center gap-2 p-4 bg-[#060b18] border border-white/[0.08] rounded-lg hover:border-[#ef4444]/40 hover:bg-[#ef4444]/5 transition-all duration-150"
            >
              <Target className="w-8 h-8 text-[#ef4444]" />
              <span className="text-sm font-medium text-white">Training</span>
            </button>
            <button
              onClick={() => handleSelectType('strength')}
              className="flex flex-col items-center gap-2 p-4 bg-[#060b18] border border-white/[0.08] rounded-lg hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/5 transition-all duration-150"
            >
              <Dumbbell className="w-8 h-8 text-[#3b82f6]" />
              <span className="text-sm font-medium text-white">Strength</span>
            </button>
            <button
              onClick={() => handleSelectType('cardio')}
              className="flex flex-col items-center gap-2 p-4 bg-[#060b18] border border-white/[0.08] rounded-lg hover:border-[#22c55e]/40 hover:bg-[#22c55e]/5 transition-all duration-150"
            >
              <Heart className="w-8 h-8 text-[#22c55e]" />
              <span className="text-sm font-medium text-white">Cardio</span>
            </button>
            <button
              onClick={() => handleSelectType('note')}
              className="flex flex-col items-center gap-2 p-4 bg-[#060b18] border border-white/[0.08] rounded-lg hover:border-[#f59e0b]/40 hover:bg-[#f59e0b]/5 transition-all duration-150"
            >
              <BookOpen className="w-8 h-8 text-[#f59e0b]" />
              <span className="text-sm font-medium text-white">Note</span>
            </button>
          </div>
        )}

        {/* Step 2: Training quick form */}
        {step === 2 && logType === 'training' && (
          <div className="space-y-4">
            {/* Discipline */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Discipline</label>
              <div className="grid grid-cols-3 gap-2">
                {MMA_DISCIPLINES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiscipline(d)}
                    className={`py-2 px-2 rounded-md text-xs font-medium transition-all duration-150 ${
                      discipline === d
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-[#060b18] border border-white/[0.08] text-white/70 hover:border-white/20'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration presets */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Duration</label>
              <div className="flex gap-2">
                {DURATION_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDuration(preset)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                      duration === preset
                        ? 'bg-[#2563eb] text-white'
                        : 'bg-[#060b18] border border-white/[0.08] text-white/70 hover:border-white/20'
                    }`}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-white/80">Intensity</label>
                <span
                  className="text-sm font-bold"
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
                  background: 'linear-gradient(to right, rgb(34, 197, 94), rgb(234, 179, 8), rgb(239, 68, 68))',
                }}
              />
            </div>

            {/* Optional notes */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Quick notes..."
                className="w-full bg-[#060b18] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                onClick={handleSaveTraining}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Session'}
              </Button>
              <Button variant="ghost" onClick={() => { setStep(1); setLogType(null); }}>
                Back
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
