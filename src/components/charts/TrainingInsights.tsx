'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { TrainingInsight } from '@/lib/supabase/dashboardQueries';
import {
  Shuffle,
  Scale,
  Moon,
  Battery,
  Trophy,
  Dumbbell,
  Shield,
  Swords,
  Flag,
  Heart,
  TrendingUp,
  Lightbulb,
  Brain,
  X,
} from 'lucide-react';

const DISMISS_KEY = 'training-insights-dismissed';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface DismissedMap {
  [id: string]: number; // timestamp when dismissed
}

const ICON_MAP: Record<string, React.ElementType> = {
  Shuffle,
  Scale,
  Moon,
  Battery,
  Trophy,
  Dumbbell,
  Shield,
  Swords,
  Flag,
  Heart,
  TrendingUp,
};

const INSIGHT_STYLES: Record<
  TrainingInsight['type'],
  { borderColor: string; iconColor: string; bgColor: string }
> = {
  warning: {
    borderColor: 'border-orange-500/30',
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-500/5',
  },
  info: {
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/5',
  },
  success: {
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/5',
  },
};

interface TrainingInsightsProps {
  insights: TrainingInsight[];
}

export function TrainingInsights({ insights }: TrainingInsightsProps) {
  const [dismissed, setDismissed] = useState<DismissedMap>({});

  // Load dismissed state from localStorage, prune entries older than 7 days
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISS_KEY);
      if (stored) {
        const parsed: DismissedMap = JSON.parse(stored);
        const now = Date.now();
        const valid: DismissedMap = {};
        Object.entries(parsed).forEach(([id, timestamp]) => {
          if (now - timestamp < SEVEN_DAYS_MS) {
            valid[id] = timestamp;
          }
        });
        setDismissed(valid);
        localStorage.setItem(DISMISS_KEY, JSON.stringify(valid));
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = { ...prev, [id]: Date.now() };
      try {
        localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  const visibleInsights = insights
    .filter((insight) => !dismissed[insight.id])
    .slice(0, 3);

  if (visibleInsights.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">Coach&apos;s Corner</h2>
      </div>

      <div className="space-y-2">
        {visibleInsights.map((insight) => {
          const style = INSIGHT_STYLES[insight.type];
          const Icon = ICON_MAP[insight.icon] || Lightbulb;

          return (
            <div
              key={insight.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${style.borderColor} ${style.bgColor}`}
            >
              <Icon
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.iconColor}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90">
                  {insight.message}
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  {insight.advice}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(insight.id)}
                className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                aria-label="Dismiss insight"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
