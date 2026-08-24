import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

type InterestRate = 10 | 25 | 50;

const INTEREST_OPTIONS: Array<{
  rate: InterestRate;
  label: string;
  description: string;
}> = [
  { rate: 10, label: 'Parceiro', description: 'Juros leves' },
  { rate: 25, label: 'Conhecido', description: 'Juros médios' },
  { rate: 50, label: 'Arriscado', description: 'Juros altos' },
];

function parseCurrency(value: string): number {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) / 100 : 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function App() {
  const [amountInput, setAmountInput] = useState('R$ 0,00');
  const [interestRate, setInterestRate] = useState<InterestRate>(10);
  const [shouldRound, setShouldRound] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const amount = useMemo(() => parseCurrency(amountInput), [amountInput]);
  const interest = amount * (interestRate / 100);
  const exactTotal = amount + interest;
  const total = shouldRound ? Math.ceil(exactTotal) : exactTotal;

  function handleAmountChange(value: string) {
    setAmountInput(formatCurrency(parseCurrency(value)));
    setHasCalculated(false);
  }

  function selectRate(rate: InterestRate) {
    setInterestRate(rate);
    setHasCalculated(false);
  }

  function toggleRounding(value: boolean) {
    setShouldRound(value);
    setHasCalculated(false);
  }

  function calculate() {
    if (amount > 0) setHasCalculated(true);
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>$</Text>
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.eyebrow}>CALCULADORA FINANCEIRA</Text>
              <Text style={styles.title}>Desafio dos juros</Text>
              <Text style={styles.subtitle}>
                Calcule quanto a pessoa deverá devolver para você.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>VALOR EMPRESTADO</Text>
            <TextInput
              accessibilityLabel="Valor emprestado"
              keyboardType="numeric"
              onChangeText={handleAmountChange}
              placeholder="R$ 0,00"
              placeholderTextColor="#83918B"
              returnKeyType="done"
              selectionColor="#0D7467"
              style={styles.input}
              value={amountInput}
            />

            <Text style={[styles.sectionLabel, styles.interestTitle]}>
              TAXA DE JUROS
            </Text>
            <View accessibilityRole="radiogroup" style={styles.options}>
              {INTEREST_OPTIONS.map((option) => {
                const isSelected = option.rate === interestRate;
                return (
                  <Pressable
                    accessibilityLabel={`${option.rate}% - ${option.label}`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    key={option.rate}
                    onPress={() => selectRate(option.rate)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.optionRate, isSelected && styles.optionTextSelected]}>
                      {option.rate}%
                    </Text>
                    <Text style={[styles.optionLabel, isSelected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        isSelected && styles.optionDescriptionSelected,
                      ]}
                    >
                      {option.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.roundingRow}>
              <View style={styles.roundingContent}>
                <Text style={styles.roundingTitle}>Arredondar resultado</Text>
                <Text style={styles.roundingDescription}>Para o próximo real inteiro</Text>
              </View>
              <Switch
                accessibilityLabel="Arredondar resultado"
                onValueChange={toggleRounding}
                thumbColor="#FFFFFF"
                trackColor={{ false: '#CBD3CF', true: '#0D7467' }}
                value={shouldRound}
              />
            </View>
          </View>

          <View
            accessibilityLabel={
              hasCalculated
                ? `Total a receber: ${formatCurrency(total)}`
                : 'Informe um valor e toque em calcular'
            }
            accessibilityLiveRegion="polite"
            style={[styles.resultCard, hasCalculated && styles.resultCardActive]}
          >
            <Text style={styles.resultLabel}>TOTAL A RECEBER</Text>
            <Text style={styles.resultValue}>
              {hasCalculated ? formatCurrency(total) : 'R$ —'}
            </Text>
            <View style={styles.breakdown}>
              <Text style={styles.breakdownText}>Empréstimo {formatCurrency(amount)}</Text>
              <Text style={styles.breakdownDot}>•</Text>
              <Text style={styles.breakdownText}>Juros {formatCurrency(interest)}</Text>
            </View>
          </View>

          <Pressable
            accessibilityHint="Soma a taxa selecionada ao valor emprestado"
            accessibilityLabel="Calcular total"
            accessibilityRole="button"
            accessibilityState={{ disabled: amount <= 0 }}
            disabled={amount <= 0}
            onPress={calculate}
            style={({ pressed }) => [
              styles.button,
              amount <= 0 && styles.buttonDisabled,
              pressed && amount > 0 && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Calcular agora</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#F2F5EF' },
  container: {
    flexGrow: 1,
    paddingBottom: 32,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 54 : 24,
  },
  header: { alignItems: 'flex-start', flexDirection: 'row', marginBottom: 26 },
  logo: {
    alignItems: 'center',
    backgroundColor: '#C9F36A',
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    marginRight: 14,
    width: 54,
  },
  logoText: { color: '#123C35', fontSize: 28, fontWeight: '900' },
  headerContent: { flex: 1 },
  eyebrow: { color: '#63716B', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: {
    color: '#123C35',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: 3,
  },
  subtitle: { color: '#63716B', fontSize: 14, lineHeight: 20, marginTop: 5 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E7E2',
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
  },
  sectionLabel: { color: '#63716B', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  input: {
    backgroundColor: '#F5F7F4',
    borderColor: '#DCE4DF',
    borderRadius: 16,
    borderWidth: 1,
    color: '#123C35',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  interestTitle: { marginTop: 25 },
  options: { flexDirection: 'row', gap: 8, marginTop: 10 },
  option: {
    alignItems: 'center',
    backgroundColor: '#F5F7F4',
    borderColor: '#E1E7E2',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 13,
  },
  optionSelected: { backgroundColor: '#0D7467', borderColor: '#0D7467' },
  optionRate: { color: '#123C35', fontSize: 20, fontWeight: '900' },
  optionLabel: { color: '#354A44', fontSize: 11, fontWeight: '700', marginTop: 3 },
  optionDescription: { color: '#82908A', fontSize: 9, marginTop: 2, textAlign: 'center' },
  optionTextSelected: { color: '#FFFFFF' },
  optionDescriptionSelected: { color: '#BCE4DB' },
  roundingRow: {
    alignItems: 'center',
    borderTopColor: '#E8EDE9',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
    paddingTop: 18,
  },
  roundingContent: { flex: 1 },
  roundingTitle: { color: '#123C35', fontSize: 14, fontWeight: '700' },
  roundingDescription: { color: '#82908A', fontSize: 12, marginTop: 2 },
  resultCard: {
    alignItems: 'center',
    backgroundColor: '#E4EAE6',
    borderRadius: 24,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 19,
  },
  resultCardActive: { backgroundColor: '#DDF7D2' },
  resultLabel: { color: '#63716B', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  resultValue: {
    color: '#123C35',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    marginTop: 3,
  },
  breakdown: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 5 },
  breakdownText: { color: '#63716B', fontSize: 11 },
  breakdownDot: { color: '#91A09A', fontSize: 11, marginHorizontal: 7 },
  button: {
    alignItems: 'center',
    backgroundColor: '#123C35',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 58,
    paddingHorizontal: 20,
  },
  buttonDisabled: { backgroundColor: '#AAB5B0' },
  buttonPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  pressed: { opacity: 0.85 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  buttonArrow: { color: '#C9F36A', fontSize: 24, fontWeight: '700', marginLeft: 10 },
});
