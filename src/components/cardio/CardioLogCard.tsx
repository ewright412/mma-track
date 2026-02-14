'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardioLog } from '@/lib/types/cardio';
import { CARDIO_TYPE_COLORS, CARDIO_TYPE_TEXT_COLORS, formatPace } from '@/lib/constants/cardio';
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Heart,
  Route,
  Flame,
  Zap,
  StickyNote,
} from 'lucide-react';

interface CardioLogCardProps {
  log: CardioLog;
  onEdit?: (logId: string) => void;
  onDelete?: (logId: string) => void;
}

export function CardioLogCard({ log, onEdit, onDelete }: CardioLogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const cardioTypeColorClass = CARDIO_TYPE_COLORS[log.cardio_type];
  const cardioTypeTextClass = CARDIO_TYPE_TEXT_COLORS[log.cardio_type];

  const pace =
    log.distance_km && log.distance_km > 0 ? log.duration_minutes / log.distance_km : null;

  return (
    <Card className="hover:border-white/20 transition-default">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left side: Main info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`${cardioTypeColorClass} ${cardioTypeTextClass} px-3 py-1 rounded-button text-sm font-medium`}
            >
              {log.cardio_type}
            </span>
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(log.session_date)}</span>
            </div>
            {log.intervals && (
              <Badge variant="default" className="text-xs bg-purple-500/20 text-purple-300">
                <Zap className="w-3 h-3 mr-1" />
                Intervals
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-white/80 flex-wrap">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{log.duration_minutes} min</span>
            </div>
            {log.distance_km && (
              <div className="flex items-center gap-1">
                <Route className="w-4 h-4" />
                <span>{log.distance_km} km</span>
              </div>
            )}
            {pace && (
              <Badge variant="default" className="text-xs">
                {formatPace(pace)}
              </Badge>
            )}
            {log.average_heart_rate && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span>{log.average_heart_rate} bpm avg</span>
              </div>
            )}
            {log.calories_estimate && (
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>{log.calories_estimate} cal</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(log.id)}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(log.id)}
              className="text-red-500 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          {/* Detailed metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {log.distance_km && (
              <div className="bg-background border border-border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Route className="w-4 h-4 text-blue-400" />
                  <p className="text-xs text-white/60">Distance</p>
                </div>
                <p className="text-lg font-bold text-white">{log.distance_km} km</p>
                {pace && (
                  <p className="text-xs text-white/50 mt-1">Pace: {formatPace(pace)}</p>
                )}
              </div>
            )}

            {log.average_heart_rate && (
              <div className="bg-background border border-border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  <p className="text-xs text-white/60">Avg HR</p>
                </div>
                <p className="text-lg font-bold text-white">{log.average_heart_rate} bpm</p>
                {log.max_heart_rate && (
                  <p className="text-xs text-white/50 mt-1">Max: {log.max_heart_rate} bpm</p>
                )}
              </div>
            )}

            {log.calories_estimate && (
              <div className="bg-background border border-border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <p className="text-xs text-white/60">Calories</p>
                </div>
                <p className="text-lg font-bold text-white">{log.calories_estimate}</p>
                <p className="text-xs text-white/50 mt-1">
                  ~{Math.round(log.calories_estimate / log.duration_minutes)} cal/min
                </p>
              </div>
            )}
          </div>

          {/* Interval description */}
          {log.intervals && log.interval_description && (
            <div className="bg-background border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <p className="text-sm font-medium text-white">Interval Details</p>
              </div>
              <p className="text-sm text-white/70">{log.interval_description}</p>
            </div>
          )}

          {/* Notes */}
          {log.notes && (
            <div className="bg-background border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <StickyNote className="w-4 h-4 text-accent-blue" />
                <p className="text-sm font-medium text-white">Notes</p>
              </div>
              <p className="text-sm text-white/70 whitespace-pre-wrap">{log.notes}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
