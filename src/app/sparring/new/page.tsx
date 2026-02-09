'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { OPPONENT_SKILL_LEVELS, RATING_COLORS, getRatingColor } from '@/lib/constants/sparring';
import { createSparringSession } from '@/lib/supabase/sparringQueries';
import { checkAndAwardBadges } from '@/lib/supabase/badgeQueries';
import { BADGE_MAP } from '@/lib/constants/badges';
import { supabase } from '@/lib/supabase/client';
import { CreateSparringSessionInput, OpponentSkillLevel } from '@/lib/types/sparring';
import { Plus, Minus } from 'lucide-react';

interface RoundRating {
  round_number: number;
  striking_offense: number;
  striking_defense: number;
  takedowns: number;
  ground_game: number;
  notes: string;
}

const RATING_FIELDS = [
  { key: 'striking_offense' as const, label: 'Striking Off', color: RATING_COLORS.striking_offense },
  { key: 'striking_defense' as const, label: 'Striking Def', color: RATING_COLORS.striking_defense },
  { key: 'takedowns' as const, label: 'Takedowns', color: RATING_COLORS.takedowns },
  { key: 'ground_game' as const, label: 'Ground Game', color: RATING_COLORS.ground_game },
];

export default function NewSparringSessionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

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
    { round_number: 1, striking_offense: 5, striking_defense: 5, takedowns: 5, ground_game: 5, notes: '' },
    { round_number: 2, striking_offense: 5, striking_defense: 5, takedowns: 5, ground_game: 5, notes: '' },
    { round_number: 3, striking_offense: 5, striking_defense: 5, takedowns: 5, ground_game: 5, notes: '' },
  ]);

  const handleTotalRoundsChange = (newTotal: number) => {
    const validated = Math.max(1, Math.min(20, newTotal));
    setTotalRounds(validated);

    const currentLength = rounds.length;
    if (validated > currentLength) {
      const newRounds = [...rounds];
      for (let i = currentLength + 1; i <= validated; i++) {
        newRounds.push({
          round_number: i,
          striking_offense: 5,
          striking_defense: 5,
          takedowns: 5,
          ground_game: 5,
          notes: '',
        });
      }
      setRounds(newRounds);
    } else if (validated < currentLength) {
      setRounds(rounds.slice(0, validated));
    }
  };

  const handleRatingChange = (
    roundNumber: number,
    field: 'striking_offense' | 'striking_defense' | 'takedowns' | 'ground_game',
    value: number
  ) => {
    setRounds(
      rounds.map((r) =>
        r.round_number === roundNumber ? { ...r, [field]: value } : r
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
        total_rounds: totalRounds,
        opponent_skill_level: opponentSkillLevel,
        notes: notes.trim() || undefined,
        what_went_well: whatWentWell.trim() || undefined,
        what_to_improve: whatToImprove.trim() || undefined,
        rounds: rounds.map((r) => ({
          round_number: r.round_number,
          striking_offense: r.striking_offense,
          striking_defense: r.striking_defense,
          takedowns: r.takedowns,
          ground_game: r.ground_game,
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
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1a24] border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
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
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1a1a24] border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
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
                <div key={round.round_number} className="bg-[#1a1a24] border border-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Round {round.round_number}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {RATING_FIELDS.map(({ key, label, color }) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-medium text-gray-400">
                            {label}
                          </label>
                          <span
                            className="text-xs font-bold px-1.5 py-0.5 rounded"
                            style={{ color, backgroundColor: `${color}20` }}
                          >
                            {round[key]}/10
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={round[key]}
                          onChange={(e) =>
                            handleRatingChange(round.round_number, key, Number(e.target.value))
                          }
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
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
                      className="w-full px-3 py-2 bg-[#0f0f13] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors"
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
                    className="w-full pl-4 pr-4 py-3 bg-[#1a1a24] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-colors resize-none"
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
                    className="w-full pl-4 pr-4 py-3 bg-[#1a1a24] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors resize-none"
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
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
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
        <div className="fixed bottom-6 right-6 bg-[#f59e0b] text-black px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <span className="text-lg">🏆</span>
          <span className="text-sm font-medium">Achievement Unlocked: {badgeToast}!</span>
        </div>
      )}
    </div>
  );
}
