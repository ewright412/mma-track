'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { OPPONENT_SKILL_LEVELS, getRatingColor } from '@/lib/constants/sparring';
import { createSparringSession } from '@/lib/supabase/sparringQueries';
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

export default function NewSparringSessionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
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

    // Adjust rounds array
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
        router.push('/sparring');
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
          <h1 className="text-3xl font-bold text-white mb-2">Log Sparring Session</h1>
          <p className="text-white/60">Track your sparring performance with detailed round-by-round ratings</p>
        </div>

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

              {/* Opponent Skill Level */}
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
              <label className="block text-sm font-medium text-white/80 mb-2">
                Total Rounds
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTotalRoundsChange(totalRounds - 1)}
                  disabled={totalRounds <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={totalRounds}
                  onChange={(e) => handleTotalRoundsChange(Number(e.target.value))}
                  min={1}
                  max={20}
                  className="w-20 text-center"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTotalRoundsChange(totalRounds + 1)}
                  disabled={totalRounds >= 20}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="text-white/60 text-sm">rounds</span>
              </div>
            </div>
          </Card>

          {/* Round Ratings */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Round-by-Round Ratings</h2>
            <p className="text-sm text-white/60 mb-4">Rate your performance in each category (1-10)</p>

            <div className="space-y-6">
              {rounds.map((round) => (
                <div key={round.round_number} className="bg-background border border-border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Round {round.round_number}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Striking Offense */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-white/80">
                          Striking Offense
                        </label>
                        <span
                          className="text-sm font-bold px-2 py-1 rounded"
                          style={{ color: getRatingColor(round.striking_offense) }}
                        >
                          {round.striking_offense}/10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={round.striking_offense}
                        onChange={(e) =>
                          handleRatingChange(round.round_number, 'striking_offense', Number(e.target.value))
                        }
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-500 to-green-500"
                      />
                    </div>

                    {/* Striking Defense */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-white/80">
                          Striking Defense
                        </label>
                        <span
                          className="text-sm font-bold px-2 py-1 rounded"
                          style={{ color: getRatingColor(round.striking_defense) }}
                        >
                          {round.striking_defense}/10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={round.striking_defense}
                        onChange={(e) =>
                          handleRatingChange(round.round_number, 'striking_defense', Number(e.target.value))
                        }
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-500 to-green-500"
                      />
                    </div>

                    {/* Takedowns */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-white/80">
                          Takedowns
                        </label>
                        <span
                          className="text-sm font-bold px-2 py-1 rounded"
                          style={{ color: getRatingColor(round.takedowns) }}
                        >
                          {round.takedowns}/10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={round.takedowns}
                        onChange={(e) =>
                          handleRatingChange(round.round_number, 'takedowns', Number(e.target.value))
                        }
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-500 to-green-500"
                      />
                    </div>

                    {/* Ground Game */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-white/80">
                          Ground Game
                        </label>
                        <span
                          className="text-sm font-bold px-2 py-1 rounded"
                          style={{ color: getRatingColor(round.ground_game) }}
                        >
                          {round.ground_game}/10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={round.ground_game}
                        onChange={(e) =>
                          handleRatingChange(round.round_number, 'ground_game', Number(e.target.value))
                        }
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-500 to-green-500"
                      />
                    </div>
                  </div>

                  {/* Round Notes */}
                  <Input
                    placeholder="Notes for this round (optional)"
                    value={round.notes}
                    onChange={(e) => handleRoundNotesChange(round.round_number, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Reflection */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Reflection</h2>

            <div className="space-y-4">
              {/* What Went Well */}
              <div>
                <label className="block text-sm font-medium text-success mb-1.5">
                  What Went Well?
                </label>
                <textarea
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  placeholder="What did you do well in this session?"
                  rows={3}
                  className="w-full bg-background border border-border rounded-input px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-success transition-default resize-none"
                />
              </div>

              {/* What to Improve */}
              <div>
                <label className="block text-sm font-medium text-warning mb-1.5">
                  What to Improve?
                </label>
                <textarea
                  value={whatToImprove}
                  onChange={(e) => setWhatToImprove(e.target.value)}
                  placeholder="What areas need more work?"
                  rows={3}
                  className="w-full bg-background border border-border rounded-input px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-warning transition-default resize-none"
                />
              </div>

              {/* General Notes */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  General Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any other observations about the session?"
                  rows={2}
                  className="w-full bg-background border border-border rounded-input px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent transition-default resize-none"
                />
              </div>
            </div>
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
              {isSubmitting ? 'Saving...' : 'Save Sparring Session'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/sparring')}
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
