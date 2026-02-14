'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  OPPONENT_SKILL_LEVELS,
  SPARRING_TYPES,
  SPARRING_TYPE_CATEGORIES,
  getRatingColor,
} from '@/lib/constants/sparring';
import { createSparringSession } from '@/lib/supabase/sparringQueries';
import { checkAndAwardBadges } from '@/lib/supabase/badgeQueries';
import { BADGE_MAP } from '@/lib/constants/badges';
import { supabase } from '@/lib/supabase/client';
import { CreateSparringSessionInput, OpponentSkillLevel, SparringType } from '@/lib/types/sparring';
import { Plus, Minus } from 'lucide-react';

interface RoundRating {
  round_number: number;
  ratings: Record<string, number>;
  notes: string;
}

function makeDefaultRound(roundNumber: number, sparringType: SparringType): RoundRating {
  const categories = SPARRING_TYPE_CATEGORIES[sparringType];
  const ratings: Record<string, number> = {};
  categories.forEach((cat) => {
    ratings[cat.key] = 5;
  });
  return { round_number: roundNumber, ratings, notes: '' };
}

export default function NewSparringSessionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  const [sparringType, setSparringType] = useState<SparringType>('mma');
  const [sessionDate, setSessionDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [opponentSkillLevel, setOpponentSkillLevel] = useState<OpponentSkillLevel>('Intermediate');
  const [totalRounds, setTotalRounds] = useState(3);
  const [notes, setNotes] = useState('');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [rounds, setRounds] = useState<RoundRating[]>([
    makeDefaultRound(1, 'mma'),
    makeDefaultRound(2, 'mma'),
    makeDefaultRound(3, 'mma'),
  ]);

  const categories = SPARRING_TYPE_CATEGORIES[sparringType];

  const handleSparringTypeChange = (newType: SparringType) => {
    setSparringType(newType);
    // Rebuild rounds with the new type's categories
    const newCategories = SPARRING_TYPE_CATEGORIES[newType];
    setRounds((prev) =>
      prev.map((round) => {
        const newRatings: Record<string, number> = {};
        newCategories.forEach((cat) => {
          // Preserve rating if the same key exists, otherwise default to 5
          newRatings[cat.key] = round.ratings[cat.key] ?? 5;
        });
        return { ...round, ratings: newRatings };
      })
    );
  };

  const handleTotalRoundsChange = (newTotal: number) => {
    const validated = Math.max(1, Math.min(20, newTotal));
    setTotalRounds(validated);

    const currentLength = rounds.length;
    if (validated > currentLength) {
      const newRounds = [...rounds];
      for (let i = currentLength + 1; i <= validated; i++) {
        newRounds.push(makeDefaultRound(i, sparringType));
      }
      setRounds(newRounds);
    } else if (validated < currentLength) {
      setRounds(rounds.slice(0, validated));
    }
  };

  const handleRatingChange = (roundNumber: number, key: string, value: number) => {
    setRounds(
      rounds.map((r) =>
        r.round_number === roundNumber
          ? { ...r, ratings: { ...r.ratings, [key]: value } }
          : r
      )
    );
  };

  const handleRoundNotesChange = (roundNumber: number, value: string) => {
    setRounds(
      rounds.map((r) =>
        r.round_number === roundNumber ? { ...r, notes: value } : r
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const input: CreateSparringSessionInput = {
        session_date: sessionDate,
        sparring_type: sparringType,
        total_rounds: totalRounds,
        opponent_skill_level: opponentSkillLevel,
        notes: notes.trim() || undefined,
        what_went_well: whatWentWell.trim() || undefined,
        what_to_improve: whatToImprove.trim() || undefined,
        rounds: rounds.map((r) => ({
          round_number: r.round_number,
          ratings: r.ratings,
          notes: r.notes.trim() || undefined,
        })),
      };

      const { data, error: submitError } = await createSparringSession(input);

      if (submitError) {
        setError(submitError.message);
        setIsSubmitting(false);
        return;
      }

      if (data) {
        // Check badges in background
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const newBadges = await checkAndAwardBadges(authUser.id);
          if (newBadges.length > 0) {
            const name = BADGE_MAP[newBadges[0]]?.name || newBadges[0];
            setBadgeToast(name);
            setTimeout(() => {
              setBadgeToast(null);
              router.push('/sparring');
            }, 2500);
            return;
          }
        }
        router.push('/sparring');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Log Sparring Session</h1>
          <p className="text-gray-500 text-sm">Rate your performance round by round</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Sparring Type Selector */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Sparring Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SPARRING_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleSparringTypeChange(type.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    sparringType === type.value
                      ? 'border-red-500 bg-red-500/10 text-white'
                      : 'border-white/10 bg-[#1a1a24] text-gray-400 hover:border-white/20 hover:text-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs mt-1 opacity-60">
                    {SPARRING_TYPE_CATEGORIES[type.value].map((c) => c.label).join(', ')}
                  </p>
                </button>
              ))}
            </div>
          </div>

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
                label="Opponent Skill Level"
                value={opponentSkillLevel}
                onChange={(value) => setOpponentSkillLevel(value as OpponentSkillLevel)}
                options={OPPONENT_SKILL_LEVELS.map((level) => ({ value: level, label: level }))}
                required
              />
            </div>

            {/* Total Rounds */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Total Rounds
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTotalRoundsChange(totalRounds - 1)}
                  disabled={totalRounds <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a1a24] border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <Input
                  type="number"
                  value={totalRounds}
                  onChange={(e) => handleTotalRoundsChange(Number(e.target.value))}
                  min={1}
                  max={20}
                  className="w-20 text-center"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleTotalRoundsChange(totalRounds + 1)}
                  disabled={totalRounds >= 20}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a1a24] border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-gray-500 text-sm">rounds</span>
              </div>
            </div>
          </div>

          {/* Round Ratings */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Round Ratings</h2>

            <div className="space-y-4">
              {rounds.map((round) => (
                <div key={round.round_number} className="bg-[#1a1a24] border border-white/10 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Round {round.round_number}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {categories.map(({ key, label, color }) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-medium text-gray-400">
                            {label}
                          </label>
                          <span
                            className="text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{ color, backgroundColor: `${color}20` }}
                          >
                            {round.ratings[key]}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={round.ratings[key]}
                          onChange={(e) =>
                            handleRatingChange(round.round_number, key, Number(e.target.value))
                          }
                          className="w-full h-1.5 rounded-xl appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, ${color}40, ${color})`,
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Round notes (optional)"
                      value={round.notes}
                      onChange={(e) => handleRoundNotesChange(round.round_number, e.target.value)}
                      className="w-full px-3 py-2 bg-[#0f0f13] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reflection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Reflection</h2>

            <div className="space-y-4">
              {/* What Went Well */}
              <div>
                <label className="block text-sm font-medium text-green-400 mb-1.5">
                  What Went Well
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500 rounded-full" />
                  <textarea
                    value={whatWentWell}
                    onChange={(e) => setWhatWentWell(e.target.value)}
                    placeholder="What did you do well?"
                    rows={3}
                    className="w-full pl-4 pr-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* What to Improve */}
              <div>
                <label className="block text-sm font-medium text-amber-400 mb-1.5">
                  What to Improve
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500 rounded-full" />
                  <textarea
                    value={whatToImprove}
                    onChange={(e) => setWhatToImprove(e.target.value)}
                    placeholder="What areas need more work?"
                    rows={3}
                    className="w-full pl-4 pr-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* General Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  General Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any other observations?"
                  rows={2}
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
                />
              </div>
            </div>
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
              {isSubmitting ? 'Saving...' : 'Save Sparring Session'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/sparring')}
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
