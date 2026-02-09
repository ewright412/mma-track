'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CARDIO_TYPES, CARDIO_TEMPLATES, CARDIO_DURATION_PRESETS } from '@/lib/constants/cardio';
import { createCardioLog } from '@/lib/supabase/cardioQueries';
import { CreateCardioLogInput, CardioType, CardioTemplate } from '@/lib/types/cardio';
import { Zap, Play } from 'lucide-react';

export default function NewCardioLogPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setIsSubmitting(false);
        return;
      }

      if (data) {
        router.push('/cardio');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Log Cardio Session</h1>
          <p className="text-white/60">Track your conditioning work with detailed metrics</p>
        </div>

        {/* Templates */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Quick Templates</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CARDIO_TEMPLATES.map((template) => (
              <button
                key={template.name}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className="text-left p-3 bg-background border border-border rounded-lg hover:border-accent transition-default group flex flex-col justify-between min-h-[60px]"
              >
                <p className="text-sm font-medium text-white group-hover:text-accent transition-default">
                  {template.name}
                </p>
                <p className="text-xs text-white/40 mt-1">{template.duration_minutes} min</p>
              </button>
            ))}
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          {/* Session Details */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Session Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <Input
                type="date"
                label="Session Date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />

              {/* Cardio Type */}
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
              <label className="block text-sm font-medium text-white/80 mb-2">
                Duration (minutes)
              </label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {CARDIO_DURATION_PRESETS.map((preset) => (
                  <Badge
                    key={preset}
                    variant={durationMinutes === preset ? 'default' : 'info'}
                    className="cursor-pointer hover:bg-white/20"
                    onClick={() => setDurationMinutes(preset)}
                  >
                    {preset} min
                  </Badge>
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

            {/* Distance (optional) */}
            <div className="mt-4">
              <Input
                type="number"
                label="Distance (km) - Optional"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                step={0.1}
                placeholder="e.g., 5.0"
              />
              <p className="text-xs text-white/50 mt-1">
                Leave blank if not applicable (e.g., circuit training, heavy bag)
              </p>
            </div>

            {/* Intervals */}
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={intervals}
                  onChange={(e) => setIntervals(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-card text-accent focus:ring-accent focus:ring-offset-background"
                />
                <span className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Interval Training
                </span>
              </label>
            </div>

            {/* Interval Description */}
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
          </Card>

          {/* Heart Rate & Performance */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Heart Rate & Performance (Optional)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Average Heart Rate */}
              <Input
                type="number"
                label="Average Heart Rate (bpm)"
                value={averageHeartRate}
                onChange={(e) => setAverageHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                min={40}
                max={220}
                placeholder="e.g., 150"
              />

              {/* Max Heart Rate */}
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

            <p className="text-xs text-white/50 mt-2">
              Heart rate data helps track cardiovascular fitness over time
            </p>
          </Card>

          {/* Notes */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-background border border-border rounded-input text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-default"
              placeholder="How did it feel? Any observations?"
            />
          </Card>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Cardio Log'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
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
