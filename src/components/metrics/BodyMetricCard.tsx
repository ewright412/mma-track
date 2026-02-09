'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BodyMetric } from '@/lib/types/metrics';
import {
  Calendar,
  Scale,
  Percent,
  StickyNote,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface BodyMetricCardProps {
  metric: BodyMetric;
  onDelete?: (metricId: string) => void;
  showTrend?: boolean;
  trendDirection?: 'up' | 'down' | 'stable';
}

export function BodyMetricCard({
  metric,
  onDelete,
  showTrend = false,
  trendDirection = 'stable',
}: BodyMetricCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-blue-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendLabel = () => {
    switch (trendDirection) {
      case 'up':
        return 'Gaining';
      case 'down':
        return 'Losing';
      default:
        return 'Stable';
    }
  };

  return (
    <Card className="hover:border-white/20 transition-default">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left side: Main info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(metric.metric_date)}</span>
            </div>
            {showTrend && (
              <Badge
                variant="default"
                className="text-xs bg-white/5 text-white/70 flex items-center gap-1"
              >
                {getTrendIcon()}
                {getTrendLabel()}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-6 text-white/90 flex-wrap">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-sm text-white/60">Weight</span>
                <span className="text-lg font-semibold">{metric.weight} lbs</span>
              </div>
            </div>

            {metric.body_fat_percentage && (
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-green-400" />
                <div className="flex flex-col">
                  <span className="text-sm text-white/60">Body Fat</span>
                  <span className="text-lg font-semibold">{metric.body_fat_percentage}%</span>
                </div>
              </div>
            )}
          </div>

          {metric.notes && (
            <div className="mt-3 p-3 bg-white/5 rounded-default border border-white/5">
              <div className="flex items-start gap-2 text-sm text-white/70">
                <StickyNote className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="flex-1">{metric.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Actions */}
        <div className="flex md:flex-col gap-2">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(metric.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
