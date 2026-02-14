'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, Plus } from 'lucide-react';
import {
  COMPOUND_EXERCISES,
  MMA_SPECIFIC_EXERCISES,
  ACCESSORY_EXERCISES,
  CATEGORY_LABELS,
  MUSCLE_GROUP_LABELS,
  type Exercise,
  type ExerciseCategory,
} from '@/lib/constants/exercises';

interface ExerciseSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const GROUPED_EXERCISES: { category: ExerciseCategory; label: string; exercises: Exercise[] }[] = [
  { category: 'compound', label: CATEGORY_LABELS.compound, exercises: COMPOUND_EXERCISES },
  { category: 'mma_specific', label: CATEGORY_LABELS.mma_specific, exercises: MMA_SPECIFIC_EXERCISES },
  { category: 'accessory', label: CATEGORY_LABELS.accessory, exercises: ACCESSORY_EXERCISES },
];

export function ExerciseSelect({ value, onChange, required }: ExerciseSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return GROUPED_EXERCISES;
    const query = searchQuery.toLowerCase();
    return GROUPED_EXERCISES.map((group) => ({
      ...group,
      exercises: group.exercises.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          MUSCLE_GROUP_LABELS[ex.primaryMuscleGroup].toLowerCase().includes(query)
      ),
    })).filter((group) => group.exercises.length > 0);
  }, [searchQuery]);

  const handleSelect = (exerciseName: string) => {
    onChange(exerciseName);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleAddCustom = () => {
    if (searchQuery.trim()) {
      onChange(searchQuery.trim());
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const hasResults = filteredGroups.some((g) => g.exercises.length > 0);

  return (
    <div className="w-full" ref={containerRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#1a1a24] border rounded-input px-3 py-2 text-left flex items-center justify-between transition-default ${
            isOpen
              ? 'border-white/30 ring-2 ring-accent'
              : 'border-white/[0.08] hover:border-white/20'
          } cursor-pointer`}
        >
          <span className={value ? 'text-white' : 'text-white/40'}>
            {value || 'Select exercise...'}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-white/40 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-[#1a1a24] border border-white/[0.12] rounded-xl shadow-xl max-h-80 flex flex-col">
            {/* Search input */}
            <div className="p-2 border-b border-white/[0.08]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full bg-white/5 border border-white/[0.08] rounded-md pl-8 pr-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                />
              </div>
            </div>

            {/* Grouped exercise list */}
            <div className="overflow-y-auto flex-1">
              {filteredGroups.map((group) => (
                <div key={group.category}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider bg-white/[0.02] sticky top-0">
                    {group.label}
                  </div>
                  {group.exercises.map((exercise) => {
                    const isSelected = exercise.name === value;
                    return (
                      <button
                        key={exercise.name}
                        type="button"
                        onClick={() => handleSelect(exercise.name)}
                        className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors duration-100 ${
                          isSelected
                            ? 'bg-white/5 text-white'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <span>{exercise.name}</span>
                          <span className="text-xs text-white/30 ml-2">
                            {MUSCLE_GROUP_LABELS[exercise.primaryMuscleGroup]}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Add custom exercise option */}
              {searchQuery.trim() && !hasResults && (
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="w-full px-3 py-2.5 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2 transition-colors duration-100"
                >
                  <Plus className="w-4 h-4" />
                  Add &quot;{searchQuery.trim()}&quot; as custom exercise
                </button>
              )}

              {searchQuery.trim() && hasResults && (
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="w-full px-3 py-2 text-left text-sm text-white/40 hover:bg-white/10 flex items-center gap-2 border-t border-white/[0.08] transition-colors duration-100"
                >
                  <Plus className="w-3 h-3" />
                  Add &quot;{searchQuery.trim()}&quot; as custom
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
