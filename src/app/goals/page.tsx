'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GoalCard } from '@/components/metrics/GoalCard';
import { Goal, GoalCategory, GoalStatus } from '@/lib/types/metrics';
import {
  getGoals,
  getGoalsStats,
  updateGoalProgress,
  completeGoal,
  abandonGoal,
  deleteGoal,
} from '@/lib/supabase/goalsQueries';
import { GOAL_CATEGORIES, GOAL_CATEGORY_LABELS } from '@/lib/constants/goals';
import { Select } from '@/components/ui/Select';
import { Plus, Target, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import Link from 'next/link';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<GoalCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('active');
  const [showCompletedSection, setShowCompletedSection] = useState(false);

  useEffect(() => {
    loadGoals();
  }, [categoryFilter, statusFilter]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const filters = {
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        includeCompleted: statusFilter === 'all' || statusFilter === 'completed',
      };

      const [goalsRes, statsRes] = await Promise.all([getGoals(filters), getGoalsStats()]);

      if (goalsRes.data) setGoals(goalsRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    const { error } = await updateGoalProgress({ id: goalId, current_value: newValue });
    if (!error) {
      loadGoals();
    } else {
      alert('Error updating progress: ' + error.message);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    if (!confirm('Mark this goal as completed?')) return;

    const { error } = await completeGoal(goalId);
    if (!error) {
      loadGoals();
    } else {
      alert('Error completing goal: ' + error.message);
    }
  };

  const handleAbandonGoal = async (goalId: string) => {
    if (!confirm('Mark this goal as abandoned?')) return;

    const { error } = await abandonGoal(goalId);
    if (!error) {
      loadGoals();
    } else {
      alert('Error abandoning goal: ' + error.message);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Delete this goal permanently?')) return;

    const { error } = await deleteGoal(goalId);
    if (!error) {
      loadGoals();
    } else {
      alert('Error deleting goal: ' + error.message);
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#1a1a24] rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-white/60">Set targets and track your progress</p>
        <Link href="/goals/new">
          <Button className="px-4 py-2 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <Target className="w-5 h-5 text-red-400 mb-2" />
          <div className="text-2xl font-bold text-white">{stats?.activeGoals || 0}</div>
          <div className="text-sm text-gray-400">active {(stats?.activeGoals || 0) === 1 ? 'goal' : 'goals'}</div>
        </Card>

        <Card className="p-4">
          <CheckCircle2 className="w-5 h-5 text-[#22c55e] mb-2" />
          <div className="text-2xl font-bold text-white">
            {stats?.goalsCompletedThisMonth || 0}
          </div>
          <div className="text-sm text-gray-400">completed this month</div>
        </Card>

        <Card className="p-4">
          <AlertCircle className="w-5 h-5 text-[#f59e0b] mb-2" />
          <div className="text-2xl font-bold text-white">
            {stats?.upcomingDeadlines || 0}
          </div>
          <div className="text-sm text-gray-400">upcoming {(stats?.upcomingDeadlines || 0) === 1 ? 'deadline' : 'deadlines'} (30d)</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-white/60" />
          <h3 className="text-sm font-medium text-white/80">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value as GoalCategory | 'all')}
              options={[
                { value: 'all', label: 'All Categories' },
                ...GOAL_CATEGORIES.map((cat) => ({
                  value: cat,
                  label: GOAL_CATEGORY_LABELS[cat],
                })),
              ]}
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as GoalStatus | 'all')}
              options={[
                { value: 'active', label: 'Active Only' },
                { value: 'completed', label: 'Completed Only' },
                { value: 'abandoned', label: 'Abandoned Only' },
                { value: 'all', label: 'All Statuses' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Active Goals */}
      {statusFilter === 'active' || statusFilter === 'all' ? (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Active Goals ({activeGoals.length})
          </h2>
          {activeGoals.length === 0 ? (
            <Card className="p-6">
              <p className="text-white/60 text-center">
                No active goals yet.{' '}
                <Link href="/goals/new" className="text-red-400 hover:text-red-300 underline">
                  Create your first goal
                </Link>
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdateProgress={handleUpdateProgress}
                  onComplete={handleCompleteGoal}
                  onAbandon={handleAbandonGoal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Completed Goals */}
      {(statusFilter === 'completed' || statusFilter === 'all') && completedGoals.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Completed Goals ({completedGoals.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompletedSection(!showCompletedSection)}
            >
              {showCompletedSection ? 'Hide' : 'Show'}
            </Button>
          </div>
          {showCompletedSection && (
            <div className="space-y-4">
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
