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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Goals</h1>
        </div>
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Goals</h1>
        <Link href="/goals/new">
          <Button variant="primary" className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-5 h-5 mr-2" />
            Create Goal
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats?.activeGoals || 0}</div>
          <div className="text-sm text-white/60">Active Goals</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats?.goalsCompletedThisMonth || 0}
          </div>
          <div className="text-sm text-white/60">Completed This Month</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats?.upcomingDeadlines || 0}
          </div>
          <div className="text-sm text-white/60">Upcoming Deadlines (30d)</div>
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
            <label className="block text-sm text-white/60 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as GoalCategory | 'all')}
              className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {GOAL_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GoalStatus | 'all')}
              className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
              <option value="abandoned">Abandoned Only</option>
              <option value="all">All Statuses</option>
            </select>
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
                <Link href="/goals/new" className="text-blue-400 hover:text-blue-300 underline">
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
