'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrainingSessionWithTechniques } from '@/lib/types/training';
import { DISCIPLINE_COLORS, DISCIPLINE_TEXT_COLORS, getIntensityColor } from '@/lib/constants/disciplines';
import { Calendar, Clock, Flame, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';

interface TrainingSessionCardProps {
  session: TrainingSessionWithTechniques;
  onEdit?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
}

export function TrainingSessionCard({ session, onEdit, onDelete }: TrainingSessionCardProps) {
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

  const disciplineColorClass = DISCIPLINE_COLORS[session.discipline];
  const disciplineTextClass = DISCIPLINE_TEXT_COLORS[session.discipline];

  return (
    <Card className="hover:border-white/20 transition-default">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left side: Main info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`${disciplineColorClass} ${disciplineTextClass} px-3 py-1 rounded-button text-sm font-medium`}
            >
              {session.discipline}
            </span>
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(session.session_date)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{session.duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4" style={{ color: getIntensityColor(session.intensity) }} />
              <span>Intensity: {session.intensity}/10</span>
            </div>
            {session.techniques && session.techniques.length > 0 && (
              <Badge variant="info">{session.techniques.length} technique{session.techniques.length !== 1 ? 's' : ''}</Badge>
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
          {/* Session notes */}
          {session.notes && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white/80 mb-1">Session Notes</h4>
              <p className="text-white/70 text-sm">{session.notes}</p>
            </div>
          )}

          {/* Techniques */}
          {session.techniques && session.techniques.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-2">
                Techniques Practiced
              </h4>
              <div className="space-y-2">
                {session.techniques.map((technique) => (
                  <div
                    key={technique.id}
                    className="bg-background border border-border rounded-md p-3"
                  >
                    <p className="text-white font-medium text-sm">{technique.technique_name}</p>
                    {technique.notes && (
                      <p className="text-white/60 text-xs mt-1">{technique.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!session.notes && (!session.techniques || session.techniques.length === 0) && (
            <p className="text-white/40 text-sm italic">No additional details for this session</p>
          )}
        </div>
      )}
    </Card>
  );
}
