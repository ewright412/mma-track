'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Lock,
  CheckCircle2,
  Circle,
  Loader2,
  Star,
  ChevronRight,
} from 'lucide-react';
import { getNodesWithProgress } from '@/lib/supabase/nodeQueries';
import { SkillTreeNodeWithProgress } from '@/lib/types/learn';
import { DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { MASTERY_LEVELS, MASTERY_COLORS } from '@/lib/types/learn';
import { AuthGuard } from '@/components/auth/AuthGuard';

const difficultyColors = {
  Beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  Intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function SkillTreePage() {
  const router = useRouter();
  const [nodes, setNodes] = useState<SkillTreeNodeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');

  useEffect(() => {
    loadNodes();
  }, []);

  const loadNodes = async () => {
    setLoading(true);
    const { data, error } = await getNodesWithProgress();
    if (data && !error) {
      setNodes(data);
    } else {
      console.error('Failed to load skill tree:', error);
    }
    setLoading(false);
  };

  const getDisciplineColor = (discipline: string): string => {
    return DISCIPLINE_HEX_COLORS[discipline as keyof typeof DISCIPLINE_HEX_COLORS] || '#ef4444';
  };

  const getNodeStatus = (node: SkillTreeNodeWithProgress) => {
    if (!node.progress) {
      return {
        icon: Circle,
        color: 'text-gray-600',
        label: 'Not Started',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
      };
    }

    if (node.has_review_due) {
      return {
        icon: Star,
        color: 'text-orange-400',
        label: 'Review Due',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30 animate-pulse',
      };
    }

    if (node.progress.completed_at) {
      const masteryLevel = node.progress.mastery_level;
      return {
        icon: masteryLevel === 5 ? Star : CheckCircle2,
        color: MASTERY_COLORS[masteryLevel],
        label: MASTERY_LEVELS[masteryLevel],
        bgColor: masteryLevel === 5 ? 'bg-yellow-500/10' : 'bg-green-500/10',
        borderColor:
          masteryLevel === 5 ? 'border-yellow-500/30 shadow-yellow-500/20 shadow-lg' : 'border-green-500/20',
      };
    }

    return {
      icon: Circle,
      color: 'text-yellow-400',
      label: 'In Progress',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    };
  };

  const disciplines = ['All', ...new Set(nodes.map((n) => n.discipline))];

  const filteredNodes =
    selectedDiscipline === 'All'
      ? nodes
      : nodes.filter((n) => n.discipline === selectedDiscipline);

  // Group nodes by discipline for display
  const nodesByDiscipline = filteredNodes.reduce(
    (acc, node) => {
      if (!acc[node.discipline]) {
        acc[node.discipline] = [];
      }
      acc[node.discipline].push(node);
      return acc;
    },
    {} as Record<string, SkillTreeNodeWithProgress[]>
  );

  // Calculate stats
  const completedNodes = nodes.filter((n) => n.progress?.completed_at).length;
  const totalXP = nodes
    .filter((n) => n.progress?.completed_at)
    .reduce((sum, n) => sum + n.xp_reward, 0);
  const masteredNodes = nodes.filter((n) => n.progress?.mastery_level === 5).length;

  if (loading) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-red-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400">Loading skill tree...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Skill Tree</h1>
          </div>
          <p className="text-gray-400">
            Master MMA techniques through structured learning paths
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Nodes Completed</p>
            <p className="text-2xl font-bold text-white">
              {completedNodes} / {nodes.length}
            </p>
          </div>
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total XP Earned</p>
            <p className="text-2xl font-bold text-yellow-400">{totalXP} XP</p>
          </div>
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Mastered Techniques</p>
            <p className="text-2xl font-bold text-yellow-400">{masteredNodes}</p>
          </div>
        </div>

        {/* Discipline Filter */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-400 mb-3">Filter by Discipline</p>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((discipline) => (
              <button
                key={discipline}
                onClick={() => setSelectedDiscipline(discipline)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedDiscipline === discipline
                    ? 'bg-red-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {discipline}
              </button>
            ))}
          </div>
        </div>

        {/* Skill Tree Nodes */}
        {Object.keys(nodesByDiscipline).length === 0 ? (
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No nodes found for this discipline</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(nodesByDiscipline).map(([discipline, disciplineNodes]) => (
              <div key={discipline}>
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ color: getDisciplineColor(discipline) }}
                >
                  {discipline}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {disciplineNodes.map((node) => {
                    const status = getNodeStatus(node);
                    const StatusIcon = status.icon;
                    const lessonsCompleted = node.progress?.lessons_completed.length || 0;

                    return (
                      <Link
                        key={node.id}
                        href={`/learn/${node.id}`}
                        className={`block bg-[#1a1a24] border rounded-xl p-4 transition-all hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5 ${status.borderColor}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Node Name */}
                            <h3 className="text-lg font-bold text-white mb-2">{node.name}</h3>

                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium border ${
                                  difficultyColors[node.difficulty]
                                }`}
                              >
                                {node.difficulty}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium border ${status.bgColor} ${status.color}`}
                              >
                                {status.label}
                              </span>
                            </div>

                            {/* Progress */}
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                              <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-red-500 transition-all"
                                  style={{ width: `${(lessonsCompleted / 3) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs">{lessonsCompleted}/3</span>
                            </div>

                            {/* XP Reward */}
                            <p className="text-xs text-gray-500">+{node.xp_reward} XP</p>
                          </div>

                          {/* Status Icon */}
                          <div className="flex flex-col items-center gap-2">
                            <StatusIcon className={`w-6 h-6 ${status.color}`} />
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
