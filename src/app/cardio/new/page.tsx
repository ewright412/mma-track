'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CARDIO_TYPES, CARDIO_TEMPLATES, CARDIO_DURATION_PRESETS } from '@/lib/constants/cardio';
import { createCardioLog } from '@/lib/supabase/cardioQueries';
import { checkAndAwardBadges } from '@/lib/supabase/badgeQueries';
import { BADGE_MAP } from '@/lib/constants/badges';
import { supabase } from '@/lib/supabase/client';
import { CreateCardioLogInput, CardioType, CardioTemplate } from '@/lib/types/cardio';
import { useToast } from '@/components/ui/Toast';
import { hapticMedium } from '@/lib/utils/haptics';
import { Zap, Play } from 'lucide-react';

export default function NewCardioLogPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  // Form state
  const [sessionDate, setSessionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [cardioType, setCardioType] = useState<CardioType>('Running');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [distanceKm, setDistanceKm] = useState<number | ''>('');
  const [averageHeartRate, setAverageHeartRate] = useState<number | ''>('');
  const [maxHeartRate, setMaxHeartRate] = useState<number | ''>('');
  const [intervals, setIntervals] = useState(false);
  const [intervalDescription, setIntervalDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleTemplateSelect = (template: CardioTemplate) => {
    setCardioType(template.cardio_type);
    setDurationMinutes(template.duration_minutes);
    setDistanceKm(template.distance_km ?? '');
    setIntervals(template.intervals);
    setIntervalDescription(template.interval_description ?? '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const input: CreateCardioLogInput = {
        session_date: sessionDate,
        cardio_type: cardioType,
        duration_minutes: durationMinutes,
        distance_km: distanceKm !== '' ? Number(distanceKm) : undefined,
        average_heart_rate: averageHeartRate !== '' ? Number(averageHeartRate) : undefined,
        max_heart_rate: maxHeartRate !== '' ? Number(maxHeartRate) : undefined,
        intervals,
        interval_description: intervalDescription.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const { data, error: submitError } = await createCardioLog(input);

      if (submitError) {
        setError(submitError.message);
        showToast('Failed to save session', 'error');
        setIsSubmitting(false);
        return;
      }

      if (data) {
        hapticMedium();
        showToast('Cardio session logged!');
        // Check badges in background
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const newBadges = await checkAndAwardBadges(authUser.id);
          if (newBadges.length > 0) {
            const name = BADGE_MAP[newBadges[0]]?.name || newBadges[0];
            setBadgeToast(name);
            setTimeout(() => {
              setBadgeToast(null);
              router.push('/cardio');
            }, 2500);
            return;
          }
        }
        router.push('/cardio');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      showToast('An unexpected error occurred', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Log Cardio Session</h1>
          <p className="text-gray-500 text-sm">Track your conditioning work</p>
        </div>

        {/* Quick Templates */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Quick Templates</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CARDIO_TEMPLATES.map((template) => (
              <button
                key={template.name}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className="text-left p-3 bg-[#1a1a24] border border-white/10 rounded-xl hover:border-red-500/30 transition-colors group flex flex-col justify-between min-h-[60px]"
              >
                <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">
                  {template.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">{template.duration_minutes} min</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Session Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Session Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Session Date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
              <Select
                label="Cardio Type"
                value={cardioType}
                onChange={(value) => setCardioType(value as CardioType)}
                options={CARDIO_TYPES.map((type) => ({ value: type, label: type }))}
                required
              />
            </div>

            {/* Duration */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Duration (minutes)
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {CARDIO_DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDurationMinutes(preset)}
                    className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
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
                max={600}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                type="number"
                label="Distance (km)"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                step={0.1}
                placeholder="e.g., 5.0"
              />
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-3">
                  <input
                    type="checkbox"
                    checked={intervals}
                    onChange={(e) => setIntervals(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-[#1a1a24] text-red-500 focus:ring-red-500/20 focus:ring-offset-[#0f0f13]"
                  />
                  <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    Interval Training
                  </span>
                </label>
              </div>
            </div>

            {intervals && (
              <div className="mt-4">
                <Input
                  label="Interval Description"
                  value={intervalDescription}
                  onChange={(e) => setIntervalDescription(e.target.value)}
                  placeholder="e.g., 8x 30s sprints with 90s rest"
                />
              </div>
            )}
          </div>

          {/* Heart Rate */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Heart Rate (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Average Heart Rate (bpm)"
                value={averageHeartRate}
                onChange={(e) => setAverageHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                min={40}
                max={220}
                placeholder="e.g., 150"
              />
              <Input
                type="number"
                label="Max Heart Rate (bpm)"
                value={maxHeartRate}
                onChange={(e) => setMaxHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                min={40}
                max={220}
                placeholder="e.g., 180"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
              placeholder="How did it feel? Any observations?"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto sm:min-w-[200px] py-3">
              <Play className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Session'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="w-full sm:w-auto py-3"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {/* Badge Toast */}
      {badgeToast && (
        <div className="fixed bottom-6 right-6 bg-[#f59e0b] text-black px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <span className="text-lg">🏆</span>
          <span className="text-sm font-medium">Achievement Unlocked: {badgeToast}!</span>
        </div>
      )}
    </div>
  );
}
