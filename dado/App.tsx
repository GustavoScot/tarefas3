import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { DiceFace, type DiceValue } from './src/components/DiceFace';
import { DICE_MESSAGES } from './src/constants/diceMessages';
import { rollDie } from './src/utils/rollDie';

export default function App() {
  const [result, setResult] = useState<DiceValue>(1);

  const handleRoll = () => setResult(rollDie());

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>DESAFIO DO DADO</Text>
          <Text style={styles.title}>Tente a sua sorte</Text>
          <Text style={styles.subtitle}>
            Toque no botão e descubra qual número vai aparecer.
          </Text>
        </View>

        <View
          accessibilityLabel={`Resultado: ${result}. ${DICE_MESSAGES[result]}`}
          accessibilityLiveRegion="polite"
          style={styles.resultCard}
        >
          <DiceFace value={result} />
          <Text style={styles.resultNumber}>{result}</Text>
          <Text style={styles.message}>{DICE_MESSAGES[result]}</Text>
        </View>

        <Pressable
          accessibilityHint="Sorteia um novo número entre 1 e 6"
          accessibilityLabel="Jogar o dado"
          accessibilityRole="button"
          onPress={handleRoll}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>JOGAR O DADO</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#151130' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 44,
  },
  header: { alignItems: 'center', maxWidth: 360 },
  eyebrow: {
    color: '#A99CFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#B8B3D0',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    textAlign: 'center',
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: '#211B45',
    borderColor: '#372D6C',
    borderRadius: 32,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 30,
    width: '100%',
    maxWidth: 360,
  },
  resultNumber: {
    color: '#A99CFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 20,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginTop: 6,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#7C5CFC',
    borderRadius: 18,
    elevation: 5,
    maxWidth: 360,
    paddingHorizontal: 28,
    paddingVertical: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    width: '100%',
  },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
