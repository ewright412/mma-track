'use client';

import { useState, useEffect } from 'react';
import { Play, CheckCircle, Loader2 } from 'lucide-react';
import { DailyChallenge } from '@/lib/types/challenge';
import { createChallengeCompletion } from '@/lib/supabase/challengeQueries';
import { useToast } from '@/components/ui/Toast';

interface ChallengeTimerProps {
  challenge: DailyChallenge;
  completed: boolean;
  onCompleted: () => void;
}

export function ChallengeTimer({
  challenge,
  completed,
  onCompleted,
}: ChallengeTimerProps) {
  const { showToast } = useToast();
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(challenge.duration_minutes * 60);
  const [showCompletion, setShowCompletion] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setShowCompletion(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setTimerActive(true);
  };

  const handleComplete = async () => {
    setSubmitting(true);

    const { error } = await createChallengeCompletion({
      challenge_id: challenge.id,
      notes: notes.trim() || undefined,
    });

    if (!error) {
      setConfetti(true);
      setTimeout(() => {
        setConfetti(false);
        onCompleted();
      }, 2000);
    } else {
      showToast('Failed to save completion. Try again.', 'error');
    }

    setSubmitting(false);
  };

  const handleManualComplete = () => {
    setShowCompletion(true);
  };

  if (completed) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">
            Challenge Completed! +{challenge.points} points
          </span>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          Come back tomorrow for a new challenge
        </p>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="space-y-4">
        {confetti && (
          <div className="text-center mb-4">
            <div className="text-6xl animate-bounce">🏆</div>
            <p className="text-xl font-bold text-green-400 mt-2">
              Challenge Complete! +{challenge.points} points
            </p>
          </div>
        )}

        {!confetti && (
          <>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">
                Great work! How did it go?
              </h3>
              <p className="text-gray-400 text-sm">
                Optional: Add some notes about your experience
              </p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the challenge feel? What did you learn?"
              className="w-full px-4 py-3 bg-[#0f0f13] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
              rows={4}
            />

            <button
              onClick={handleComplete}
              disabled={submitting}
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Complete Challenge (+{challenge.points} pts)
                </>
              )}
            </button>
          </>
        )}
      </div>
    );
  }

  if (timerActive) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-6xl font-bold text-red-400 mb-2">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-gray-400">Time Remaining</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setTimerActive(false)}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
          >
            Pause
          </button>
          <button
            onClick={handleManualComplete}
            className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
          >
            Mark Complete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl font-bold text-white mb-2">
          {formatTime(timeRemaining)}
        </div>
        <p className="text-gray-400">
          {timeRemaining === challenge.duration_minutes * 60
            ? 'Ready to start?'
            : 'Paused'}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleStart}
          className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Start Challenge
        </button>
        <button
          onClick={handleManualComplete}
          className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
        >
          Skip Timer & Complete
        </button>
      </div>

      <p className="text-center text-xs text-gray-500">
        Timer is optional. You can complete the challenge anytime.
      </p>
    </div>
  );
}
