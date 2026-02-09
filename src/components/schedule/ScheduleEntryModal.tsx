'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MMA_DISCIPLINES } from '@/lib/constants/disciplines';
import { ScheduleEntry, CreateScheduleEntryInput } from '@/lib/types/schedule';
import { createScheduleEntry, updateScheduleEntry, deleteScheduleEntry } from '@/lib/supabase/scheduleQueries';
import { Trash2 } from 'lucide-react';

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const disciplineOptions = [
  { value: '__rest__', label: 'Rest Day' },
  ...MMA_DISCIPLINES.map(d => ({ value: d, label: d })),
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
  const [discipline, setDiscipline] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const isRestDay = discipline === '__rest__';
  const isEditing = !!existingEntry;

  useEffect(() => {
    if (existingEntry) {
      setDiscipline(existingEntry.is_rest_day ? '__rest__' : existingEntry.discipline || '');
      setStartTime(existingEntry.start_time?.substring(0, 5) || '09:00');
      setEndTime(existingEntry.end_time?.substring(0, 5) || '10:00');
      setLocation(existingEntry.location || '');
      setNotes(existingEntry.notes || '');
    } else {
      setDiscipline('');
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

    if (!discipline) {
      setError('Please select a discipline or Rest Day');
      return;
    }

    if (!isRestDay && startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setSaving(true);

    try {
      if (isEditing && existingEntry) {
        const { error: updateError } = await updateScheduleEntry(existingEntry.id, {
          discipline: isRestDay ? null : (discipline as CreateScheduleEntryInput['discipline']),
          start_time: startTime,
          end_time: endTime,
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
          start_time: isRestDay ? '00:00' : startTime,
          end_time: isRestDay ? '23:59' : endTime,
          discipline: isRestDay ? undefined : (discipline as CreateScheduleEntryInput['discipline']),
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
        <Select
          label="Type"
          options={disciplineOptions}
          value={discipline}
          onChange={setDiscipline}
          placeholder="Select discipline or Rest Day..."
        />

        {!isRestDay && (
          <>
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
            placeholder="e.g. Focus on takedown defense"
            rows={2}
            className="w-full bg-[#0a1225] border border-white/[0.08] rounded-input px-3 py-2 text-white placeholder-white/40 transition-default focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-accent text-sm"
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
