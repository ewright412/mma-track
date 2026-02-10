/**
 * Push notification utilities for training reminders.
 * Handles permission requests and scheduling local notifications.
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export function sendTrainingReminder(): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const messages = [
    "You haven't trained today. Time to hit the gym!",
    "No training logged today. Even 30 minutes counts!",
    "Rest days are important, but is today one? Log your training!",
    "Champions train every day. Log your session!",
    "Your training streak is waiting. Don't break it!",
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification('Clinch', {
        body: message,
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-96x96.svg',
        tag: 'training-reminder',
        data: { url: '/training/new' },
      });
    });
  } else {
    new Notification('Clinch', {
      body: message,
      icon: '/icons/icon-192x192.svg',
      tag: 'training-reminder',
    });
  }
}

const REMINDER_KEY = 'clinch-reminder-settings';

interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:mm format
  lastChecked: string | null; // ISO date string
}

export function getReminderSettings(): ReminderSettings {
  if (typeof window === 'undefined') {
    return { enabled: false, time: '19:00', lastChecked: null };
  }
  const stored = localStorage.getItem(REMINDER_KEY);
  if (stored) {
    return JSON.parse(stored) as ReminderSettings;
  }
  return { enabled: false, time: '19:00', lastChecked: null };
}

export function saveReminderSettings(settings: ReminderSettings): void {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
}

/**
 * Check if a reminder should be sent based on settings and whether
 * the user has trained today. Call this on app load.
 */
export function checkAndScheduleReminder(hasTrainedToday: boolean): void {
  const settings = getReminderSettings();
  if (!settings.enabled) return;

  const today = new Date().toISOString().split('T')[0];
  if (settings.lastChecked === today) return; // Already checked today

  const now = new Date();
  const [hours, minutes] = settings.time.split(':').map(Number);
  const reminderTime = new Date();
  reminderTime.setHours(hours, minutes, 0, 0);

  if (now >= reminderTime && !hasTrainedToday) {
    sendTrainingReminder();
  }

  // Mark as checked today
  saveReminderSettings({ ...settings, lastChecked: today });
}
