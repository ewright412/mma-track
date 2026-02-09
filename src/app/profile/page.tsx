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
  Edit2,
  MapPin,
  Shield,
  Swords,
  Trash2,
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
import { Competition, CreateCompetitionInput } from '@/lib/types/competition';
import {
  getCompetitions,
  createCompetition,
  deleteCompetition,
} from '@/lib/supabase/competitionQueries';

interface FighterProfile {
  displayName: string;
  weightClass: string;
  homeGym: string;
  stance: string;
  trainingSince: string;
  bio: string;
}

const WEIGHT_CLASSES = [
  '', 'Strawweight', 'Flyweight', 'Bantamweight', 'Featherweight',
  'Lightweight', 'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight',
];

const STANCES = ['', 'Orthodox', 'Southpaw', 'Switch'];

const DEFAULT_PROFILE: FighterProfile = {
  displayName: '',
  weightClass: '',
  homeGym: '',
  stance: '',
  trainingSince: '',
  bio: '',
};

function loadProfile(): FighterProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const stored = localStorage.getItem('mma_fighter_profile');
    return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveProfile(profile: FighterProfile) {
  localStorage.setItem('mma_fighter_profile', JSON.stringify(profile));
}

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
  const [profile, setProfile] = useState<FighterProfile>(DEFAULT_PROFILE);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<FighterProfile>(DEFAULT_PROFILE);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [showCompModal, setShowCompModal] = useState(false);
  const [compForm, setCompForm] = useState<CreateCompetitionInput>({
    name: '',
    competition_date: '',
    weight_class: '',
    target_weight: undefined,
    notes: '',
  });

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
    loadCompetitions();
    const settings = getReminderSettings();
    setReminderEnabled(settings.enabled);
    setReminderTime(settings.time);
    const loaded = loadProfile();
    setProfile(loaded);
    setProfileDraft(loaded);
  }, []);

  const handleSaveProfile = () => {
    saveProfile(profileDraft);
    setProfile(profileDraft);
    setEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setProfileDraft(profile);
    setEditingProfile(false);
  };

  const getInitials = () => {
    if (profile.displayName) {
      return profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

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

  const loadCompetitions = async () => {
    try {
      const { data } = await getCompetitions();
      if (data) setCompetitions(data);
    } catch (error) {
      console.error('Error loading competitions:', error);
    }
  };

  const handleAddCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compForm.name || !compForm.competition_date) return;

    try {
      const { error } = await createCompetition(compForm);
      if (!error) {
        setShowCompModal(false);
        setCompForm({ name: '', competition_date: '', weight_class: '', target_weight: undefined, notes: '' });
        loadCompetitions();
      } else {
        alert('Error saving competition: ' + error.message);
      }
    } catch (error) {
      console.error('Error adding competition:', error);
      alert('Error saving competition');
    }
  };

  const handleDeleteCompetition = async (id: string) => {
    if (!confirm('Delete this competition?')) return;
    const { error } = await deleteCompetition(id);
    if (!error) {
      loadCompetitions();
    } else {
      alert('Error deleting competition: ' + error.message);
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
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-48 bg-[#1a1a24] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#1a1a24] rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fighter ID Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-[#ef4444]/20 border-2 border-[#ef4444]/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-[#ef4444]">{getInitials()}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {profile.displayName || user?.email?.split('@')[0] || 'Fighter'}
              </h2>
              <p className="text-sm text-gray-400">{user?.email}</p>
              {profile.weightClass && (
                <span className="inline-block mt-1 text-xs font-medium text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded">
                  {profile.weightClass}
                </span>
              )}
            </div>
          </div>
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {editingProfile ? (
          <div className="space-y-4 pt-4 border-t border-white/[0.08]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={profileDraft.displayName}
                  onChange={e => setProfileDraft({ ...profileDraft, displayName: e.target.value })}
                  placeholder="Your name"
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Weight Class</label>
                <select
                  value={profileDraft.weightClass}
                  onChange={e => setProfileDraft({ ...profileDraft, weightClass: e.target.value })}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
                >
                  {WEIGHT_CLASSES.map(wc => (
                    <option key={wc} value={wc}>{wc || 'Select...'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Home Gym</label>
                <input
                  type="text"
                  value={profileDraft.homeGym}
                  onChange={e => setProfileDraft({ ...profileDraft, homeGym: e.target.value })}
                  placeholder="Your gym"
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stance</label>
                <select
                  value={profileDraft.stance}
                  onChange={e => setProfileDraft({ ...profileDraft, stance: e.target.value })}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
                >
                  {STANCES.map(s => (
                    <option key={s} value={s}>{s || 'Select...'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Training Since</label>
                <input
                  type="date"
                  value={profileDraft.trainingSince}
                  onChange={e => setProfileDraft({ ...profileDraft, trainingSince: e.target.value })}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Bio</label>
              <textarea
                value={profileDraft.bio}
                onChange={e => setProfileDraft({ ...profileDraft, bio: e.target.value })}
                rows={3}
                placeholder="A few words about yourself..."
                className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSaveProfile} className="px-4 py-2 text-sm font-medium">
                Save
              </Button>
              <Button variant="ghost" onClick={handleCancelProfile} className="px-4 py-2 text-sm font-medium">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/[0.08]">
            {profile.homeGym && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300">{profile.homeGym}</span>
              </div>
            )}
            {profile.stance && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300">{profile.stance}</span>
              </div>
            )}
            {profile.trainingSince && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300">Since {new Date(profile.trainingSince).getFullYear()}</span>
              </div>
            )}
            {profile.bio && (
              <div className="col-span-full">
                <p className="text-sm text-gray-400">{profile.bio}</p>
              </div>
            )}
            {!profile.homeGym && !profile.stance && !profile.trainingSince && !profile.bio && (
              <div className="col-span-full">
                <button
                  onClick={() => setEditingProfile(true)}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Click the edit icon to fill out your fighter profile
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Competitions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Swords className="w-5 h-5 text-[#ef4444]" />
            <h2 className="text-lg font-semibold text-white">Competitions</h2>
          </div>
          <Button onClick={() => setShowCompModal(true)} className="px-3 py-1.5 text-sm">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {competitions.length === 0 ? (
          <p className="text-sm text-gray-500">No competitions scheduled. Add one to start your countdown.</p>
        ) : (
          <div className="space-y-3">
            {competitions.map((comp) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const compDate = new Date(comp.competition_date + 'T00:00:00');
              const diffMs = compDate.getTime() - today.getTime();
              const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              const isPast = daysUntil < 0;

              return (
                <div
                  key={comp.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isPast ? 'border-white/[0.05] bg-white/[0.02] opacity-60' : 'border-white/[0.08] bg-white/5'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-white">{comp.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(comp.competition_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      {comp.weight_class && ` \u00B7 ${comp.weight_class}`}
                      {comp.target_weight && ` \u00B7 Target: ${comp.target_weight} lbs`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isPast && (
                      <span className={`text-sm font-medium ${
                        daysUntil < 14 ? 'text-[#ef4444]' : daysUntil < 30 ? 'text-[#f59e0b]' : 'text-[#3b82f6]'
                      }`}>
                        {daysUntil}d
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteCompetition(comp.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Competition Modal */}
      {showCompModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Add Competition</h2>
              <button onClick={() => setShowCompModal(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCompetition} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Name *</label>
                <input
                  type="text"
                  value={compForm.name}
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                  placeholder="e.g. First Amateur Fight"
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Date *</label>
                <input
                  type="date"
                  value={compForm.competition_date}
                  onChange={(e) => setCompForm({ ...compForm, competition_date: e.target.value })}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Weight Class</label>
                <select
                  value={compForm.weight_class}
                  onChange={(e) => setCompForm({ ...compForm, weight_class: e.target.value })}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
                >
                  {WEIGHT_CLASSES.map(wc => (
                    <option key={wc} value={wc}>{wc || 'Select...'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Target Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={compForm.target_weight || ''}
                  onChange={(e) => setCompForm({ ...compForm, target_weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-[#0f0f13] border border-white/[0.08] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ef4444]/50"
                  placeholder="Optional"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 px-4 py-2 text-sm font-medium">
                  Save
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowCompModal(false)} className="flex-1 px-4 py-2 text-sm font-medium">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Body Metrics Stats */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Body Metrics</h2>
        <Button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Metric
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <Scale className="w-5 h-5 text-[#3b82f6] mb-2" />
          <div className="text-2xl font-bold text-white">
            {stats?.currentWeight ? `${stats.currentWeight}` : '—'}
          </div>
          <div className="text-sm text-gray-400">{stats?.currentWeight ? 'lbs current' : 'no weight logged'}</div>
        </Card>

        <Card className="p-4">
          {getTrendIcon() || <Minus className="w-5 h-5 text-gray-400 mb-2" />}
          <div className="text-2xl font-bold text-white mt-2">{getTrendText()}</div>
          <div className="text-sm text-gray-400">
            7-day trend
            {stats?.weightChange7Days != null && (
              <span> ({stats.weightChange7Days > 0 ? '+' : ''}{stats.weightChange7Days.toFixed(1)} lbs)</span>
            )}
          </div>
        </Card>

        {stats?.latestBodyFat && (
          <Card className="p-4">
            <Percent className="w-5 h-5 text-[#f59e0b] mb-2" />
            <div className="text-2xl font-bold text-white">{stats.latestBodyFat}%</div>
            <div className="text-sm text-gray-400">body fat</div>
          </Card>
        )}
      </div>

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
