'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BodyMetricCard } from '@/components/metrics/BodyMetricCard';
import { WeightTrendChart } from '@/components/metrics/WeightTrendChart';
import { BodyMetric, CreateBodyMetricInput } from '@/lib/types/metrics';
import {
  getBodyMetrics,
  getBodyMetricsStats,
  getWeightTrend,
  createBodyMetric,
  deleteBodyMetric,
} from '@/lib/supabase/metricsQueries';
import { supabase } from '@/lib/supabase/client';
import {
  User,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  X,
  Calendar,
  Percent,
  StickyNote,
  Download,
  Bell,
  BellOff,
} from 'lucide-react';
import { getTrainingSessions } from '@/lib/supabase/queries';
import { getCardioLogs } from '@/lib/supabase/cardioQueries';
import { getStrengthLogs } from '@/lib/supabase/strength-queries';
import { getGoals } from '@/lib/supabase/goalsQueries';
import {
  exportTrainingSessions,
  exportCardioLogs,
  exportStrengthLogs,
  exportBodyMetrics,
  exportGoals,
} from '@/lib/utils/exportCsv';
import {
  getReminderSettings,
  saveReminderSettings,
  requestNotificationPermission,
  getNotificationPermission,
} from '@/lib/utils/notifications';

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:00');

  // Form state
  const [formData, setFormData] = useState<CreateBodyMetricInput>({
    metric_date: new Date().toISOString().split('T')[0],
    weight: 0,
    body_fat_percentage: undefined,
    notes: '',
  });

  useEffect(() => {
    loadUserData();
    loadBodyMetrics();
    const settings = getReminderSettings();
    setReminderEnabled(settings.enabled);
    setReminderTime(settings.time);
  }, []);

  const loadUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadBodyMetrics = async () => {
    setLoading(true);
    try {
      const [metricsRes, statsRes, trendRes] = await Promise.all([
        getBodyMetrics({ limit: 10 }),
        getBodyMetricsStats(),
        getWeightTrend(90),
      ]);

      if (metricsRes.data) setMetrics(metricsRes.data);
      if (statsRes.data) setStats(statsRes.data);
      if (trendRes.data) setTrendData(trendRes.data);
    } catch (error) {
      console.error('Error loading body metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.weight <= 0) return;

    setSaving(true);
    try {
      const { error } = await createBodyMetric(formData);
      if (!error) {
        setShowAddModal(false);
        setFormData({
          metric_date: new Date().toISOString().split('T')[0],
          weight: 0,
          body_fat_percentage: undefined,
          notes: '',
        });
        loadBodyMetrics();
      } else {
        alert('Error saving metric: ' + error.message);
      }
    } catch (error) {
      console.error('Error adding metric:', error);
      alert('Error saving metric');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMetric = async (metricId: string) => {
    if (!confirm('Delete this body metric entry?')) return;

    const { error } = await deleteBodyMetric(metricId);
    if (!error) {
      loadBodyMetrics();
    } else {
      alert('Error deleting metric: ' + error.message);
    }
  };

  const handleExport = async (type: string) => {
    setExporting(type);
    try {
      switch (type) {
        case 'training': {
          const { data } = await getTrainingSessions({});
          if (data && data.length > 0) exportTrainingSessions(data);
          else alert('No training sessions to export.');
          break;
        }
        case 'cardio': {
          const { data } = await getCardioLogs({});
          if (data && data.length > 0) exportCardioLogs(data);
          else alert('No cardio logs to export.');
          break;
        }
        case 'strength': {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const logs = await getStrengthLogs(authUser.id);
            if (logs && logs.length > 0) exportStrengthLogs(logs);
            else alert('No strength logs to export.');
          }
          break;
        }
        case 'metrics': {
          const { data } = await getBodyMetrics({});
          if (data && data.length > 0) exportBodyMetrics(data);
          else alert('No body metrics to export.');
          break;
        }
        case 'goals': {
          const { data } = await getGoals({});
          if (data && data.length > 0) exportGoals(data);
          else alert('No goals to export.');
          break;
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleToggleReminder = async () => {
    if (!reminderEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert('Please allow notifications in your browser settings to enable reminders.');
        return;
      }
    }
    const newEnabled = !reminderEnabled;
    setReminderEnabled(newEnabled);
    saveReminderSettings({
      enabled: newEnabled,
      time: reminderTime,
      lastChecked: null,
    });
  };

  const handleReminderTimeChange = (time: string) => {
    setReminderTime(time);
    saveReminderSettings({
      enabled: reminderEnabled,
      time,
      lastChecked: null,
    });
  };

  const getTrendIcon = () => {
    if (!stats) return null;
    switch (stats.trendDirection) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-orange-400" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-blue-400" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendText = () => {
    if (!stats) return 'No trend data';
    switch (stats.trendDirection) {
      case 'up':
        return 'Gaining';
      case 'down':
        return 'Losing';
      default:
        return 'Stable';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Profile & Body Metrics</h1>
        </div>
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Profile & Body Metrics</h1>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Body Metric
        </Button>
      </div>

      {/* User Profile Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/80">
            <span className="text-white/60">Email:</span>
            <span>{user?.email || 'Not available'}</span>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Scale className="w-8 h-8 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats?.currentWeight ? `${stats.currentWeight} lbs` : 'N/A'}
          </div>
          <div className="text-sm text-white/60">Current Weight</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            {getTrendIcon()}
          </div>
          <div className="text-3xl font-bold text-white mb-1">{getTrendText()}</div>
          <div className="text-sm text-white/60">7-Day Trend</div>
          {stats?.weightChange7Days && (
            <div className="text-sm text-white/60 mt-1">
              {stats.weightChange7Days > 0 ? '+' : ''}
              {stats.weightChange7Days.toFixed(1)} lbs
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Scale className="w-8 h-8 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats?.currentWeight ? `${stats.currentWeight} lbs` : '---'}
          </div>
          <div className="text-sm text-white/60">Goal Weight</div>
          {stats?.currentWeight && (
            <div className="text-xs text-white/40 mt-1">Set in goals</div>
          )}
        </Card>
      </div>

      {/* Body Fat (optional, only if logged) */}
      {stats?.latestBodyFat && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Percent className="w-5 h-5 text-white/40" />
            <div>
              <span className="text-sm text-white/60">Body Fat: </span>
              <span className="text-sm font-medium text-white">{stats.latestBodyFat}%</span>
            </div>
          </div>
        </Card>
      )}

      {/* Weight Trend Chart */}
      {trendData.length > 0 && <WeightTrendChart data={trendData} />}

      {/* Recent Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Metrics</h2>
        {metrics.length === 0 ? (
          <Card className="p-6">
            <p className="text-white/60 text-center">
              No body metrics logged yet. Click &ldquo;Log Body Metric&rdquo; to get started!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {metrics.map((metric) => (
              <BodyMetricCard
                key={metric.id}
                metric={metric}
                onDelete={handleDeleteMetric}
                showTrend={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Training Reminders */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-6 h-6 text-warning" />
          <h2 className="text-xl font-semibold text-white">Training Reminders</h2>
        </div>
        <p className="text-white/60 text-sm mb-4">
          Get a daily reminder if you haven&apos;t logged any training.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleReminder}
            className={`flex items-center gap-2 px-4 py-2 rounded-button font-medium text-sm transition-all duration-150 ${
              reminderEnabled
                ? 'bg-warning/20 text-warning border border-warning/30'
                : 'bg-white/10 text-white/60 border border-white/[0.08] hover:border-white/20'
            }`}
          >
            {reminderEnabled ? (
              <>
                <Bell className="w-4 h-4" />
                Enabled
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4" />
                Disabled
              </>
            )}
          </button>
          {reminderEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Remind at:</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => handleReminderTimeChange(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-input px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-warning"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Export Data */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-6 h-6 text-accent-blue" />
          <h2 className="text-xl font-semibold text-white">Export Data</h2>
        </div>
        <p className="text-white/60 text-sm mb-4">
          Download your data as CSV files for backup or analysis.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: 'training', label: 'Training Sessions' },
            { key: 'cardio', label: 'Cardio Logs' },
            { key: 'strength', label: 'Strength Logs' },
            { key: 'metrics', label: 'Body Metrics' },
            { key: 'goals', label: 'Goals' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleExport(key)}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-button text-sm text-white/80 hover:border-white/20 hover:bg-white/10 transition-all duration-150 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting === key ? 'Exporting...' : label}
            </button>
          ))}
        </div>
      </Card>

      {/* Add Metric Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Log Body Metric</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMetric} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.metric_date}
                  onChange={(e) => setFormData({ ...formData, metric_date: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Scale className="w-4 h-4 inline mr-1" />
                  Weight (lbs) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })
                  }
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Body Fat % */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Body Fat % (optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.body_fat_percentage || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      body_fat_percentage: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <StickyNote className="w-4 h-4 inline mr-1" />
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-input px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How are you feeling? Any changes?"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving || formData.weight <= 0}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {saving ? 'Saving...' : 'Save Metric'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
