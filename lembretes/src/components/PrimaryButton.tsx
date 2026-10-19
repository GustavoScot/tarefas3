import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

export function PrimaryButton({ title, onPress, loading = false }: {
  title: string; onPress: () => void; loading?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" disabled={loading} onPress={onPress}
      style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]}>
      {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: colors.primary, padding: spacing.medium, minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
  text: { color: colors.surface, fontSize: 16, fontWeight: '700' },
});
