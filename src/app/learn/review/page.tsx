'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Eye,
  Flame,
  ThumbsUp,
  Frown,
  Meh,
  CheckCircle2,
} from 'lucide-react';
import { getReviewsDue, submitReview, getNextReviewDate } from '@/lib/supabase/reviewQueries';
import { getLessonsForNode } from '@/lib/supabase/nodeQueries';
import { ReviewWithNode, LessonContent } from '@/lib/types/learn';
import { DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useToast } from '@/components/ui/Toast';

export default function ReviewPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<ReviewWithNode[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allComplete, setAllComplete] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [nextReviewDate, setNextReviewDate] = useState<string | null>(null);

  // Store lesson content for current review
  const [lessonContent, setLessonContent] = useState<LessonContent[]>([]);

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (currentReview) {
      loadLessonContent();
    }
  }, [currentIndex]);

  const loadReviews = async () => {
    setLoading(true);
    const { data, error } = await getReviewsDue();
    if (data && !error) {
      setReviews(data);
      if (data.length === 0) {
        setAllComplete(true);
        loadNextReviewDate();
      }
    } else {
      console.error('Failed to load reviews:', error);
    }
    setLoading(false);
  };

  const loadLessonContent = async () => {
    if (!currentReview) return;

    const { data } = await getLessonsForNode(currentReview.node.id);
    if (data) {
      setLessonContent(data);
    }
  };

  const loadNextReviewDate = async () => {
    const { data } = await getNextReviewDate();
    setNextReviewDate(data);
  };

  const handleSubmitReview = async (score: 0 | 3 | 4 | 5) => {
    if (!currentReview) return;

    setSubmitting(true);

    const { data, error } = await submitReview({
      node_id: currentReview.node.id,
      score,
    });

    setSubmitting(false);

    if (data && !error) {
      // Award XP
      setTotalXP(totalXP + data.xp_awarded);

      // Move to next review or show completion
      if (currentIndex < reviews.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowingAnswer(false);
      } else {
        setAllComplete(true);
        loadNextReviewDate();
      }
    } else {
      showToast('Failed to submit review. Try again.', 'error');
    }
  };

  const getDisciplineColor = (discipline: string): string => {
    return DISCIPLINE_HEX_COLORS[discipline as keyof typeof DISCIPLINE_HEX_COLORS] || '#ef4444';
  };

  const currentReview = reviews[currentIndex];

  // Get key points from lessons for the answer
  const getKeyPoints = (): string[] => {
    const keyPoints: string[] = [];
    lessonContent.forEach((lesson) => {
      if (lesson.content.points) {
        keyPoints.push(...lesson.content.points);
      }
    });
    return keyPoints.slice(0, 5); // Show max 5 key points
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-red-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400">Loading reviews...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // All reviews complete
  if (allComplete) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-[#1a1a24] border border-green-500/30 rounded-xl p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-3">All caught up! 🎯</h1>

            {reviews.length > 0 ? (
              <>
                <p className="text-lg text-gray-300 mb-6">
                  <span className="text-red-400 font-bold">{reviews.length}</span> techniques
                  reviewed
                </p>

                <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20 mb-6">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold">+{totalXP} XP Earned</span>
                </div>
              </>
            ) : (
              <p className="text-gray-300 mb-6">You have no reviews due today.</p>
            )}

            {nextReviewDate && (
              <p className="text-sm text-gray-500 mb-6">
                Next review due:{' '}
                {new Date(nextReviewDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}

            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold"
            >
              Back to Skill Tree
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Skill Tree
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Review Session</h1>
              <p className="text-gray-400 text-sm">
                Keep your skills sharp with spaced repetition
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-xl font-bold text-white">
                {currentIndex + 1} / {reviews.length}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / reviews.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-400 font-medium">
              {Math.round(((currentIndex + 1) / reviews.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Review Card */}
        {currentReview && (
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-8">
            {/* Discipline Badge */}
            <div className="flex justify-center mb-6">
              <span
                className="px-4 py-2 rounded-xl text-sm font-medium border"
                style={{
                  backgroundColor: `${getDisciplineColor(currentReview.node.discipline)}20`,
                  borderColor: `${getDisciplineColor(currentReview.node.discipline)}40`,
                  color: getDisciplineColor(currentReview.node.discipline),
                }}
              >
                {currentReview.node.discipline}
              </span>
            </div>

            {/* Technique Name */}
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              {currentReview.node.name}
            </h2>

            {/* Question */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <p className="text-lg text-gray-300 text-center">
                What do you remember about <span className="text-red-400">this technique</span>?
              </p>
            </div>

            {/* Show Answer Button */}
            {!showingAnswer ? (
              <button
                onClick={() => setShowingAnswer(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold text-lg"
              >
                <Eye className="w-5 h-5" />
                Show Answer
              </button>
            ) : (
              <>
                {/* Answer */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-green-400 mb-4">Key Points:</h3>
                  <div className="space-y-3">
                    {getKeyPoints().map((point, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-green-400">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-300 flex-1">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating Buttons */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 text-center mb-4">
                    How well did you remember?
                  </p>

                  <button
                    onClick={() => handleSubmitReview(0)}
                    disabled={submitting}
                    className="w-full flex items-center justify-between px-6 py-4 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <Frown className="w-6 h-6" />
                      <div className="text-left">
                        <p className="font-semibold">Forgot 😕</p>
                        <p className="text-xs text-red-400/70">
                          Couldn&apos;t remember key points
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-red-400/70">Again in 1 day</span>
                  </button>

                  <button
                    onClick={() => handleSubmitReview(3)}
                    disabled={submitting}
                    className="w-full flex items-center justify-between px-6 py-4 bg-yellow-500/10 text-yellow-400 rounded-xl hover:bg-yellow-500/20 border border-yellow-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <Meh className="w-6 h-6" />
                      <div className="text-left">
                        <p className="font-semibold">Hard 🤔</p>
                        <p className="text-xs text-yellow-400/70">Remembered but struggled</p>
                      </div>
                    </div>
                    <span className="text-xs text-yellow-400/70">
                      Again in {currentReview.interval_days} days
                    </span>
                  </button>

                  <button
                    onClick={() => handleSubmitReview(4)}
                    disabled={submitting}
                    className="w-full flex items-center justify-between px-6 py-4 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 border border-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <ThumbsUp className="w-6 h-6" />
                      <div className="text-left">
                        <p className="font-semibold">Good 👍</p>
                        <p className="text-xs text-green-400/70">Remembered well</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-400/70">
                      Again in {Math.round(currentReview.interval_days * currentReview.ease_factor)}{' '}
                      days
                    </span>
                  </button>

                  <button
                    onClick={() => handleSubmitReview(5)}
                    disabled={submitting}
                    className="w-full flex items-center justify-between px-6 py-4 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 border border-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <Flame className="w-6 h-6" />
                      <div className="text-left">
                        <p className="font-semibold">Easy 🔥</p>
                        <p className="text-xs text-blue-400/70">Knew it instantly</p>
                      </div>
                    </div>
                    <span className="text-xs text-blue-400/70">
                      Again in{' '}
                      {Math.round(
                        currentReview.interval_days * currentReview.ease_factor * 1.3
                      )}{' '}
                      days
                    </span>
                  </button>

                  {submitting && (
                    <div className="flex items-center justify-center gap-2 text-gray-400 mt-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
