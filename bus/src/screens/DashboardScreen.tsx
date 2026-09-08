import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, LineCard, MetricCard, SectionTitle } from '../components';
import { averageDelay, busLines, formatNumber, totalBuses, totalPassengers } from '../data';
import { colors } from '../theme';
import { RootStackParamList } from '../types';

export function DashboardScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList> }) {
  const criticalLine = [...busLines].sort((a, b) => b.delay - a.delay)[0];
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TERÇA-FEIRA, 08 DE SETEMBRO</Text>
          <Text style={styles.title}>Seja bem-vindo!</Text>
          <Text style={styles.subtitle}>Como está o transporte hoje?</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTag}>● OPERAÇÃO EM ANDAMENTO</Text>
          <Text style={styles.heroTitle}>Fluxo dentro do esperado</Text>
          <Text style={styles.heroText}>82% das linhas operando sem alertas críticos.</Text>
        </View>
        <Text style={styles.heroBus}>▰</Text>
      </View>

      <SectionTitle title="Visão geral" />
      <View style={styles.metrics}>
        <View style={styles.metricRow}>
          <MetricCard icon="♟" label="PASSAGEIROS HOJE" value={formatNumber(totalPassengers)} />
          <MetricCard icon="▣" label="ÔNIBUS EM OPERAÇÃO" value={String(totalBuses)} tone="green" />
        </View>
        <View style={styles.metricRow}>
          <MetricCard icon="◷" label="ATRASO MÉDIO" value={`${averageDelay} min`} tone="orange" />
          <MetricCard icon="⌁" label="LINHAS MONITORADAS" value={String(busLines.length)} tone="blue" />
        </View>
      </View>

      <SectionTitle title="Atenção necessária" />
      <LineCard line={criticalLine} onPress={() => navigation.navigate('Details', { lineId: criticalLine.id })} />

      <SectionTitle title="Resumo da operação" />
      <Card>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Pontualidade geral</Text><Text style={styles.summaryValue}>87%</Text></View>
        <View style={styles.progress}><View style={[styles.progressFill, { width: '87%' }]} /></View>
        <View style={styles.summaryFooter}><Text style={styles.small}>↑ 3% desde ontem</Text><Text style={styles.small}>Meta: 90%</Text></View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 42, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 5 },
  title: { color: colors.ink, fontSize: 27, fontWeight: '900' },
  subtitle: { color: colors.muted, marginTop: 3, fontSize: 14 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  hero: { backgroundColor: colors.primary, borderRadius: 24, padding: 20, flexDirection: 'row', overflow: 'hidden', marginBottom: 22 },
  heroTag: { color: '#BFCBFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  heroTitle: { color: colors.white, fontWeight: '900', fontSize: 19, marginTop: 12 },
  heroText: { color: '#DDE3FF', fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 230 },
  heroBus: { color: '#7087E9', fontSize: 60, transform: [{ rotate: '-12deg' }], alignSelf: 'center' },
  metrics: { gap: 11, marginBottom: 16 },
  metricRow: { flexDirection: 'row', gap: 11 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: colors.ink, fontWeight: '700' },
  summaryValue: { color: colors.green, fontWeight: '900', fontSize: 18 },
  progress: { height: 9, backgroundColor: colors.border, borderRadius: 6, marginTop: 15, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.green, borderRadius: 6 },
  summaryFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  small: { color: colors.muted, fontSize: 11, fontWeight: '600' },
});
