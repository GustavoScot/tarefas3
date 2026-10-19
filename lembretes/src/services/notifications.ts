import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import * as Notifications from './localNotifications';
import { findReminder, getDatabase, insertReminder, setNotificationIds, setReminderStatus } from '../database/reminders';
import { NewReminder, Reminder } from '../types/reminder';

const CHANNEL = 'reminders';
const CATEGORY = 'reminder-actions';
const COMPLETE = 'complete';
const SNOOZE = 'snooze';
const SNOOZE_DELAY_MS = 10 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

// Serializa salvar, cancelar e responder para impedir conflitos entre as ações.
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = queue.then(operation);
  queue = result.catch(() => undefined);
  return result;
}

export async function initializeNotifications(onStep: (step: string) => void = () => undefined) {
  if (Platform.OS === 'android' && !isRunningInExpoGo()) {
    onStep('Criar canal de notificações');
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Lembretes', importance: Notifications.AndroidImportance.HIGH, sound: 'default',
    });
  } else if (Platform.OS === 'android') {
    // O Expo cria o canal padrão ao apresentar a notificação. Esse caminho não
    // usa o provedor de canais personalizados ausente no Expo Go 57 em uso.
    onStep('Usar canal padrão de notificações do Expo Go');
  }
  onStep('Registrar ações Concluir e Adiar');
  await Notifications.setNotificationCategoryAsync(CATEGORY, [
    { identifier: COMPLETE, buttonTitle: 'Concluir', options: { opensAppToForeground: true } },
    { identifier: SNOOZE, buttonTitle: 'Adiar 10 min', options: { opensAppToForeground: true } },
  ]);
  onStep('Consultar e solicitar permissão de notificações');
  return requestNotificationPermission();
}

function channelOptions() {
  return Platform.OS === 'android' && !isRunningInExpoGo() ? { channelId: CHANNEL } : {};
}

export async function requestNotificationPermission() {
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && permission.canAskAgain) {
    permission = await Notifications.requestPermissionsAsync();
  }
  return permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export function nextOccurrence(time: string, now = new Date()) {
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date(now);
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() <= now.getTime()) date.setDate(date.getDate() + 1);
  return date;
}

function content(reminder: Pick<Reminder, 'id' | 'title' | 'description'>, timing: Record<string, string | number | boolean> = {}) {
  return {
    title: reminder.title, body: reminder.description, sound: 'default',
    categoryIdentifier: CATEGORY, data: { reminderId: reminder.id, ...timing },
  };
}

// No Android, notification.date é o horário nativo de disparo, preservado até
// a resposta. O listener JS pode executar depois, principalmente ao abrir o app.
export function logNotificationTiming(notification: Notifications.Notification, source: 'listener' | 'response', observedAt = Date.now()) {
  const data = notification.request.content.data;
  const expected = typeof data?.expectedAt === 'string' ? Date.parse(data.expectedAt) : NaN;
  const dispatched = notification.date;
  const timing = {
    notificationId: notification.request.identifier,
    source,
    expectedAt: Number.isFinite(expected) ? new Date(expected).toISOString() : null,
    nativeDispatchedAt: new Date(dispatched).toISOString(),
    jsObservedAt: new Date(observedAt).toISOString(),
    systemDelaySeconds: Platform.OS === 'android' && Number.isFinite(expected) ? (dispatched - expected) / 1000 : null,
    jsObservationDelaySeconds: (observedAt - dispatched) / 1000,
  };
  console.info('[Tempos] Notificação', JSON.stringify(timing));
  return timing;
}

// Busca também por reminderId para recuperar agendamentos mesmo após uma falha de gravação.
async function cancelPending(reminder: Reminder, snoozeOnly = false) {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  const ids = new Set<string>();
  if (reminder.snooze_notification_id) ids.add(reminder.snooze_notification_id);
  if (!snoozeOnly && reminder.notification_id) ids.add(reminder.notification_id);
  for (const request of pending) {
    if (request.content.data?.reminderId === reminder.id &&
      (!snoozeOnly || request.content.data?.snoozed === true)) ids.add(request.identifier);
  }
  for (const id of ids) await Notifications.cancelScheduledNotificationAsync(id);
}

async function dismissDelivered(reminderId: number) {
  const delivered = await Notifications.getPresentedNotificationsAsync();
  for (const notification of delivered) {
    if (notification.request.content.data?.reminderId === reminderId) {
      await Notifications.dismissNotificationAsync(notification.request.identifier);
    }
  }
}

