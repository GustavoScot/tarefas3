const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// SQLite real em arquivo temporário; somente a ponte nativa e o sistema de notificações são simulados.
function fixture({ expoGo = false } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lembretes-test-'));
  const connections = [];
  const pending = new Map();
  const delivered = new Map();
  let scheduleFails = false;
  let channelFails = false;
  let channelCalls = 0;
  let allowed = true;
  const notifications = {
    SchedulableTriggerInputTypes: { DAILY: 'daily', DATE: 'date' },
    IosAuthorizationStatus: { PROVISIONAL: 3 },
    AndroidImportance: { HIGH: 4 },
    setNotificationHandler() {},
    async getPermissionsAsync() { return { granted: allowed, canAskAgain: false }; },
    async setNotificationChannelAsync() {
      channelCalls += 1;
      if (channelFails) throw new Error('NotificationsChannelsProvider ausente');
    },
    async setNotificationCategoryAsync() {},
    async getAllScheduledNotificationsAsync() { return [...pending.values()]; },
    async getPresentedNotificationsAsync() { return [...delivered.values()]; },
    async cancelScheduledNotificationAsync(id) { pending.delete(id); },
    async dismissNotificationAsync(id) { delivered.delete(id); },
    async scheduleNotificationAsync(request) {
      if (scheduleFails) throw new Error('Falha de agendamento');
      pending.set(request.identifier, request);
      return request.identifier;
    },
  };
  const sqlite = {
    async openDatabaseAsync(name) {
      const db = new DatabaseSync(path.join(directory, name));
      connections.push(db);
      return {
        async execAsync(sql) { db.exec(sql); },
        async runAsync(sql, ...values) {
          const result = db.prepare(sql).run(...values);
          return { changes: result.changes, lastInsertRowId: Number(result.lastInsertRowid) };
        },
        async getFirstAsync(sql, ...values) { return db.prepare(sql).get(...values) ?? null; },
        async getAllAsync(sql, ...values) { return db.prepare(sql).all(...values); },
      };
    },
  };
  function load(file, dependencies) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
    const module = { exports: {} };
    vm.runInNewContext(compiled.outputText, {
      module, exports: module.exports, Date, Set, Promise,
      require(name) {
        if (!(name in dependencies)) throw new Error(`Dependência inesperada: ${name}`);
        return dependencies[name];
      },
    }, { filename: file });
    return module.exports;
  }
  const database = load('src/database/reminders.ts', { 'expo-sqlite': sqlite });
  const service = load('src/services/notifications.ts', {
    'react-native': { Platform: { OS: 'android' } },
    'expo': { isRunningInExpoGo: () => expoGo },
    './localNotifications': notifications, '../database/reminders': database,
  });
  return {
    database, service, pending,
    reopen: () => load('src/database/reminders.ts', { 'expo-sqlite': sqlite }),
    failSchedule: () => { scheduleFails = true; },
    failChannel: () => { channelFails = true; },
    channelCalls: () => channelCalls,
    denyPermission: () => { allowed = false; },
    response(id, action = 'complete', date = Date.now(), snooze = false) {
      return { actionIdentifier: action, notification: { date,
        request: { identifier: `reminder-${id}${snooze ? '-snooze' : ''}`, content: { data: { reminderId: id } } },
      } };
    },
    close() { for (const connection of connections) connection.close(); fs.rmSync(directory, { recursive: true }); },
  };
}

const input = (recurrence = 'once') => ({ title: 'Estudar', description: 'Capítulo 2', time: '09:30', recurrence });

test('horário único usa hoje se futuro e amanhã se já passou, inclusive na virada do mês', () => {
  const f = fixture();
  try {
    assert.equal(f.service.nextOccurrence('09:30', new Date(2026, 0, 31, 8)).getDate(), 31);
    const tomorrow = f.service.nextOccurrence('09:30', new Date(2026, 0, 31, 9, 30));
    assert.equal(tomorrow.getMonth(), 1);
    assert.equal(tomorrow.getDate(), 1);
    assert.equal(tomorrow.getHours(), 9);
  } finally { f.close(); }
});

