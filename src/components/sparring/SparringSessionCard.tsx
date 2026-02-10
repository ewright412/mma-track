'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SparringSessionWithRounds } from '@/lib/types/sparring';
import {
  SKILL_LEVEL_COLORS,
  SKILL_LEVEL_TEXT_COLORS,
  SPARRING_TYPE_CATEGORIES,
  SPARRING_TYPES,
  RATING_COLORS,
  getRatingColor,
} from '@/lib/constants/sparring';
import { Calendar, Users, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';

interface SparringSessionCardProps {
  session: SparringSessionWithRounds;
  onEdit?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
}

export function SparringSessionCard({ session, onEdit, onDelete }: SparringSessionCardProps) {
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

  const skillLevelColorClass = SKILL_LEVEL_COLORS[session.opponent_skill_level];
  const skillLevelTextClass = SKILL_LEVEL_TEXT_COLORS[session.opponent_skill_level];

  const sparringType = session.sparring_type || 'mma';
  const categories = SPARRING_TYPE_CATEGORIES[sparringType];
  const sparringTypeLabel = SPARRING_TYPES.find((t) => t.value === sparringType)?.label || sparringType;

  // Calculate average ratings across all rounds using the ratings JSONB
  const avgRatings: Record<string, number> | null =
    session.rounds.length > 0
      ? (() => {
          const sums: Record<string, number> = {};
          const counts: Record<string, number> = {};
          session.rounds.forEach((round) => {
            for (const [key, value] of Object.entries(round.ratings)) {
              sums[key] = (sums[key] || 0) + value;
              counts[key] = (counts[key] || 0) + 1;
            }
          });
          const result: Record<string, number> = {};
          for (const key of Object.keys(sums)) {
            result[key] = Math.round((sums[key] / counts[key]) * 10) / 10;
          }
          return result;
        })()
      : null;

  // Overall average across all categories
  const overallAvg = avgRatings
    ? (() => {
        const values = Object.values(avgRatings);
        return values.length > 0
          ? (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1)
          : '0';
      })()
    : null;

  return (
    <Card className="hover:border-white/20 transition-default">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left side: Main info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span
              className={`${skillLevelColorClass} ${skillLevelTextClass} px-3 py-1 rounded-button text-sm font-medium`}
            >
              {session.opponent_skill_level}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-white/60">
              {sparringTypeLabel}
            </span>
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(session.session_date)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{session.total_rounds} {session.total_rounds === 1 ? 'round' : 'rounds'}</span>
            </div>
            {overallAvg && (
              <Badge variant="default" className="text-xs">
                Avg: {overallAvg}/10
              </Badge>
            )}
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(session.id)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(session.id)}
              className="text-red-500 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          {/* Average ratings overview - dynamic based on categories */}
          {avgRatings && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const avg = avgRatings[cat.key];
                if (avg === undefined) return null;
                return (
                  <div key={cat.key} className="bg-background border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <p className="text-xs text-white/60">{cat.label}</p>
                    </div>
                    <p className="text-lg font-bold" style={{ color: getRatingColor(avg) }}>
                      {avg}/10
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Round-by-round breakdown */}
          {session.rounds && session.rounds.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white/80 mb-2">
                Round-by-Round Breakdown
              </h4>
              <div className="space-y-2">
                {session.rounds.map((round) => (
                  <div
                    key={round.id}
                    className="bg-background border border-border rounded-md p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium text-sm">Round {round.round_number}</p>
                      <div className="flex gap-2 text-xs flex-wrap justify-end">
                        {categories.map((cat) => {
                          const val = round.ratings[cat.key];
                          if (val === undefined) return null;
                          return (
                            <span key={cat.key} style={{ color: cat.color }}>
                              {cat.shortLabel}: {val}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {round.notes && (
                      <p className="text-white/60 text-xs">{round.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What went well / What to improve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {session.what_went_well && (
              <div>
                <h4 className="text-sm font-medium text-success mb-1">What Went Well</h4>
                <p className="text-white/70 text-sm">{session.what_went_well}</p>
              </div>
            )}
            {session.what_to_improve && (
              <div>
                <h4 className="text-sm font-medium text-warning mb-1">What to Improve</h4>
                <p className="text-white/70 text-sm">{session.what_to_improve}</p>
              </div>
            )}
          </div>

          {/* General notes */}
          {session.notes && (
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-1">Notes</h4>
              <p className="text-white/70 text-sm">{session.notes}</p>
            </div>
          )}

          {!session.notes && !session.what_went_well && !session.what_to_improve && session.rounds.length === 0 && (
            <p className="text-white/40 text-sm italic">No additional details for this session</p>
          )}
        </div>
      )}
    </Card>
  );
}
