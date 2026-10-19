export type Recurrence = 'once' | 'daily';
export type ReminderStatus = 'active' | 'completed' | 'canceled';

export interface Reminder {
  id: number;
  title: string;
  description: string;
  time: string;
  recurrence: Recurrence;
  status: ReminderStatus;
  notification_id: string | null;
  snooze_notification_id: string | null;
  last_completed_at: string | null;
}

export type NewReminder = Pick<Reminder, 'title' | 'description' | 'time' | 'recurrence'>;
export type RootStackParamList = { Reminders: undefined; NewReminder: undefined };