test('salva em SQLite, agenda com título e descrição e persiste ao reabrir', async () => {
  const f = fixture();
  try {
    await f.service.createReminder(input());
    const [reminder] = await f.reopen().listReminders();
    assert.equal(reminder.title, 'Estudar');
    assert.equal(reminder.status, 'active');
    const scheduled = f.pending.get(reminder.notification_id);
    assert.equal(scheduled.content.body, 'Capítulo 2');
    assert.equal(scheduled.content.categoryIdentifier, 'reminder-actions');
    assert.equal(scheduled.trigger.type, 'date');
  } finally { f.close(); }
});

test('concluir único remove agendamentos e atualiza o status', async () => {
  const f = fixture();
  try {
    await f.service.createReminder(input());
    await f.service.handleNotificationResponse(f.response(1, 'snooze'));
    await f.service.handleNotificationResponse(f.response(1));
    const reminder = await f.database.findReminder(1);
    assert.equal(reminder.status, 'completed');
    assert.ok(reminder.last_completed_at);
    assert.equal(reminder.snooze_notification_id, null);
    assert.equal(f.pending.size, 0);
  } finally { f.close(); }
});

test('concluir diário registra a conclusão e preserva somente a recorrência original', async () => {
  const f = fixture();
  try {
    await f.service.createReminder(input('daily'));
    await f.service.handleNotificationResponse(f.response(1, 'snooze'));
    await f.service.handleNotificationResponse(f.response(1));
    const reminder = await f.database.findReminder(1);
    assert.equal(reminder.status, 'active');
    assert.ok(reminder.last_completed_at);
    assert.equal(f.pending.size, 1);
    assert.equal(f.pending.get(reminder.notification_id).trigger.type, 'daily');
    assert.equal(f.pending.get(reminder.notification_id).trigger.hour, 9);
    assert.equal(f.pending.get(reminder.notification_id).trigger.minute, 30);
  } finally { f.close(); }
});

test('adiar é idempotente, agenda 10 minutos e evita duplicatas em respostas concorrentes', async () => {
  const f = fixture();
  try {
    await f.service.createReminder(input('daily'));
    const response = f.response(1, 'snooze');
    await Promise.all([f.service.handleNotificationResponse(response), f.service.handleNotificationResponse(response)]);
    const first = f.pending.get('reminder-1-snooze');
    await f.service.handleNotificationResponse(response);
    assert.equal(f.pending.get('reminder-1-snooze'), first);
    assert.ok(Math.abs(first.trigger.date.getTime() - Date.now() - 600000) < 2000);
    await f.service.handleNotificationResponse(f.response(1, 'snooze', Date.now() + 1, true));
    assert.equal(f.pending.size, 2);
  } finally { f.close(); }
});

test('cancelar remove todos os avisos do lembrete e preserva os de outro', async () => {
  const f = fixture();
  try {
    await f.service.createReminder(input('daily'));
    await f.service.createReminder(input());
    await f.service.handleNotificationResponse(f.response(1, 'snooze'));
    f.pending.set('orphan', { identifier: 'orphan', content: { data: { reminderId: 1 } } });
    await f.service.cancelReminder(1);
    assert.equal((await f.database.findReminder(1)).status, 'canceled');
    assert.equal((await f.database.listReminders()).length, 2);
    assert.equal(f.pending.size, 1);
    assert.ok(f.pending.has('reminder-2'));
    await f.service.handleNotificationResponse(f.response(1, 'snooze'));
    assert.equal(f.pending.size, 1);
  } finally { f.close(); }
});

