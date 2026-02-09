'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { getNoteById, updateNote, deleteNote, getAllTags } from '@/lib/supabase/notebookQueries';
import { getTrainingSessions } from '@/lib/supabase/queries';
import { MMADiscipline, TrainingSession } from '@/lib/types/training';
import { MMA_DISCIPLINES, DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { supabase } from '@/lib/supabase/client';
import { X, Trash2 } from 'lucide-react';

export default function EditNotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [discipline, setDiscipline] = useState<string>('none');
  const [sessionId, setSessionId] = useState<string>('none');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Autocomplete data
  const [allTags, setAllTags] = useState<string[]>([]);
  const [recentSessions, setRecentSessions] = useState<TrainingSession[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const tagContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadNote = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await getNoteById(params.id);

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    if (data) {
      setTitle(data.title || '');
      setContent(data.content);
      setDiscipline(data.discipline || 'none');
      setSessionId(data.session_id || 'none');
      setTags(data.tags);
    }

    setIsLoading(false);
  }, [params.id]);

  const loadAutocompleteData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [tagsResult, sessionsResult] = await Promise.all([
      getAllTags(user.id),
      getTrainingSessions(),
    ]);

    if (tagsResult.data) setAllTags(tagsResult.data);
    if (sessionsResult.data) {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const cutoff = twoWeeksAgo.toISOString().split('T')[0];
      setRecentSessions(
        sessionsResult.data.filter((s) => s.session_date >= cutoff)
      );
    }
  }, []);

  useEffect(() => {
    loadNote();
    loadAutocompleteData();
  }, [loadNote, loadAutocompleteData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagContainerRef.current && !tagContainerRef.current.contains(e.target as Node)) {
        setShowTagSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = Math.max(200, el.scrollHeight) + 'px';
    }
  }, [isLoading]);

  const autoGrow = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.max(200, el.scrollHeight) + 'px';
    }
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = allTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Note content is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: submitError } = await updateNote(params.id, {
      title: title.trim() || undefined,
      content: content.trim(),
      discipline: discipline !== 'none' ? (discipline as MMADiscipline) : null,
      session_id: sessionId !== 'none' ? sessionId : null,
      tags,
    });

    if (submitError) {
      setError(submitError.message);
      setIsSubmitting(false);
      return;
    }

    router.push('/notebook');
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const { error: deleteError } = await deleteNote(params.id);

    if (deleteError) {
      setError(deleteError.message);
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      return;
    }

    router.push('/notebook');
  };

  const formatSessionLabel = (s: TrainingSession) => {
    const date = new Date(s.session_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${date} — ${s.discipline}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060b18] p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 h-96 animate-pulse">
            <div className="h-full bg-white/5 rounded" />
          </Card>
        </div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="min-h-screen bg-[#060b18] p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push('/notebook')}>Back to Notebook</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b18] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Edit Note</h1>
            <p className="text-gray-500 text-sm">Update your note</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Title</h2>
            <Input
              placeholder="Note title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Discipline */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Discipline</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setDiscipline('none')}
                className={`p-3 rounded-lg text-sm font-medium transition-all text-left ${
                  discipline === 'none'
                    ? 'bg-white/10 border border-white/30 text-white'
                    : 'bg-[#0a1225] border border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                None
              </button>
              {MMA_DISCIPLINES.map((d) => {
                const color = DISCIPLINE_HEX_COLORS[d];
                const isSelected = discipline === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiscipline(d)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all text-left ${
                      isSelected
                        ? 'text-white'
                        : 'bg-[#0a1225] border border-white/10 text-gray-400 hover:text-white'
                    }`}
                    style={isSelected ? {
                      backgroundColor: `${color}20`,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: color,
                      color: color,
                    } : undefined}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Content</h2>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                autoGrow();
              }}
              placeholder="What did you work on today?"
              className="w-full px-4 py-3 bg-[#0a1225] border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/20 transition-colors resize-none"
              style={{ minHeight: '200px' }}
            />
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Tags</h2>
            <div ref={tagContainerRef} className="relative">
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-white/10 text-sm text-gray-300 rounded-full px-3 py-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                ref={tagInputRef}
                type="text"
                placeholder="Type a tag and press Enter..."
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowTagSuggestions(true);
                }}
                onFocus={() => setShowTagSuggestions(true)}
                onKeyDown={handleTagKeyDown}
                className="w-full bg-[#0a1225] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/20 transition-colors"
              />
              {showTagSuggestions && tagInput && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-[#0a1225] border border-white/[0.12] rounded-lg shadow-xl max-h-40 overflow-y-auto">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addTag(suggestion)}
                      className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Link to Session */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2 mb-4">Link to Session</h2>
            <Select
              value={sessionId}
              onChange={(value) => setSessionId(value)}
              placeholder="None"
              options={[
                { value: 'none', label: 'None' },
                ...recentSessions.map((s) => ({
                  value: s.id,
                  label: formatSessionLabel(s),
                })),
              ]}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto sm:min-w-[200px] py-3">
              {isSubmitting ? 'Saving...' : 'Update Note'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/notebook')}
              disabled={isSubmitting}
              className="w-full sm:w-auto py-3"
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#0a1225] border border-white/10 rounded-lg p-6 max-w-sm mx-4 w-full">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Note</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
