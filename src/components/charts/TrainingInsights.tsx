'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrainingInsight } from '@/lib/supabase/dashboardQueries';
import {
  AlertTriangle,
  Info,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

interface TrainingInsightsProps {
  insights: TrainingInsight[];
}

const INSIGHT_STYLES: Record<
  TrainingInsight['type'],
  { icon: React.ElementType; borderColor: string; iconColor: string; bgColor: string }
> = {
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-orange-500/30',
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-500/5',
  },
  info: {
    icon: Info,
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/5',
  },
  success: {
    icon: CheckCircle,
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/5',
  },
};

export function TrainingInsights({ insights }: TrainingInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">Areas to Focus</h2>
      </div>

      <div className="space-y-2">
        {insights.map((insight, index) => {
          const style = INSIGHT_STYLES[insight.type];
          const Icon = style.icon;

          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border ${style.borderColor} ${style.bgColor}`}
            >
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
              <span className="text-sm text-white/80">{insight.message}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