test('falha de agendamento desfaz o cadastro e a fila continua funcionando', async () => {
  const f = fixture();
  try {
    f.failSchedule();
    await assert.rejects(f.service.createReminder(input()));
    assert.equal((await f.database.listReminders()).length, 0);
    assert.equal(f.pending.size, 0);
    await f.service.cancelReminder(99);
  } finally { f.close(); }
});

test('permissão negada e campos inválidos não criam registros nem agendamentos', async () => {
  const f = fixture();
  try {
    await assert.rejects(f.service.createReminder({ ...input(), time: '25:80' }));
    await assert.rejects(f.service.createReminder({ ...input(), title: ' ' }));
    f.denyPermission();
    await assert.rejects(f.service.createReminder(input()));
    assert.equal((await f.database.listReminders()).length, 0);
    assert.equal(f.pending.size, 0);
  } finally { f.close(); }
});

test('provedor nativo de canais ausente mantém SQLite acessível e impede cadastro sem agendamento', async () => {
  const f = fixture();
  try {
    f.failChannel();
    let stage;
    await assert.rejects(f.service.initializeNotifications(value => { stage = value; }), /NotificationsChannelsProvider/);
    assert.equal(stage, 'Criar canal de notificações');
    await assert.rejects(f.service.createReminder(input()), /O lembrete não foi salvo/);
    assert.equal((await f.database.listReminders()).length, 0);
    assert.equal(f.pending.size, 0);
  } finally { f.close(); }
});

test('Expo Go evita o provedor ausente e usa canal padrão em únicos, diários e adiamentos', async () => {
  const f = fixture({ expoGo: true });
  try {
    f.failChannel();
    await f.service.createReminder(input());
    await f.service.createReminder(input('daily'));
    await f.service.handleNotificationResponse(f.response(2, 'snooze'));
    assert.equal(f.channelCalls(), 0);
    assert.equal(f.pending.size, 3);
    for (const request of f.pending.values()) {
      assert.equal('channelId' in request.trigger, false);
      assert.equal(request.content.categoryIdentifier, 'reminder-actions');
    }
    await f.service.handleNotificationResponse(f.response(2));
    assert.equal((await f.database.findReminder(2)).status, 'active');
    assert.ok(f.pending.has('reminder-2'));
    assert.equal(f.pending.has('reminder-2-snooze'), false);
  } finally { f.close(); }
});

test('demora para processar a ação não acrescenta tempo ao adiamento', async () => {
  const f = fixture({ expoGo: true });
  try {
    await f.service.createReminder(input());
    const actionReceivedAt = Date.now() - 30000;
    await f.service.handleNotificationResponse(f.response(1, 'snooze'), actionReceivedAt);
    const request = f.pending.get('reminder-1-snooze');
    assert.equal(request.trigger.date.getTime(), actionReceivedAt + 600000);
    assert.equal(request.content.data.expectedAt, request.trigger.date.toISOString());
  } finally { f.close(); }
});

test('diagnóstico separa atraso de disparo nativo e observação tardia no JavaScript', () => {
  const f = fixture();
  try {
    const expected = new Date('2026-10-19T12:17:00Z').getTime();
    const result = f.service.logNotificationTiming({
      date: expected + 60000,
      request: { identifier: 'reminder-1-snooze', content: { data: { expectedAt: new Date(expected).toISOString() } } },
    }, 'response', expected + 90000);
    assert.equal(result.systemDelaySeconds, 60);
    assert.equal(result.jsObservationDelaySeconds, 30);
  } finally { f.close(); }
});

test('ação processada após vencer o adiamento agenda para o próximo segundo', async () => {
  const f = fixture({ expoGo: true });
  try {
    await f.service.createReminder(input());
    const before = Date.now();
    await f.service.handleNotificationResponse(f.response(1, 'snooze'), before - 660000);
    const scheduled = f.pending.get('reminder-1-snooze').trigger.date.getTime();
    assert.ok(scheduled >= before + 1000);
    assert.ok(scheduled <= Date.now() + 1000);
  } finally { f.close(); }
});
