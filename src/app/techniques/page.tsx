'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Filter } from 'lucide-react';
import { getAllTechniques } from '@/lib/supabase/techniqueQueries';
import { Technique } from '@/lib/types/technique';
import { DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { AuthGuard } from '@/components/auth/AuthGuard';

const disciplines = ['All', 'Boxing', 'Muay Thai', 'Kickboxing', 'Wrestling', 'Brazilian Jiu-Jitsu', 'MMA'];
const categories = ['All', 'Strikes', 'Takedowns', 'Submissions', 'Sweeps', 'Escapes', 'Defense', 'Clinch'];
const positions = ['All', 'Standing', 'Ground (Top)', 'Ground (Bottom)', 'Clinch', 'Against Cage', 'Guard (Top)', 'Guard (Bottom)', 'Mount', 'Mount (Bottom)', 'Back', 'Turtle'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const difficultyColors = {
  Beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  Intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function TechniquesPage() {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    loadTechniques();
  }, []);

  const loadTechniques = async () => {
    setLoading(true);
    const { data, error } = await getAllTechniques();
    if (data && !error) {
      setTechniques(data);
    }
    setLoading(false);
  };

  // Client-side filtering
  const filteredTechniques = useMemo(() => {
    return techniques.filter((tech) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = tech.name.toLowerCase().includes(term);
        const matchesDescription = tech.description.toLowerCase().includes(term);
        const matchesKeyPoints = tech.key_points.some((kp) =>
          kp.toLowerCase().includes(term)
        );
        if (!matchesName && !matchesDescription && !matchesKeyPoints) {
          return false;
        }
      }

      // Discipline filter
      if (selectedDiscipline !== 'All' && tech.discipline !== selectedDiscipline) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && tech.category !== selectedCategory) {
        return false;
      }

      // Position filter
      if (selectedPosition !== 'All') {
        if (!tech.position || tech.position !== selectedPosition) {
          return false;
        }
      }

      // Difficulty filter
      if (selectedDifficulty !== 'All' && tech.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [techniques, searchTerm, selectedDiscipline, selectedCategory, selectedPosition, selectedDifficulty]);

  const getDisciplineColor = (discipline: string): string => {
    return DISCIPLINE_HEX_COLORS[discipline as keyof typeof DISCIPLINE_HEX_COLORS] || '#ef4444';
  };

  return (
    <AuthGuard>
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Technique Library</h1>
          </div>
          <p className="text-gray-400">
            Explore {techniques.length} martial arts techniques across all disciplines
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search techniques, descriptions, or key points..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1a1a24] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/30"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Discipline Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-400">Discipline</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
              {disciplines.map((discipline) => (
                <button
                  key={discipline}
                  onClick={() => setSelectedDiscipline(discipline)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedDiscipline === discipline
                      ? 'text-white border'
                      : 'bg-[#1a1a24] text-gray-400 hover:text-white border border-transparent hover:border-white/10'
                  }`}
                  style={
                    selectedDiscipline === discipline && discipline !== 'All'
                      ? {
                          backgroundColor: `${getDisciplineColor(discipline)}20`,
                          borderColor: `${getDisciplineColor(discipline)}40`,
                          color: getDisciplineColor(discipline),
                        }
                      : selectedDiscipline === discipline && discipline === 'All'
                      ? {
                          backgroundColor: '#ef444420',
                          borderColor: '#ef444440',
                          color: '#ef4444',
                        }
                      : {}
                  }
                >
                  {discipline}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <span className="text-sm font-medium text-gray-400 mb-2 block">Category</span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-[#1a1a24] text-gray-400 hover:text-white border border-transparent hover:border-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Position & Difficulty Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Position Filter */}
            <div>
              <span className="text-sm font-medium text-gray-400 mb-2 block">Position</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {positions.map((position) => (
                  <button
                    key={position}
                    onClick={() => setSelectedPosition(position)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedPosition === position
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-[#1a1a24] text-gray-400 hover:text-white border border-transparent hover:border-white/10'
                    }`}
                  >
                    {position}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <span className="text-sm font-medium text-gray-400 mb-2 block">Difficulty</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedDifficulty === difficulty
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-[#1a1a24] text-gray-400 hover:text-white border border-transparent hover:border-white/10'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredTechniques.length} of {techniques.length} techniques
        </div>

        {/* Techniques Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#1a1a24] border border-white/5 rounded-xl p-5 animate-pulse"
              >
                <div className="h-6 bg-white/5 rounded mb-3" />
                <div className="h-4 bg-white/5 rounded mb-2 w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredTechniques.length === 0 ? (
          <div className="bg-[#1a1a24] border border-white/5 rounded-xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No techniques found matching your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDiscipline('All');
                setSelectedCategory('All');
                setSelectedPosition('All');
                setSelectedDifficulty('All');
              }}
              className="mt-4 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTechniques.map((technique) => (
              <Link
                key={technique.id}
                href={`/techniques/${technique.id}`}
                className="bg-[#1a1a24] border border-white/5 rounded-xl p-5 hover:border-red-500/30 transition-all group"
              >
                {/* Badges Row */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium border"
                    style={{
                      backgroundColor: `${getDisciplineColor(technique.discipline)}20`,
                      borderColor: `${getDisciplineColor(technique.discipline)}40`,
                      color: getDisciplineColor(technique.discipline),
                    }}
                  >
                    {technique.discipline}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border ${
                      difficultyColors[technique.difficulty]
                    }`}
                  >
                    {technique.difficulty}
                  </span>
                </div>

                {/* Technique Name */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {technique.name}
                </h3>

                {/* Category & Position */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                  <span>{technique.category}</span>
                  {technique.position && (
                    <>
                      <span>•</span>
                      <span>{technique.position}</span>
                    </>
                  )}
                </div>

                {/* Description Preview */}
                <p className="text-sm text-gray-400 line-clamp-2">
                  {technique.description}
                </p>

                {/* Key Points Count */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                  <span>{technique.key_points.length} key points</span>
                  <span className="text-red-400 group-hover:translate-x-1 transition-transform">
                    View details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
