'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MMA_DISCIPLINES } from '@/lib/constants/disciplines';
import { CARDIO_TYPES } from '@/lib/constants/cardio';
import {
  ScheduleEntry,
  CreateScheduleEntryInput,
  ScheduleSessionType,
  ScheduleMuscleGroup,
} from '@/lib/types/schedule';
import { createScheduleEntry, updateScheduleEntry, deleteScheduleEntry } from '@/lib/supabase/scheduleQueries';
import { Trash2 } from 'lucide-react';

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SESSION_TYPE_OPTIONS = [
  { value: 'training', label: 'Training' },
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: '__rest__', label: 'Rest Day' },
];

const disciplineOptions = MMA_DISCIPLINES.map(d => ({ value: d, label: d }));

const cardioTypeOptions = CARDIO_TYPES.map(t => ({ value: t, label: t }));

const MUSCLE_GROUP_OPTIONS: Array<{ value: ScheduleMuscleGroup; label: string }> = [
  { value: 'upper_body', label: 'Upper Body' },
  { value: 'lower_body', label: 'Lower Body' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
];

interface ScheduleEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayOfWeek: number;
  templateId: string;
  existingEntry?: ScheduleEntry;
  onSave: () => void;
}

export function ScheduleEntryModal({
  isOpen,
  onClose,
  dayOfWeek,
  templateId,
  existingEntry,
  onSave,
}: ScheduleEntryModalProps) {
  const [sessionType, setSessionType] = useState<string>('training');
  const [discipline, setDiscipline] = useState('');
  const [cardioType, setCardioType] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const isRestDay = sessionType === '__rest__';
  const isEditing = !!existingEntry;

  useEffect(() => {
    if (existingEntry) {
      if (existingEntry.is_rest_day) {
        setSessionType('__rest__');
      } else {
        setSessionType(existingEntry.session_type || 'training');
      }
      setDiscipline(existingEntry.discipline || '');
      setCardioType(existingEntry.cardio_type || '');
      setMuscleGroup(existingEntry.muscle_group || '');
      setStartTime(existingEntry.start_time?.substring(0, 5) || '09:00');
      setEndTime(existingEntry.end_time?.substring(0, 5) || '10:00');
      setLocation(existingEntry.location || '');
      setNotes(existingEntry.notes || '');
    } else {
      setSessionType('training');
      setDiscipline('');
      setCardioType('');
      setMuscleGroup('');
      setStartTime('09:00');
      setEndTime('10:00');
      setLocation('');
      setNotes('');
    }
    setError('');
  }, [existingEntry, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isRestDay) {
      if (sessionType === 'training' && !discipline) {
        setError('Please select a discipline');
        return;
      }
      if (sessionType === 'cardio' && !cardioType) {
        setError('Please select a cardio type');
        return;
      }
      if (startTime >= endTime) {
        setError('End time must be after start time');
        return;
      }
    }

    setSaving(true);

    try {
      if (isEditing && existingEntry) {
        const { error: updateError } = await updateScheduleEntry(existingEntry.id, {
          session_type: isRestDay ? 'training' : (sessionType as ScheduleSessionType),
          discipline: isRestDay || sessionType !== 'training' ? null : (discipline as CreateScheduleEntryInput['discipline']),
          cardio_type: sessionType === 'cardio' ? cardioType : null,
          muscle_group: sessionType === 'strength' ? (muscleGroup as ScheduleMuscleGroup) || null : null,
          start_time: isRestDay ? '00:00' : startTime,
          end_time: isRestDay ? '23:59' : endTime,
          location: location || null,
          notes: notes || null,
          is_rest_day: isRestDay,
        });
        if (updateError) {
          setError(updateError);
          return;
        }
      } else {
        const input: CreateScheduleEntryInput = {
          template_id: templateId,
          day_of_week: dayOfWeek,
          session_type: isRestDay ? 'training' : (sessionType as ScheduleSessionType),
          start_time: isRestDay ? '00:00' : startTime,
          end_time: isRestDay ? '23:59' : endTime,
          discipline: isRestDay || sessionType !== 'training' ? undefined : (discipline as CreateScheduleEntryInput['discipline']),
          cardio_type: sessionType === 'cardio' ? cardioType : undefined,
          muscle_group: sessionType === 'strength' ? (muscleGroup as ScheduleMuscleGroup) || undefined : undefined,
          location: location || undefined,
          notes: notes || undefined,
          is_rest_day: isRestDay,
        };
        const { error: createError } = await createScheduleEntry(input);
        if (createError) {
          setError(createError);
          return;
        }
      }

      onSave();
      onClose();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existingEntry) return;
    setDeleting(true);
    try {
      const { error: deleteError } = await deleteScheduleEntry(existingEntry.id);
      if (deleteError) {
        setError(deleteError);
        return;
      }
      onSave();
      onClose();
    } catch {
      setError('Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Edit' : 'Add'} — ${DAY_LABELS[dayOfWeek]}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Session Type */}
        <Select
          label="Session Type"
          options={SESSION_TYPE_OPTIONS}
          value={sessionType}
          onChange={setSessionType}
          placeholder="Select type..."
        />

        {/* Type-specific fields */}
        {!isRestDay && (
          <>
            {sessionType === 'training' && (
              <Select
                label="Discipline"
                options={disciplineOptions}
                value={discipline}
                onChange={setDiscipline}
                placeholder="Select discipline..."
              />
            )}

            {sessionType === 'cardio' && (
              <Select
                label="Cardio Type"
                options={cardioTypeOptions}
                value={cardioType}
                onChange={setCardioType}
                placeholder="Select cardio type..."
              />
            )}

            {sessionType === 'strength' && (
              <Select
                label="Focus (optional)"
                options={MUSCLE_GROUP_OPTIONS}
                value={muscleGroup}
                onChange={setMuscleGroup}
                placeholder="Select muscle group..."
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              />
              <Input
                label="End Time"
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              />
            </div>

            <Input
              label="Location (optional)"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Main gym, Dojo 2"
            />
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={isRestDay ? 'e.g. Active recovery, stretching' : 'e.g. Focus on takedown defense'}
            rows={2}
            className="w-full bg-[#1a1a24] border border-white/[0.08] rounded-input px-3 py-2 text-white placeholder-white/40 transition-default focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-accent text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update' : 'Add Entry'}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="danger"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
