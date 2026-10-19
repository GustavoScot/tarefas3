import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Reminder } from '../types/reminder';
import { colors, spacing } from '../theme';

const statusLabels = { active: 'Ativo', completed: 'Concluído', canceled: 'Cancelado' };

export function ReminderCard({ reminder, onCancel, canceling }: {
  reminder: Reminder; onCancel: () => void; canceling: boolean;
}) {
  const active = reminder.status === 'active';
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.time}>{reminder.time}</Text>
        <View style={[styles.badge, reminder.status === 'completed' && styles.completed, reminder.status === 'canceled' && styles.canceled]}>
          <Text style={[styles.status, reminder.status === 'completed' && styles.completedText, reminder.status === 'canceled' && styles.canceledText]}>{statusLabels[reminder.status]}</Text>
        </View>
      </View>
      <Text style={styles.title}>{reminder.title}</Text>
      {!!reminder.description && <Text style={styles.description}>{reminder.description}</Text>}
      <Text style={styles.recurrence}>{reminder.recurrence === 'daily' ? 'Diariamente' : 'Uma vez · próxima ocorrência'}</Text>
      {reminder.last_completed_at && <Text style={styles.detail}>Última conclusão: {new Date(reminder.last_completed_at).toLocaleString('pt-BR')}</Text>}
      {active && <Pressable accessibilityRole="button" accessibilityLabel={`Cancelar notificações de ${reminder.title}`}
        disabled={canceling} onPress={onCancel} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
        <Text style={styles.cancelText}>{canceling ? 'Cancelando…' : 'Cancelar notificações'}</Text>
      </Pressable>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.large, borderWidth: 1, borderColor: colors.border, gap: spacing.small },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.small, flexWrap: 'wrap' },
  time: { fontSize: 30, fontWeight: '700', color: colors.primary, fontVariant: ['tabular-nums'] },
  badge: { backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  status: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  completed: { backgroundColor: colors.successSoft }, completedText: { color: colors.success },
  canceled: { backgroundColor: colors.dangerSoft }, canceledText: { color: colors.danger },
  title: { fontSize: 19, fontWeight: '700', color: colors.text },
  description: { fontSize: 15, lineHeight: 22, color: colors.muted },
  recurrence: { color: colors.muted, fontSize: 14, marginTop: 4 },
  detail: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  cancelButton: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', marginTop: 4 },
  cancelText: { color: colors.danger, fontWeight: '600', fontSize: 14 },
  pressed: { opacity: 0.6 },
});