export function createReminder(input: NewReminder) {
  return serialize(async () => {
    if (!input.title.trim() || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) {
      throw new Error('Informe um nome e um horário válido no formato HH:MM.');
    }
    let allowed: boolean;
    try {
      allowed = await initializeNotifications();
    } catch (cause) {
      console.error('[Notificações] Falha ao preparar o agendamento:', cause);
      throw new Error('Não foi possível configurar as notificações. Confira a mensagem no console e as permissões do aparelho. O lembrete não foi salvo.');
    }
    if (!allowed) {
      throw new Error('Permita as notificações nas configurações do aparelho para salvar um lembrete.');
    }
    const id = await insertReminder({ ...input, title: input.title.trim(), description: input.description.trim() });
    const identifier = `reminder-${id}`;
    try {
      const [hour, minute] = input.time.split(':').map(Number);
      const expectedAt = nextOccurrence(input.time);
      await Notifications.scheduleNotificationAsync({
        identifier, content: content({ ...input, id }, {
          recurrence: input.recurrence, scheduledTime: input.time,
          ...(input.recurrence === 'once' ? { expectedAt: expectedAt.toISOString() } : {}),
        }),
        trigger: input.recurrence === 'daily'
          ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, ...channelOptions() }
          : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: expectedAt, ...channelOptions() },
      });
      await setNotificationIds(id, identifier, null);
      console.info('[Tempos] Agendado', JSON.stringify({ notificationId: identifier, scheduledAt: new Date().toISOString(), expectedAt: expectedAt.toISOString(), recurrence: input.recurrence }));
    } catch (error) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      await (await getDatabase()).runAsync('DELETE FROM reminders WHERE id = ?', id);
      throw error;
    }
  });
}

export function cancelReminder(id: number) {
  return serialize(async () => {
    const reminder = await findReminder(id);
    if (!reminder || reminder.status !== 'active') return;
    await cancelPending(reminder);
    await setReminderStatus(id, 'canceled', reminder.last_completed_at);
    await setNotificationIds(id, null, null);
    await dismissDelivered(id);
  });
}

export function handleNotificationResponse(response: Notifications.NotificationResponse, actionReceivedAt = Date.now()) {
  return serialize(async () => {
    if (![COMPLETE, SNOOZE].includes(response.actionIdentifier)) return;
    const notification = response.notification;
    const id = notification.request.content.data?.reminderId;
    if (typeof id !== 'number') return;
    // A mesma resposta pode chegar pelo listener e pela abertura a frio.
    const key = `${notification.request.identifier}:${notification.date}:${response.actionIdentifier}`;
    const db = await getDatabase();
    if (await db.getFirstAsync('SELECT id FROM handled_responses WHERE id = ?', key)) return;
    const reminder = await findReminder(id);
    if (!reminder || reminder.status !== 'active') return;
    if (response.actionIdentifier === COMPLETE) {
      await cancelPending(reminder, reminder.recurrence === 'daily');
      await setReminderStatus(id, reminder.recurrence === 'once' ? 'completed' : 'active', new Date().toISOString());
      await setNotificationIds(id, reminder.recurrence === 'daily' ? reminder.notification_id : null, null);
    } else {
      await cancelPending(reminder, true);
      // Identificador estável: um novo adiamento substitui o anterior.
      const identifier = `reminder-${id}-snooze`;
      // Conta a partir da entrada da ação no JS, sem somar o tempo de espera
      // pela inicialização, fila, consultas SQLite e cancelamentos nativos.
      const expectedAt = new Date(Math.max(actionReceivedAt + SNOOZE_DELAY_MS, Date.now() + 1000));
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: content(reminder, { snoozed: true, expectedAt: expectedAt.toISOString() }),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: expectedAt, ...channelOptions() },
      });
      await setNotificationIds(id, reminder.notification_id, identifier);
      console.info('[Tempos] Adiado', JSON.stringify({
        notificationId: identifier, actionReceivedAt: new Date(actionReceivedAt).toISOString(),
        scheduledAt: new Date().toISOString(), expectedAt: expectedAt.toISOString(),
        processingDelaySeconds: (Date.now() - actionReceivedAt) / 1000,
      }));
    }
    await db.runAsync('INSERT OR IGNORE INTO handled_responses (id) VALUES (?)', key);
    await dismissDelivered(id);
  });
}
