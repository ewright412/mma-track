'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Trash2 } from 'lucide-react';
import { ScheduleTemplate } from '@/lib/types/schedule';

interface TemplateSwitcherProps {
  templates: ScheduleTemplate[];
  activeTemplateId: string | null;
  onSwitch: (templateId: string) => void;
  onCreate: () => void;
  onDelete: (templateId: string) => void;
}

export function TemplateSwitcher({
  templates,
  activeTemplateId,
  onSwitch,
  onCreate,
  onDelete,
}: TemplateSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#1a1a24] border border-white/[0.08] rounded-lg hover:border-white/20 transition-all duration-150"
      >
        <span className="text-sm font-medium text-white">
          {activeTemplate?.name || 'No Template'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 min-w-[220px] bg-[#1a1a24] border border-white/[0.12] rounded-lg shadow-xl overflow-hidden">
          {templates.map(template => {
            const isActive = template.id === activeTemplateId;
            return (
              <div
                key={template.id}
                className={`flex items-center justify-between px-3 py-2 text-sm transition-colors duration-100 ${
                  isActive ? 'bg-white/5 text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSwitch(template.id);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  {isActive && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
                  <span className={isActive ? '' : 'pl-6'}>{template.name}</span>
                </button>
                {!isActive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(template.id);
                    }}
                    className="p-1 text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              onCreate();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-accent hover:bg-white/5 transition-colors border-t border-white/[0.08]"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      )}
    </div>
  );
}
