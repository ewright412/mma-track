'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ChevronRight, CheckCircle2, Calendar } from 'lucide-react';
import { getReviewsDueCount, getNextReviewDate } from '@/lib/supabase/reviewQueries';

export function ReviewReminderCard() {
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [nextReviewDate, setNextReviewDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviewData();
  }, []);

  const loadReviewData = async () => {
    setLoading(true);
    const [countRes, dateRes] = await Promise.all([
      getReviewsDueCount(),
      getNextReviewDate(),
    ]);

    if (countRes.data !== null) {
      setReviewCount(countRes.data);
    }

    if (dateRes.data) {
      setNextReviewDate(dateRes.data);
    }

    setLoading(false);
  };

  const formatNextReviewDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reviewDate = new Date(date);
    reviewDate.setHours(0, 0, 0, 0);

    const diffTime = reviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="mb-6 bg-[#1a1a24] border border-white/[0.08] rounded-lg p-6 animate-pulse">
        <div className="h-6 w-32 bg-white/5 rounded mb-2" />
        <div className="h-4 w-48 bg-white/5 rounded" />
      </div>
    );
  }

  // Don't show card if no reviews at all
  if (reviewCount === 0 && !nextReviewDate) {
    return null;
  }

  // Reviews are due
  if (reviewCount > 0) {
    return (
      <Link
        href="/learn/review"
        className="block mb-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-lg p-6 hover:border-orange-500/50 transition-all group"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Trophy className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {reviewCount} {reviewCount === 1 ? 'Technique' : 'Techniques'} to Review
                </h3>
                <p className="text-sm text-gray-400">Keep your skills sharp with spaced repetition</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-orange-400 font-medium text-sm">
              <span>Start Review Session</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/30 animate-pulse">
              <span className="text-xl font-bold text-orange-400">{reviewCount}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // No reviews due, show next review date
  return (
    <div className="mb-6 bg-[#1a1a24] border border-green-500/20 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
              <p className="text-sm text-gray-400">No reviews due today</p>
            </div>
          </div>

          {nextReviewDate && (
            <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Next review: {formatNextReviewDate(nextReviewDate)}</span>
            </div>
          )}
        </div>

        <Link
          href="/learn"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all text-sm"
        >
          <Trophy className="w-4 h-4" />
          Skill Tree
        </Link>
      </div>
    </div>
  );
}
