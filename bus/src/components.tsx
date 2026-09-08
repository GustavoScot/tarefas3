import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BusLine } from './data';
import { colors, shadows } from './theme';

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

export function MetricCard({ icon, label, value, tone = 'blue' }: {
  icon: string; label: string; value: string; tone?: 'blue' | 'green' | 'orange' | 'red';
}) {
  const palettes = {
    blue: [colors.primarySoft, colors.primary],
    green: [colors.greenSoft, colors.green],
    orange: [colors.orangeSoft, colors.orange],
    red: [colors.redSoft, colors.red],
  } as const;
  const [backgroundColor, color] = palettes[tone];
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor }]}><Text style={{ fontSize: 18 }}>{icon}</Text></View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function LineCard({ line, onPress }: { line: BusLine; onPress: () => void }) {
  const alert = line.delay >= 10;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.lineCard, pressed && styles.pressed]}>
      <View style={styles.lineTop}>
        <View style={[styles.codeBadge, { backgroundColor: `${line.color}18` }]}>
          <View style={[styles.codeDot, { backgroundColor: line.color }]} />
          <Text style={[styles.code, { color: line.color }]}>{line.code}</Text>
        </View>
        <View style={[styles.delayBadge, { backgroundColor: alert ? colors.redSoft : colors.greenSoft }]}>
          <Text style={{ color: alert ? colors.red : colors.green, fontSize: 12, fontWeight: '700' }}>
            {line.delay} min atraso
          </Text>
        </View>
      </View>
      <View style={styles.routeRow}>
        <View style={styles.routeTrack}><View style={[styles.routePoint, { borderColor: line.color }]} /><View style={styles.routeLine} /><View style={[styles.routePoint, { backgroundColor: line.color, borderColor: line.color }]} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.routeText}>{line.origin}</Text>
          <Text style={[styles.routeText, { marginTop: 15 }]}>{line.destination}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
      <View style={styles.lineStats}>
        <Text style={styles.lineStat}>♟  {line.passengers.toLocaleString('pt-BR')}</Text>
        <Text style={styles.lineStat}>▣  {line.buses} ônibus</Text>
        <Text style={styles.lineStat}>◷  {line.averageTime} min</Text>
      </View>
    </Pressable>
  );
}

export function InfoRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}><Text>{icon}</Text></View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 18, ...shadows.card },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13, marginTop: 6 },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  action: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  metricCard: { flex: 1, backgroundColor: colors.card, borderRadius: 18, padding: 15, minWidth: 0, minHeight: 130, ...shadows.card },
  metricIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  metricValue: { color: colors.ink, fontWeight: '800', fontSize: 23 },
  metricLabel: { color: colors.muted, fontWeight: '600', fontSize: 12, marginTop: 3 },
  lineCard: { backgroundColor: colors.card, borderRadius: 20, padding: 17, marginBottom: 14, ...shadows.card },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  lineTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 17 },
  codeBadge: { flexDirection: 'row', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, alignItems: 'center', gap: 7 },
  codeDot: { width: 7, height: 7, borderRadius: 4 },
  code: { fontWeight: '900', fontSize: 15 },
  delayBadge: { borderRadius: 9, paddingVertical: 6, paddingHorizontal: 9 },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  routeTrack: { width: 22, height: 57, alignItems: 'center', marginRight: 7 },
  routePoint: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, backgroundColor: colors.white },
  routeLine: { height: 29, width: 2, backgroundColor: colors.border },
  routeText: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  chevron: { fontSize: 30, color: '#AAB3C4', marginLeft: 5 },
  lineStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 13, marginTop: 13, gap: 16 },
  lineStat: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  infoLabel: { flex: 1, color: colors.muted, fontSize: 13, fontWeight: '600' },
  infoValue: { color: colors.ink, fontWeight: '800', fontSize: 14 },
});
