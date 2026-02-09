/**
 * CSV Export utility for MMA Tracker data.
 * Converts arrays of objects to CSV format and triggers download.
 */

interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
}

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCSV<T>(data: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((col) => escapeCSV(col.header)).join(',');
  const rows = data.map((row) =>
    columns.map((col) => escapeCSV(col.accessor(row))).join(',')
  );
  return [header, ...rows].join('\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Pre-defined export configurations for each data type

export function exportTrainingSessions(
  sessions: Array<{
    session_date: string;
    discipline: string;
    duration_minutes: number;
    intensity: number;
    notes?: string | null;
  }>
): void {
  const csv = generateCSV(sessions, [
    { header: 'Date', accessor: (r) => r.session_date },
    { header: 'Discipline', accessor: (r) => r.discipline },
    { header: 'Duration (min)', accessor: (r) => r.duration_minutes },
    { header: 'Intensity (1-10)', accessor: (r) => r.intensity },
    { header: 'Notes', accessor: (r) => r.notes },
  ]);
  downloadCSV(csv, `mma-training-sessions-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportCardioLogs(
  logs: Array<{
    session_date: string;
    cardio_type: string;
    duration_minutes: number;
    distance_km?: number | null;
    average_heart_rate?: number | null;
    max_heart_rate?: number | null;
    intervals: boolean;
    calories_estimate?: number | null;
    notes?: string | null;
  }>
): void {
  const csv = generateCSV(logs, [
    { header: 'Date', accessor: (r) => r.session_date },
    { header: 'Type', accessor: (r) => r.cardio_type },
    { header: 'Duration (min)', accessor: (r) => r.duration_minutes },
    { header: 'Distance (km)', accessor: (r) => r.distance_km },
    { header: 'Avg Heart Rate', accessor: (r) => r.average_heart_rate },
    { header: 'Max Heart Rate', accessor: (r) => r.max_heart_rate },
    { header: 'Intervals', accessor: (r) => (r.intervals ? 'Yes' : 'No') },
    { header: 'Calories', accessor: (r) => r.calories_estimate },
    { header: 'Notes', accessor: (r) => r.notes },
  ]);
  downloadCSV(csv, `mma-cardio-logs-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportStrengthLogs(
  logs: Array<{
    workout_date: string;
    exercise_name: string;
    exercise_category?: string | null;
    muscle_group?: string | null;
    sets: Array<{ reps: number; weight: number; rpe?: number | null }>;
    total_volume?: number | null;
    notes?: string | null;
  }>
): void {
  const csv = generateCSV(logs, [
    { header: 'Date', accessor: (r) => r.workout_date },
    { header: 'Exercise', accessor: (r) => r.exercise_name },
    { header: 'Category', accessor: (r) => r.exercise_category },
    { header: 'Muscle Group', accessor: (r) => r.muscle_group },
    {
      header: 'Sets',
      accessor: (r) =>
        r.sets
          .map(
            (s, i) =>
              `Set ${i + 1}: ${s.weight}lbs x ${s.reps}${s.rpe ? ` @RPE${s.rpe}` : ''}`
          )
          .join('; '),
    },
    { header: 'Total Volume', accessor: (r) => r.total_volume },
    { header: 'Notes', accessor: (r) => r.notes },
  ]);
  downloadCSV(csv, `mma-strength-logs-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportBodyMetrics(
  metrics: Array<{
    metric_date: string;
    weight: number;
    body_fat_percentage?: number | null;
    notes?: string | null;
  }>
): void {
  const csv = generateCSV(metrics, [
    { header: 'Date', accessor: (r) => r.metric_date },
    { header: 'Weight', accessor: (r) => r.weight },
    { header: 'Body Fat %', accessor: (r) => r.body_fat_percentage },
    { header: 'Notes', accessor: (r) => r.notes },
  ]);
  downloadCSV(csv, `mma-body-metrics-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportGoals(
  goals: Array<{
    title: string;
    category: string;
    target_value?: number | null;
    current_value?: number | null;
    unit?: string | null;
    target_date?: string | null;
    status: string;
    completed_at?: string | null;
  }>
): void {
  const csv = generateCSV(goals, [
    { header: 'Title', accessor: (r) => r.title },
    { header: 'Category', accessor: (r) => r.category },
    { header: 'Target', accessor: (r) => (r.target_value ? `${r.target_value} ${r.unit || ''}` : '') },
    { header: 'Current', accessor: (r) => (r.current_value ? `${r.current_value} ${r.unit || ''}` : '') },
    { header: 'Target Date', accessor: (r) => r.target_date },
    { header: 'Status', accessor: (r) => r.status },
    { header: 'Completed At', accessor: (r) => r.completed_at },
  ]);
  downloadCSV(csv, `mma-goals-${new Date().toISOString().split('T')[0]}.csv`);
}
