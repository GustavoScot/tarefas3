import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from './src/services/localNotifications';
import { getDatabase } from './src/database/reminders';
import { handleNotificationResponse, initializeNotifications, logNotificationTiming } from './src/services/notifications';
import { RemindersScreen } from './src/screens/RemindersScreen';
import { NewReminderScreen } from './src/screens/NewReminderScreen';
import { RootStackParamList } from './src/types/reminder';
import { PrimaryButton } from './src/components/PrimaryButton';
import { colors, spacing } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, primary: colors.primary, text: colors.text, border: colors.border } };

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let alive = true;
    let notificationsReady = false;
    let step = 'Abrir banco SQLite e criar tabelas';
    const reportStep = (nextStep: string) => {
      step = nextStep;
      console.info(`[Inicialização · tentativa ${attempt + 1}] ${step}`);
    };
    const refresh = () => { if (alive) setRevision(value => value + 1); };
    const initialization = (async () => {
      reportStep('Abrir banco SQLite e criar tabelas');
      await getDatabase();
      let allowed: boolean;
      try {
        allowed = await initializeNotifications(reportStep);
        notificationsReady = true;
        if (alive) setNotificationError('');
      } catch (cause) {
        console.error(`[Notificações] Falha na etapa: ${step}`, cause);
        if (alive) setNotificationError('Não foi possível configurar as notificações. Confira as permissões do aparelho. O erro completo foi registrado no console.');
        return;
      }
      if (alive && !allowed) Alert.alert('Permita as notificações', 'Ative as notificações nas configurações para criar e receber lembretes.', [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Abrir configurações', onPress: () => { void Linking.openSettings(); } },
      ]);
    })();
    const respond = async (response: Notifications.NotificationResponse) => {
      const actionReceivedAt = Date.now();
      try {
        logNotificationTiming(response.notification, 'response', actionReceivedAt);
        await initialization;
        if (!notificationsReady) return;
        await handleNotificationResponse(response, actionReceivedAt);
        refresh();
      } catch (cause) {
        console.error('[Notificações] Falha ao processar resposta:', cause);
        if (alive) Alert.alert('Não foi possível processar a notificação', 'Abra novamente o aplicativo para tentar processar a ação pendente.');
      }
    };
    const responses = Notifications.addNotificationResponseReceivedListener(response => { void respond(response); });
    const received = Notifications.addNotificationReceivedListener(notification => {
      logNotificationTiming(notification, 'listener');
      refresh();
    });
    const appState = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    void (async () => {
      try {
        await initialization;
        if (notificationsReady) {
          reportStep('Consultar resposta pendente de notificação');
          try {
            const pending = await Notifications.getLastNotificationResponseAsync();
            if (pending) await respond(pending);
          } catch (cause) {
            console.error('[Notificações] Falha ao consultar resposta pendente:', cause);
            if (alive) setNotificationError('Não foi possível consultar a ação pendente da notificação. Reabra o aplicativo para tentar novamente.');
          }
        }
        if (alive) {
          setError(''); setReady(true);
          console.info(notificationsReady
            ? '[Inicialização] Lista pronta; serviço de notificações configurado.'
            : '[Inicialização] Lista pronta; notificações indisponíveis.');
        }
      } catch (cause) {
        console.error(`[Inicialização] Falha na etapa: ${step}`, cause);
        const detail = cause instanceof Error ? cause.message : String(cause);
        if (alive) setError(`Etapa: ${step}\n\n${detail}`);
      }
    })();
    return () => { alive = false; responses.remove(); received.remove(); appState.remove(); };
  }, [attempt]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {Platform.OS === 'web' ? <View style={styles.center}><Text style={styles.message}>Execute no Android ou iOS. Este aplicativo utiliza SQLite e notificações locais nativas.</Text></View>
        : !ready ? <View style={styles.center}>{error ? <><Text style={styles.message}>Não foi possível preparar o aplicativo.</Text><ScrollView style={styles.errorBox} contentContainerStyle={styles.errorContent}><Text selectable style={styles.errorDetails}>{error}</Text></ScrollView><PrimaryButton title="Tentar novamente" onPress={() => { console.info('[Inicialização] Tentar novamente acionado.'); setError(''); setAttempt(value => value + 1); }} /></>
          : <><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.message}>Preparando seus lembretes…</Text></>}</View>
          : <NavigationContainer theme={theme}>
            <Stack.Navigator screenOptions={{ headerShadowVisible: false, headerTintColor: colors.primary, headerTitleStyle: { color: colors.text, fontWeight: '700' }, contentStyle: { backgroundColor: colors.background } }}>
              <Stack.Screen name="Reminders" options={{ title: 'Meus Lembretes' }}>{props => <RemindersScreen {...props} revision={revision}
                notificationError={notificationError} />}</Stack.Screen>
              <Stack.Screen name="NewReminder" component={NewReminderScreen} options={{ title: 'Novo Lembrete' }} />
            </Stack.Navigator>
          </NavigationContainer>}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, padding: spacing.large, gap: spacing.large, justifyContent: 'center', backgroundColor: colors.background },
  message: { fontSize: 16, color: colors.muted, textAlign: 'center', lineHeight: 24 },
  errorBox: { maxHeight: 260, flexGrow: 0, borderRadius: 12, backgroundColor: colors.dangerSoft },
  errorContent: { padding: spacing.medium },
  errorDetails: { fontSize: 14, lineHeight: 21, color: colors.danger },
});
