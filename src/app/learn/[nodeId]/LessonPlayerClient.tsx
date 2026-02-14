'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trophy,
  BookOpen,
  ListChecks,
} from 'lucide-react';
import {
  getNodeById,
  getLessonsForNode,
  getUserNodeProgress,
  completeLesson,
} from '@/lib/supabase/nodeQueries';
import { scheduleReview } from '@/lib/supabase/reviewQueries';
import { SkillTreeNode, LessonContent, UserNodeProgress } from '@/lib/types/learn';
import { DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useToast } from '@/components/ui/Toast';

const difficultyColors = {
  Beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  Intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const nodeId = params.nodeId as string;

  const [node, setNode] = useState<SkillTreeNode | null>(null);
  const [lessons, setLessons] = useState<LessonContent[]>([]);
  const [progress, setProgress] = useState<UserNodeProgress | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState(false);
  const [allLessonsComplete, setAllLessonsComplete] = useState(false);

  useEffect(() => {
    loadNodeData();
  }, [nodeId]);

  const loadNodeData = async () => {
    setLoading(true);

    const [nodeRes, lessonsRes, progressRes] = await Promise.all([
      getNodeById(nodeId),
      getLessonsForNode(nodeId),
      getUserNodeProgress(nodeId),
    ]);

    if (nodeRes.data && !nodeRes.error) {
      setNode(nodeRes.data);
    }

    if (lessonsRes.data && !lessonsRes.error) {
      setLessons(lessonsRes.data);
    }

    if (progressRes.data) {
      setProgress(progressRes.data);
      // Set current lesson to first incomplete lesson
      const completedLessons = progressRes.data.lessons_completed || [];
      const firstIncomplete = [1, 2, 3].find((n) => !completedLessons.includes(n));
      if (firstIncomplete) {
        setCurrentLessonIndex(firstIncomplete - 1);
      }
    }

    setLoading(false);
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson) return;

    setCompleting(true);
    setCompletionSuccess(false);

    const { data, error } = await completeLesson({
      node_id: nodeId,
      lesson_number: currentLesson.lesson_number,
    });

    setCompleting(false);

    if (data && !error) {
      setProgress(data.progress);
      setCompletionSuccess(true);

      // If all lessons complete, schedule review and show success
      if (data.all_lessons_complete) {
        setAllLessonsComplete(true);
        // Schedule initial review
        await scheduleReview(nodeId);

        // Show success message then redirect after 3 seconds
        setTimeout(() => {
          router.push('/learn');
        }, 3000);
      } else {
        // Move to next lesson after 1 second
        setTimeout(() => {
          if (currentLessonIndex < lessons.length - 1) {
            setCurrentLessonIndex(currentLessonIndex + 1);
          }
          setCompletionSuccess(false);
        }, 1000);
      }
    } else {
      showToast('Failed to complete lesson. Try again.', 'error');
    }
  };

  const getDisciplineColor = (discipline: string): string => {
    return DISCIPLINE_HEX_COLORS[discipline as keyof typeof DISCIPLINE_HEX_COLORS] || '#ef4444';
  };

  const currentLesson = lessons[currentLessonIndex];
  const isLessonCompleted =
    progress?.lessons_completed.includes(currentLesson?.lesson_number || 0) || false;

  if (loading) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-red-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400">Loading lesson...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!node || !currentLesson) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">Lesson not found</p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Skill Tree
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // All lessons complete success screen
  if (allLessonsComplete) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-[#1a1a24] border border-green-500/30 rounded-xl p-12 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h1 className="text-3xl font-bold text-white mb-3">Congratulations! 🎉</h1>
            <p className="text-lg text-gray-300 mb-4">
              You&apos;ve completed all 3 lessons for <span className="text-red-400">{node.name}</span>!
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20 mb-4">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">+{node.xp_reward} XP Earned</span>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              First review scheduled for tomorrow. Redirecting to skill tree...
            </p>
            <Loader2 className="w-6 h-6 text-red-400 mx-auto mt-4 animate-spin" />
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
          href="/learn"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Skill Tree
        </Link>

        {/* Header */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-xl text-sm font-medium border"
              style={{
                backgroundColor: `${getDisciplineColor(node.discipline)}20`,
                borderColor: `${getDisciplineColor(node.discipline)}40`,
                color: getDisciplineColor(node.discipline),
              }}
            >
              {node.discipline}
            </span>
            <span
              className={`px-3 py-1 rounded-xl text-sm font-medium border ${
                difficultyColors[node.difficulty]
              }`}
            >
              {node.difficulty}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">{node.name}</h1>

          {/* Lesson Progress */}
          <div className="flex items-center gap-2 mb-4">
            <p className="text-sm text-gray-400">
              Lesson {currentLesson.lesson_number} of 3
            </p>
            <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all"
                style={{
                  width: `${((progress?.lessons_completed.length || 0) / 3) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Lesson Dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => {
              const isCompleted = progress?.lessons_completed.includes(num) || false;
              const isCurrent = num === currentLesson.lesson_number;
              return (
                <button
                  key={num}
                  onClick={() => setCurrentLessonIndex(num - 1)}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                        ? 'bg-red-500'
                        : 'bg-white/10'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">{currentLesson.title}</h2>

          {currentLesson.content_type === 'text' && (
            <div>
              <p className="text-gray-300 mb-6">{currentLesson.content.text}</p>
              {currentLesson.content.points && (
                <div className="space-y-3">
                  {currentLesson.content.points.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-red-400">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-gray-300 flex-1">{point}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentLesson.content_type === 'checklist' && (
            <div>
              <p className="text-gray-300 mb-6">{currentLesson.content.text}</p>
              <div className="space-y-3">
                {currentLesson.content.checklist_items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                  >
                    <ListChecks className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300 flex-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}
            disabled={currentLessonIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {isLessonCompleted ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
              <CheckCircle2 className="w-5 h-5" />
              Completed
            </div>
          ) : (
            <button
              onClick={handleCompleteLesson}
              disabled={completing || completionSuccess}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {completing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Completing...
                </>
              ) : completionSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Completed!
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Mark Complete
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
            disabled={currentLessonIndex === lessons.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
