'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreateGoalInput, GoalCategory } from '@/lib/types/metrics';
import { createGoal } from '@/lib/supabase/goalsQueries';
import { getBodyMetrics } from '@/lib/supabase/metricsQueries';
import {
  GOAL_CATEGORIES,
  GOAL_CATEGORY_LABELS,
  GOAL_EXAMPLES,
  COMMON_UNITS,
} from '@/lib/constants/goals';
import { Select } from '@/components/ui/Select';
import { Target, Calendar, TrendingUp, Type, FileText, Tag, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewGoalPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const hasFetchedWeight = useRef(false);
  const [formData, setFormData] = useState<CreateGoalInput>({
    title: '',
    description: '',
    category: 'other',
    target_value: undefined,
    current_value: undefined,
    unit: '',
    target_date: '',
  });

  // Fetch latest body weight for auto-fill on weight goals
  useEffect(() => {
    if (hasFetchedWeight.current) return;
    hasFetchedWeight.current = true;
    getBodyMetrics({ limit: 1 }).then(({ data }) => {
      if (data && data.length > 0) {
        setLatestWeight(data[0].weight);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      const { error } = await createGoal(formData);
      if (!error) {
        router.push('/goals');
      } else {
        alert('Error creating goal: ' + error.message);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Error creating goal');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryChange = (category: GoalCategory) => {
    const updates: Partial<CreateGoalInput> = { category };
    // Auto-fill current value and unit for weight goals
    if (category === 'weight' && latestWeight !== null) {
      updates.current_value = latestWeight;
      updates.unit = 'lbs';
    }
    setFormData({ ...formData, ...updates });
  };

  const examples = GOAL_EXAMPLES[formData.category] || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create New Goal</h1>
        <p className="text-white/60">
          Set a specific, measurable goal to track your progress over time.
        </p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Type className="w-4 h-4 inline mr-1" />
              Goal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Run 5K under 25 minutes"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {GOAL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`p-3 rounded-default border-2 transition-default text-left ${
                    formData.category === cat
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                  }`}
                >
                  <div className="text-sm font-medium">{GOAL_CATEGORY_LABELS[cat]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add details about your goal, why it matters, or how you'll achieve it..."
            />
          </div>

          {/* Target Value & Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Target Value *
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.target_value || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    target_value: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                onFocus={(e) => e.target.select()}
                className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 175"
                required
              />
            </div>

            <div>
              <Select
                label="Unit *"
                value={formData.unit}
                onChange={(value) => setFormData({ ...formData, unit: value })}
                placeholder="Select unit..."
                options={COMMON_UNITS.map((unit) => ({
                  value: unit,
                  label: unit,
                }))}
                required
              />
            </div>
          </div>

          {/* Current Value */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Current Value
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.current_value || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_value: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              onFocus={(e) => e.target.select()}
              className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your starting point (can update later)"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Target Date *
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              type="submit"
              variant="primary"
              disabled={saving || !formData.title.trim() || !formData.target_value || !formData.target_date}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              <Target className="w-5 h-5 mr-2" />
              {saving ? 'Creating...' : 'Create Goal'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/goals')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {/* Examples */}
      {examples.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Example {GOAL_CATEGORY_LABELS[formData.category]} Goals
          </h3>
          <ul className="space-y-2">
            {examples.map((example, index) => (
              <li key={index} className="text-sm text-white/60 flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
