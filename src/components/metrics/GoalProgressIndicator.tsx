'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Goal } from '@/lib/types/metrics';
import {
  calculateGoalProgress,
  calculateDaysRemaining,
  getGoalUrgency,
  formatDaysRemaining,
  getProgressBarColor,
} from '@/lib/constants/goals';
import { Target, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface GoalProgressIndicatorProps {
  goals: Goal[];
  maxDisplay?: number;
}

export function GoalProgressIndicator({ goals, maxDisplay = 3 }: GoalProgressIndicatorProps) {
  // Filter active goals and sort by urgency
  const activeGoals = goals
    .filter((g) => g.status === 'active')
    .sort((a, b) => {
      const daysA = calculateDaysRemaining(a.target_date) ?? 9999;
      const daysB = calculateDaysRemaining(b.target_date) ?? 9999;
      return daysA - daysB; // Closest deadline first
    })
    .slice(0, maxDisplay);

  const upcomingDeadlines = goals.filter((g) => {
    if (g.status !== 'active' || !g.target_date) return false;
    const days = calculateDaysRemaining(g.target_date);
    return days !== null && days >= 0 && days <= 30;
  }).length;

  if (activeGoals.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Active Goals
          </h3>
        </div>
        <p className="text-white/60 text-sm text-center py-4">
          No active goals yet.{' '}
          <Link href="/goals/new" className="text-blue-400 hover:text-blue-300 underline">
            Create your first goal
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Active Goals
        </h3>
        <Link
          href="/goals"
          className="text-sm text-blue-400 hover:text-blue-300 transition-default"
        >
          View All
        </Link>
      </div>

      {upcomingDeadlines > 0 && (
        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-default">
          <div className="flex items-center gap-2 text-orange-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>
              {upcomingDeadlines} goal{upcomingDeadlines > 1 ? 's' : ''} due in the next 30 days
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {activeGoals.map((goal) => {
          const progress = calculateGoalProgress(goal.current_value, goal.target_value, 0);
          const daysRemaining = calculateDaysRemaining(goal.target_date);
          const urgency = getGoalUrgency(daysRemaining);
          const daysRemainingText = formatDaysRemaining(daysRemaining);

          return (
            <div
              key={goal.id}
              className="p-3 bg-white/5 rounded-default border border-white/10 hover:border-white/20 transition-default"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium text-white line-clamp-1 flex-1">
                  {goal.title}
                </h4>
                {daysRemaining !== null && (
                  <span className={`text-xs ${urgency.textColor} whitespace-nowrap`}>
                    {daysRemainingText}
                  </span>
                )}
              </div>

              {goal.target_value && (
                <>
                  <div className="flex items-center justify-between mb-2 text-xs text-white/60">
                    <span>
                      {goal.current_value || 0} / {goal.target_value} {goal.unit}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressBarColor(progress)} transition-all duration-500`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-center">
        <Link
          href="/goals"
          className="text-sm text-blue-400 hover:text-blue-300 transition-default inline-flex items-center gap-1"
        >
          <TrendingUp className="w-4 h-4" />
          Manage All Goals
        </Link>
      </div>
    </Card>
  );
}
