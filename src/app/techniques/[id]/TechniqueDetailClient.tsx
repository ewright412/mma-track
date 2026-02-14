'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  BookmarkPlus,
  Award,
  Clock,
  Loader2,
} from 'lucide-react';
import { getTechniqueById, createPracticeLog, getTechniqueLastPracticed } from '@/lib/supabase/techniqueQueries';
import { createNote } from '@/lib/supabase/notebookQueries';
import { Technique } from '@/lib/types/technique';
import { DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useToast } from '@/components/ui/Toast';

const difficultyColors = {
  Beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  Intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function TechniqueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const techniqueId = params.id as string;

  const [technique, setTechnique] = useState<Technique | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastPracticed, setLastPracticed] = useState<string | null>(null);
  const [savingToNotebook, setSavingToNotebook] = useState(false);
  const [markingPracticed, setMarkingPracticed] = useState(false);
  const [notebookSuccess, setNotebookSuccess] = useState(false);
  const [practicedSuccess, setPracticedSuccess] = useState(false);

  useEffect(() => {
    loadTechnique();
    loadLastPracticed();
  }, [techniqueId]);

  const loadTechnique = async () => {
    setLoading(true);
    const { data, error } = await getTechniqueById(techniqueId);
    if (data && !error) {
      setTechnique(data);
    } else {
      console.error('Failed to load technique:', error);
    }
    setLoading(false);
  };

  const loadLastPracticed = async () => {
    const { data } = await getTechniqueLastPracticed(techniqueId);
    setLastPracticed(data);
  };

  const handleAddToNotebook = async () => {
    if (!technique) return;

    setSavingToNotebook(true);
    setNotebookSuccess(false);

    // Create notebook entry with key points
    const content = `## Key Points\n${technique.key_points.map((kp, i) => `${i + 1}. ${kp}`).join('\n')}\n\n## Common Mistakes\n${technique.common_mistakes.map((cm, i) => `${i + 1}. ${cm}`).join('\n')}`;

    const { data, error } = await createNote({
      title: technique.name,
      content,
      discipline: technique.discipline as any,
      tags: ['From Library', technique.category],
    });

    setSavingToNotebook(false);

    if (data && !error) {
      setNotebookSuccess(true);
      setTimeout(() => setNotebookSuccess(false), 3000);
    } else {
      showToast('Failed to save to notebook. Try again.', 'error');
    }
  };

  const handleMarkAsPracticed = async () => {
    if (!technique) return;

    setMarkingPracticed(true);
    setPracticedSuccess(false);

    const { data, error } = await createPracticeLog({
      technique_id: technique.id,
    });

    setMarkingPracticed(false);

    if (data && !error) {
      setPracticedSuccess(true);
      loadLastPracticed(); // Reload last practiced date
      setTimeout(() => setPracticedSuccess(false), 3000);
    } else {
      showToast('Failed to mark as practiced. Try again.', 'error');
    }
  };

  const getDisciplineColor = (discipline: string): string => {
    return DISCIPLINE_HEX_COLORS[discipline as keyof typeof DISCIPLINE_HEX_COLORS] || '#ef4444';
  };

  const formatLastPracticed = (date: string | null): string => {
    if (!date) return 'Never practiced';

    const practicedDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - practicedDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Practiced today';
    if (diffDays === 1) return 'Practiced yesterday';
    if (diffDays < 7) return `Practiced ${diffDays} days ago`;
    if (diffDays < 30) return `Practiced ${Math.floor(diffDays / 7)} weeks ago`;
    return `Practiced ${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-red-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400">Loading technique...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!technique) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">Technique not found</p>
            <Link
              href="/techniques"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/techniques"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>

        {/* Header */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-6 mb-6">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="px-3 py-1 rounded-xl text-sm font-medium border"
              style={{
                backgroundColor: `${getDisciplineColor(technique.discipline)}20`,
                borderColor: `${getDisciplineColor(technique.discipline)}40`,
                color: getDisciplineColor(technique.discipline),
              }}
            >
              {technique.discipline}
            </span>
            <span className="px-3 py-1 rounded-xl text-sm font-medium bg-white/5 text-gray-400 border border-white/10">
              {technique.category}
            </span>
            {technique.position && (
              <span className="px-3 py-1 rounded-xl text-sm font-medium bg-white/5 text-gray-400 border border-white/10">
                {technique.position}
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-xl text-sm font-medium border ${
                difficultyColors[technique.difficulty]
              }`}
            >
              {technique.difficulty}
            </span>
          </div>

          {/* Technique Name */}
          <h1 className="text-3xl font-bold text-white mb-4">{technique.name}</h1>

          {/* Description */}
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            {technique.description}
          </p>

          {/* Last Practiced */}
          {lastPracticed && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Clock className="w-4 h-4" />
              <span>{formatLastPracticed(lastPracticed)}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddToNotebook}
              disabled={savingToNotebook || notebookSuccess}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/20"
            >
              {savingToNotebook ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : notebookSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  Add to Notebook
                </>
              )}
            </button>

            <button
              onClick={handleMarkAsPracticed}
              disabled={markingPracticed || practicedSuccess}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/20"
            >
              {markingPracticed ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : practicedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Marked!
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  Mark as Practiced
                </>
              )}
            </button>
          </div>
        </div>

        {/* Key Points Section */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Key Points</h2>
          </div>
          <div className="space-y-3">
            {technique.key_points.map((point, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-green-400">
                    {index + 1}
                  </span>
                </div>
                <p className="text-gray-300 flex-1">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes Section */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Common Mistakes</h2>
          </div>
          <div className="space-y-3">
            {technique.common_mistakes.map((mistake, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-gray-300 flex-1">{mistake}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Techniques Section */}
        {technique.related_techniques && technique.related_techniques.length > 0 && (
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Related Techniques</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {technique.related_techniques.map((relatedName, index) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-white/5 text-gray-300 rounded-xl border border-white/10 hover:border-red-500/30 hover:text-white transition-all cursor-pointer text-sm"
                >
                  {relatedName}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Note: Related technique links will be added in a future update
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
