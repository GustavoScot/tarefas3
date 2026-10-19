import * as SQLite from 'expo-sqlite';
import { NewReminder, Reminder, ReminderStatus } from '../types/reminder';

let database: Promise<SQLite.SQLiteDatabase> | undefined;

export function getDatabase() {
  if (!database) {
    database = (async () => {
      const db = await SQLite.openDatabaseAsync('lembretes.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          time TEXT NOT NULL,
          recurrence TEXT NOT NULL CHECK (recurrence IN ('once', 'daily')),
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'canceled')),
          notification_id TEXT,
          snooze_notification_id TEXT,
          last_completed_at TEXT
        );
        CREATE TABLE IF NOT EXISTS handled_responses (id TEXT PRIMARY KEY);
      `);
      return db;
    })().catch(error => { database = undefined; throw error; });
  }
  return database;
}

export async function listReminders() {
  const db = await getDatabase();
  return db.getAllAsync<Reminder>(`SELECT * FROM reminders
    ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'completed' THEN 1 ELSE 2 END, time, id DESC`);
}

export async function findReminder(id: number) {
  return (await getDatabase()).getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', id);
}

export async function insertReminder(input: NewReminder) {
  const result = await (await getDatabase()).runAsync(
    'INSERT INTO reminders (title, description, time, recurrence) VALUES (?, ?, ?, ?)',
    input.title, input.description, input.time, input.recurrence,
  );
  return result.lastInsertRowId;
}

export async function setNotificationIds(id: number, original: string | null, snooze: string | null) {
  await (await getDatabase()).runAsync(
    'UPDATE reminders SET notification_id = ?, snooze_notification_id = ? WHERE id = ?', original, snooze, id,
  );
}

export async function setReminderStatus(id: number, status: ReminderStatus, completedAt: string | null) {
  await (await getDatabase()).runAsync(
    'UPDATE reminders SET status = ?, last_completed_at = ? WHERE id = ?', status, completedAt, id,
  );
}
