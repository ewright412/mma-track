'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { MMADiscipline } from '@/lib/types/training';
import { Download, Share2, X } from 'lucide-react';

interface WeeklySummaryProps {
  weekLabel: string; // e.g. "Feb 3 – Feb 9"
  sessionsCount: number;
  totalMinutes: number;
  disciplines: string[];
  streak: number;
  bestPR: { exercise: string; value: number } | null;
}

export function WeeklySummaryCard({
  weekLabel,
  sessionsCount,
  totalMinutes,
  disciplines,
  streak,
  bestPR,
}: WeeklySummaryProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const handleGenerate = async () => {
    setShowPreview(true);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        width: 540,
        height: 540,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `mma-weekly-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Determine highlight text
  let highlight = '';
  if (bestPR) {
    highlight = `New PR: ${bestPR.exercise} — ${Math.round(bestPR.value)} lbs`;
  } else if (streak >= 3) {
    highlight = `${streak}-day training streak`;
  }

  return (
    <>
      <button
        onClick={handleGenerate}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 border border-white/[0.08] rounded-lg hover:text-white hover:border-white/20 transition-all duration-150"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share Week
      </button>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="flex flex-col items-center gap-4 max-w-[580px] w-full">
            {/* The card to capture */}
            <div
              ref={cardRef}
              style={{
                width: 540,
                height: 540,
                background: 'linear-gradient(145deg, #0f0f13 0%, #1a1a24 50%, #0f0f13 100%)',
                borderRadius: 16,
                padding: 48,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontFamily: 'Inter, -apple-system, sans-serif',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle accent line at top */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 48,
                  right: 48,
                  height: 3,
                  background: 'linear-gradient(90deg, #ef4444, #f97316, #f59e0b, #22c55e, #3b82f6, #a855f7)',
                  borderRadius: '0 0 2px 2px',
                }}
              />

              {/* Header */}
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.1em',
                    marginBottom: 8,
                  }}
                >
                  Weekly Summary
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.2,
                  }}
                >
                  {weekLabel}
                </div>
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 20,
                }}
              >
                {/* Sessions */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    padding: '20px 16px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 700,
                      color: '#ef4444',
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {sessionsCount}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.5)',
                      fontWeight: 500,
                    }}
                  >
                    Sessions
                  </div>
                </div>

                {/* Hours */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    padding: '20px 16px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 700,
                      color: '#3b82f6',
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {timeStr}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.5)',
                      fontWeight: 500,
                    }}
                  >
                    Training
                  </div>
                </div>

                {/* Disciplines */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    padding: '20px 16px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 700,
                      color: '#22c55e',
                      lineHeight: 1,
                      marginBottom: 6,
                    }}
                  >
                    {disciplines.length}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.5)',
                      fontWeight: 500,
                    }}
                  >
                    Disciplines
                  </div>
                </div>
              </div>

              {/* Discipline Tags */}
              {disciplines.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                  {disciplines.map((d) => {
                    const color = DISCIPLINE_HEX_COLORS[d as MMADiscipline] || '#6b7280';
                    return (
                      <span
                        key={d}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: color,
                          backgroundColor: `${color}18`,
                          border: `1px solid ${color}30`,
                          padding: '4px 12px',
                          borderRadius: 6,
                        }}
                      >
                        {d}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Highlight */}
              {highlight && (
                <div
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#f59e0b',
                  }}
                >
                  {highlight}
                </div>
              )}

              {/* Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.05em',
                  }}
                >
                  Clinch
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.15)',
                  }}
                >
                  Track. Train. Improve.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#ef4444] text-white text-sm font-medium rounded-lg hover:bg-[#dc2626] transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {generating ? 'Generating...' : 'Download Image'}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-sm font-medium rounded-lg border border-white/[0.08] hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
