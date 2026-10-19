import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreventRemove } from '@react-navigation/native';
import { PrimaryButton } from '../components/PrimaryButton';
import { createReminder } from '../services/notifications';
import { Recurrence, RootStackParamList } from '../types/reminder';
import { colors, spacing } from '../theme';

export function NewReminderScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'NewReminder'>) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('once');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  usePreventRemove(saving, () => undefined);
  // Navega depois que a proteção contra saída durante a gravação foi removida.
  useEffect(() => { if (saved && !saving) navigation.goBack(); }, [saved, saving, navigation]);

  async function save() {
    if (submitting.current) return;
    if (!title.trim() || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setError('Preencha o nome e um horário válido, como 08:30 ou 19:45.');
      return;
    }
    submitting.current = true;
    setError(''); setSaving(true);
    try {
      await createReminder({ title, description, time, recurrence });
      setSaved(true);
    } catch (cause) {
      Alert.alert('Não foi possível salvar', cause instanceof Error ? cause.message : 'Tente novamente.');
    } finally { submitting.current = false; setSaving(false); }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Um lembrete para você</Text>
          <Text style={styles.subtitle}>Defina o horário. A gente avisa quando chegar a hora.</Text>
          <View style={styles.form}>
            <Text style={styles.label} nativeID="title-label">Nome *</Text>
            <TextInput accessibilityLabel="Nome do lembrete, obrigatório" accessibilityLabelledBy="title-label" style={styles.input}
              placeholder="Ex.: Estudar para a prova" placeholderTextColor={colors.muted}
              value={title} onChangeText={setTitle} maxLength={120} editable={!saving} />
            <Text style={styles.label}>Descrição</Text>
            <TextInput accessibilityLabel="Descrição do lembrete" style={[styles.input, styles.description]}
              placeholder="Algum detalhe importante?" placeholderTextColor={colors.muted}
              value={description} onChangeText={setDescription} multiline maxLength={500} editable={!saving} />
            <Text style={styles.label}>Horário *</Text>
            <TextInput accessibilityLabel="Horário obrigatório, no formato de 24 horas, HH:MM" style={[styles.input, styles.time]}
              placeholder="08:30" placeholderTextColor={colors.muted} value={time}
              onChangeText={value => {
                const digits = value.replace(/\D/g, '').slice(0, 4);
                setTime(digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits);
              }} keyboardType="number-pad" maxLength={5} editable={!saving} />
            <Text style={styles.hint}>Formato de 24 horas (HH:MM).</Text>
            <Text style={styles.label}>Recorrência</Text>
            <View style={styles.options}>
              {([{ value: 'once', label: 'Uma vez' }, { value: 'daily', label: 'Diariamente' }] as const).map(option => (
                <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: recurrence === option.value }}
                  disabled={saving} onPress={() => setRecurrence(option.value)}
                  style={[styles.option, recurrence === option.value && styles.selected]}>
                  <Text style={[styles.optionText, recurrence === option.value && styles.selectedText]}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.hint}>{recurrence === 'once'
              ? 'Se o horário já passou hoje, o aviso será amanhã.'
              : 'Um aviso todos os dias. Concluir uma ocorrência mantém os próximos avisos.'}</Text>
          </View>
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <PrimaryButton title="Salvar Lembrete" onPress={() => { void save(); }} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.large, gap: spacing.medium, paddingBottom: spacing.huge },
  heading: { fontSize: 27, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, lineHeight: 23 },
  form: { backgroundColor: colors.surface, padding: spacing.large, borderRadius: 20, marginVertical: spacing.small },
  label: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.small, marginTop: spacing.medium },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, minHeight: 52, fontSize: 16, color: colors.text, backgroundColor: colors.background },
  description: { minHeight: 100, textAlignVertical: 'top' },
  time: { fontSize: 26, fontWeight: '600', fontVariant: ['tabular-nums'] },
  hint: { fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: spacing.small },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.small },
  option: { flexGrow: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', minHeight: 48 },
  selected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  optionText: { color: colors.muted, fontWeight: '600', fontSize: 14 },
  selectedText: { color: colors.primary }, error: { color: colors.danger, lineHeight: 22 },
});
