'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { getNotes, getAllTags, getTagsWithDiscipline } from '@/lib/supabase/notebookQueries';
import { NoteWithTags, NoteFilters, TagWithDiscipline } from '@/lib/types/notebook';
import { MMADiscipline } from '@/lib/types/training';
import { MMA_DISCIPLINES, DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { supabase } from '@/lib/supabase/client';
import { Plus, Search, BookOpen, Tag } from 'lucide-react';
import { PaywallGate } from '@/components/billing/PaywallGate';
import { useSubscription } from '@/lib/hooks/useSubscription';

export default function NotebookPage() {
  const router = useRouter();
  const { isPro } = useSubscription();
  const [activeTab, setActiveTab] = useState<'notes' | 'techniques'>('notes');
  const [notes, setNotes] = useState<NoteWithTags[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagsWithDiscipline, setTagsWithDiscipline] = useState<TagWithDiscipline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadNotes = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);

    const filters: NoteFilters = {};
    if (disciplineFilter !== 'all') {
      filters.discipline = disciplineFilter as MMADiscipline;
    }
    if (tagFilter !== 'all') {
      filters.tag = tagFilter;
    }
    if (search) {
      filters.search = search;
    }

    const { data, error: fetchError } = await getNotes(filters);

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    setNotes(data || []);
    setIsLoading(false);
  }, [disciplineFilter, tagFilter]);

  const loadTags = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [tagsResult, tagsWithDiscResult] = await Promise.all([
      getAllTags(user.id),
      getTagsWithDiscipline(user.id),
    ]);
    if (tagsResult.data) setAllTags(tagsResult.data);
    if (tagsWithDiscResult.data) setTagsWithDiscipline(tagsWithDiscResult.data);
  }, []);

  useEffect(() => {
    loadNotes(searchQuery);
    loadTags();
  }, [loadNotes, loadTags, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadNotes(value);
    }, 300);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPreview = (content: string) => {
    const lines = content.split('\n').filter((l) => l.trim());
    return lines.slice(0, 2).join(' ').slice(0, 150);
  };

  const getDisplayTitle = (note: NoteWithTags) => {
    if (note.title) return note.title;
    const firstLine = note.content.split('\n')[0]?.trim();
    return firstLine?.slice(0, 60) || 'Untitled';
  };

  const handleTagClick = (tagName: string) => {
    setTagFilter(tagName);
    setActiveTab('notes');
  };

  // Group tags by discipline for Techniques tab
  const groupedTechniques = (() => {
    // Merge counts for same tag across null discipline into their named discipline
    const tagTotals: Record<string, number> = {};
    const tagDisciplines: Record<string, Set<string>> = {};

    for (const t of tagsWithDiscipline) {
      tagTotals[t.tag_name] = (tagTotals[t.tag_name] || 0) + t.count;
      if (t.discipline) {
        if (!tagDisciplines[t.tag_name]) tagDisciplines[t.tag_name] = new Set();
        tagDisciplines[t.tag_name].add(t.discipline);
      }
    }

    // Build groups: discipline -> [{tag_name, count}]
    const groups: Record<string, { tag_name: string; count: number }[]> = {};

    for (const t of tagsWithDiscipline) {
      const disc = t.discipline || 'General';
      if (!groups[disc]) groups[disc] = [];
      // Avoid duplicates in the same group
      if (!groups[disc].find((x) => x.tag_name === t.tag_name)) {
        groups[disc].push({ tag_name: t.tag_name, count: t.count });
      }
    }

    // Sort each group by count descending
    for (const disc of Object.keys(groups)) {
      groups[disc].sort((a, b) => b.count - a.count);
    }

    return groups;
  })();

  // Order disciplines: named first (in MMA_DISCIPLINES order), then General
  const orderedDisciplines = [
    ...MMA_DISCIPLINES.filter((d) => groupedTechniques[d]),
    ...(groupedTechniques['General'] ? ['General'] : []),
  ];

  return (
    <div className="min-h-screen bg-[#0f0f13] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <PaywallGate isPro={isPro} feature="Training Notebook — jot down techniques, drills, and insights">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-500 text-sm">Jot down techniques, observations, and insights</p>
          </div>
          <Button onClick={() => router.push('/notebook/new')} className="px-4 py-2 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6">
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'notes'
                ? 'text-white border-red-500'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab('techniques')}
            className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'techniques'
                ? 'text-white border-red-500'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            Techniques
          </button>
        </div>

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-[#1a1a24] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Select
                value={disciplineFilter}
                onChange={(value) => setDisciplineFilter(value)}
                options={[
                  { value: 'all', label: 'All Disciplines' },
                  ...MMA_DISCIPLINES.map((d) => ({ value: d, label: d })),
                ]}
              />
              <Select
                value={tagFilter}
                onChange={(value) => setTagFilter(value)}
                options={[
                  { value: 'all', label: 'All Tags' },
                  ...allTags.map((t) => ({ value: t, label: t })),
                ]}
              />
            </div>

            {/* Notes List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-24 animate-pulse">
                    <div className="h-full bg-white/5 rounded" />
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
                <p className="text-red-400 mb-1">Failed to load notes</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <Button variant="secondary" onClick={() => loadNotes(searchQuery)}>
                  Try Again
                </Button>
              </Card>
            ) : notes.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
                <p className="text-white/60 mb-6">
                  Jot down what you learned after your next session.
                </p>
                <Button onClick={() => router.push('/notebook/new')}>
                  <Plus className="w-5 h-5 mr-2" />
                  New Note
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => router.push(`/notebook/edit/${note.id}`)}
                    className="w-full text-left bg-[#1a1a24] border border-white/[0.08] rounded-lg p-4 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-medium text-white truncate">
                        {getDisplayTitle(note)}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                        {formatDate(note.updated_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {note.discipline && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${DISCIPLINE_HEX_COLORS[note.discipline]}20`,
                            color: DISCIPLINE_HEX_COLORS[note.discipline],
                          }}
                        >
                          {note.discipline}
                        </span>
                      )}
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-white/10 text-xs text-gray-300 rounded-full px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2">
                      {getPreview(note.content)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* TECHNIQUES TAB */}
        {activeTab === 'techniques' && (
          <>
            {orderedDisciplines.length === 0 ? (
              <Card className="p-12 text-center">
                <Tag className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No techniques yet</h3>
                <p className="text-white/60">
                  Your technique library builds automatically as you tag notes.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {orderedDisciplines.map((disc) => {
                  const color = disc !== 'General'
                    ? DISCIPLINE_HEX_COLORS[disc as MMADiscipline]
                    : '#9ca3af';
                  const tags = groupedTechniques[disc];
                  return (
                    <div key={disc}>
                      <h3
                        className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                        style={{ color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {disc}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((t) => (
                          <button
                            key={`${disc}-${t.tag_name}`}
                            onClick={() => handleTagClick(t.tag_name)}
                            className="bg-[#1a1a24] border border-white/[0.08] rounded-lg px-3 py-2 hover:border-white/20 transition-colors text-left"
                          >
                            <span className="text-sm text-white font-medium">{t.tag_name}</span>
                            <span className="text-xs text-white/40 ml-2">
                              {t.count} note{t.count !== 1 ? 's' : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        </PaywallGate>
      </div>
    </div>
  );
}
