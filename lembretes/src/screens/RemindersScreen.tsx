import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listReminders } from '../database/reminders';
import { cancelReminder } from '../services/notifications';
import { Reminder, RootStackParamList } from '../types/reminder';
import { PrimaryButton } from '../components/PrimaryButton';
import { ReminderCard } from '../components/ReminderCard';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Reminders'> & {
  revision: number; notificationError: string;
};

export function RemindersScreen({ navigation, revision, notificationError }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState<number | null>(null);

  const load = useCallback(async () => {
    try { setReminders(await listReminders()); setError(''); }
    catch { setError('Não foi possível carregar os lembretes. Puxe a lista para tentar novamente.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load, revision]);
  useEffect(() => navigation.addListener('focus', () => { void load(); }), [navigation, load]);

  async function cancel(id: number) {
    setCanceling(id);
    try { await cancelReminder(id); }
    catch { Alert.alert('Não foi possível cancelar', 'Tente novamente para cancelar todas as notificações deste lembrete.'); }
    finally { await load(); setCanceling(null); }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FlatList data={reminders} keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list} refreshing={loading} onRefresh={() => { setLoading(true); void load(); }}
        ListHeaderComponent={<View style={styles.intro}>
          <Text style={styles.eyebrow}>UM DIA MAIS LEVE</Text>
          <Text style={styles.heading}>O que você quer lembrar?</Text>
          <Text style={styles.subtitle}>Seus horários e pequenos compromissos, em um só lugar.</Text>
          {!!notificationError && <View style={styles.warning}>
            <Text accessibilityRole="alert" style={styles.error}>{notificationError}</Text>
          </View>}
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        </View>}
        ListEmptyComponent={loading ? <ActivityIndicator size="large" color={colors.primary} /> : <View style={styles.empty}>
          <Text style={styles.emptyIcon}>◷</Text>
          <Text style={styles.emptyTitle}>Nenhum lembrete por aqui</Text>
          <Text style={styles.subtitle}>Crie seu primeiro lembrete e deixe o resto com a gente.</Text>
        </View>}
        ItemSeparatorComponent={() => <View style={{ height: spacing.medium }} />}
        renderItem={({ item }) => <ReminderCard reminder={item} canceling={canceling === item.id}
          onCancel={() => {
            if (canceling !== null) return;
            Alert.alert('Cancelar notificações?', `“${item.title}” continuará na lista como cancelado.`, [
              { text: 'Voltar', style: 'cancel' },
              { text: 'Cancelar notificações', style: 'destructive', onPress: () => { void cancel(item.id); } },
            ]);
          }} />}
      />
      <View style={styles.footer}><PrimaryButton title="+ Novo lembrete" onPress={() => navigation.navigate('NewReminder')} /></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.large, flexGrow: 1 },
  intro: { gap: spacing.small, marginBottom: spacing.large },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  heading: { fontSize: 27, fontWeight: '700', color: colors.text, lineHeight: 34 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  error: { color: colors.danger, lineHeight: 22 },
  warning: { backgroundColor: colors.dangerSoft, borderRadius: 16, padding: spacing.medium, gap: spacing.medium, marginTop: spacing.small },
  empty: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.large, gap: spacing.medium, marginTop: spacing.large },
  emptyIcon: { fontSize: 48, color: colors.primary },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  footer: { padding: spacing.large, paddingTop: spacing.medium, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
});
