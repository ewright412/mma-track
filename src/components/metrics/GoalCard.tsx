'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Goal, GoalProgress } from '@/lib/types/metrics';
import {
  GOAL_CATEGORY_COLORS,
  GOAL_CATEGORY_TEXT_COLORS,
  GOAL_CATEGORY_LABELS,
  getOnTrackProgressColor,
  getGoalUrgency,
  formatDaysRemaining,
  calculateGoalProgress,
  calculateDaysRemaining,
} from '@/lib/constants/goals';
import {
  Target,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress?: (goalId: string, newValue: number) => void;
  onComplete?: (goalId: string) => void;
  onAbandon?: (goalId: string) => void;
  onDelete?: (goalId: string) => void;
}

export function GoalCard({
  goal,
  onUpdateProgress,
  onComplete,
  onAbandon,
  onDelete,
}: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [newProgressValue, setNewProgressValue] = useState(goal.current_value?.toString() || '');

  const categoryColorClass = GOAL_CATEGORY_COLORS[goal.category];
  const categoryTextClass = GOAL_CATEGORY_TEXT_COLORS[goal.category];
  const categoryLabel = GOAL_CATEGORY_LABELS[goal.category];

  // Detect "loss" goals: target is lower than current value (user wants to decrease)
  // For loss goals, we can't determine the starting value from a single current_value,
  // so show 0% when current > target (not yet reached) and 100% when current <= target (reached)
  const isLossGoal = goal.target_value != null && goal.current_value != null && goal.target_value < goal.current_value;
  const progress = isLossGoal
    ? 0
    : Math.min(100, calculateGoalProgress(goal.current_value, goal.target_value, 0));
  const daysRemaining = calculateDaysRemaining(goal.target_date);
  const urgency = getGoalUrgency(daysRemaining);
  const daysRemainingText = formatDaysRemaining(daysRemaining);

  // Calculate expected progress based on timeline elapsed
  const expectedProgress = (() => {
    if (!goal.target_date || !goal.created_at) return null;
    const totalDays = Math.max(1, Math.ceil(
      (new Date(goal.target_date).getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)
    ));
    const elapsed = totalDays - (daysRemaining ?? 0);
    return (elapsed / totalDays) * 100;
  })();

  const handleSaveProgress = () => {
    const value = parseFloat(newProgressValue);
    if (!isNaN(value) && onUpdateProgress) {
      onUpdateProgress(goal.id, value);
      setIsUpdatingProgress(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="hover:border-white/20 transition-default">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`${categoryColorClass} ${categoryTextClass} px-3 py-1 rounded-button text-sm font-medium`}
              >
                {categoryLabel}
              </span>
              {goal.status === 'completed' && (
                <Badge variant="default" className="bg-green-500/20 text-green-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
              {goal.status === 'abandoned' && (
                <Badge variant="default" className="bg-gray-500/20 text-gray-400">
                  <XCircle className="w-3 h-3 mr-1" />
                  Abandoned
                </Badge>
              )}
              {goal.status === 'active' && urgency.level === 'overdue' && (
                <Badge variant="default" className="bg-red-500/20 text-red-300">
                  <Clock className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm text-white/60 line-clamp-2">{goal.description}</p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/60 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>

        {/* Progress Bar */}
        {goal.target_value && (
          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <div className="flex items-center gap-2 text-white/70">
                <Target className="w-4 h-4" />
                <span>
                  {goal.current_value || 0} {goal.unit} → {goal.target_value} {goal.unit}
                </span>
              </div>
              <span className="text-white/60">{progress}% complete</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${getOnTrackProgressColor(progress, expectedProgress)} transition-all duration-500`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Target Date */}
        {goal.target_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-white/60" />
            <span className="text-white/70">{formatDate(goal.target_date)}</span>
            <span className={`${urgency.textColor} font-medium`}>{daysRemainingText}</span>
          </div>
        )}

        {/* Expanded Section */}
        {isExpanded && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            {goal.description && (
              <div>
                <p className="text-sm text-white/70">{goal.description}</p>
              </div>
            )}

            {/* Progress Details */}
            {goal.target_value && goal.status === 'active' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">Current</div>
                  <div className="text-lg font-bold text-white">
                    {goal.current_value ?? 0} <span className="text-xs text-white/50">{goal.unit}</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">Target</div>
                  <div className="text-lg font-bold text-blue-400">
                    {goal.target_value} <span className="text-xs text-white/50">{goal.unit}</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">
                    {daysRemaining !== null && daysRemaining >= 0 ? 'Days Left' : 'Status'}
                  </div>
                  <div className={`text-lg font-bold ${urgency.textColor}`}>
                    {daysRemaining !== null ? (daysRemaining >= 0 ? daysRemaining : 'Overdue') : 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {/* Trend Indicator */}
            {goal.target_value && goal.current_value !== undefined && goal.current_value !== null && daysRemaining !== null && goal.status === 'active' && (
              <div className="flex items-center gap-2 text-sm">
                {(() => {
                  const totalDays = goal.target_date && goal.created_at
                    ? Math.max(1, Math.ceil((new Date(goal.target_date).getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)))
                    : null;
                  const elapsed = totalDays ? totalDays - (daysRemaining ?? 0) : null;
                  const expectedProgress = totalDays && elapsed ? (elapsed / totalDays) * 100 : null;

                  if (progress >= 100) {
                    return <span className="text-green-400 font-medium">Goal reached!</span>;
                  }
                  if (expectedProgress !== null) {
                    if (progress >= expectedProgress + 10) {
                      return <span className="text-green-400 font-medium">Ahead of schedule</span>;
                    }
                    if (progress <= expectedProgress - 10) {
                      return <span className="text-orange-400 font-medium">Behind schedule</span>;
                    }
                    return <span className="text-blue-400 font-medium">On track</span>;
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Update Progress */}
            {goal.status === 'active' && goal.target_value && (
              <div className="bg-white/5 rounded-default p-3">
                {isUpdatingProgress ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newProgressValue}
                      onChange={(e) => setNewProgressValue(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="Current value"
                      className="flex-1 bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-white/60 text-sm">{goal.unit}</span>
                    <Button size="sm" variant="primary" onClick={handleSaveProgress}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsUpdatingProgress(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUpdatingProgress(true)}
                    className="w-full"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Update Progress
                  </Button>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 flex-wrap pt-1">
              {goal.status === 'active' && onComplete && (
                <button
                  onClick={() => onComplete(goal.id)}
                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  Mark Complete
                </button>
              )}

              {goal.status === 'active' && onAbandon && (
                <button
                  onClick={() => onAbandon(goal.id)}
                  className="text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  Abandon
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => onDelete(goal.id)}
                  className="text-xs text-red-400/60 hover:text-red-400 transition-colors ml-auto"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
