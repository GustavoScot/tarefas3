import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, SectionTitle } from '../components';
import { busLines, formatMoney, totalRevenue } from '../data';
import { colors } from '../theme';

export function AnalyticsScreen() {
  const maxRevenue = Math.max(...busLines.map(line => line.revenue));
  const averageOccupancy = Math.round(busLines.reduce((sum, line) => sum + line.occupancy, 0) / busLines.length);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Análises</Text>
      <Text style={styles.subtitle}>Desempenho consolidado da operação</Text>

      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>ARRECADAÇÃO TOTAL</Text>
        <Text style={styles.revenueValue}>{formatMoney(totalRevenue)}</Text>
        <View style={styles.revenuePill}><Text style={styles.revenuePillText}>↑ 5,4% em relação a ontem</Text></View>
        <View style={styles.sparkline}>
          {[32, 47, 39, 62, 55, 78, 68, 88, 72, 96].map((height, index) => <View key={index} style={[styles.sparkBar, { height: `${height}%` }]} />)}
        </View>
      </View>

      <SectionTitle title="Arrecadação por linha" />
      <Card style={{ marginBottom: 22 }}>
        {busLines.map((line, index) => (
          <View key={line.id} style={styles.barRow}>
            <View style={styles.barLabels}><Text style={styles.barCode}>{line.code}</Text><Text style={styles.barValue}>{formatMoney(line.revenue)}</Text></View>
            <View style={styles.barTrack}><View style={[styles.barFill, { width: `${(line.revenue / maxRevenue) * 100}%`, backgroundColor: line.color }]} /></View>
          </View>
        ))}
      </Card>

      <SectionTitle title="Ocupação da frota" />
      <Card style={{ marginBottom: 22 }}>
        <View style={styles.occupancyTop}>
          <View style={styles.donut}><View style={styles.donutInner}><Text style={styles.donutValue}>{averageOccupancy}%</Text><Text style={styles.donutLabel}>média</Text></View></View>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <Text style={styles.occupancyTitle}>Boa utilização</Text>
            <Text style={styles.occupancyText}>A frota mantém ocupação saudável, com atenção para duas linhas acima de 85%.</Text>
          </View>
        </View>
        <View style={styles.legend}>
          <View><Text style={styles.legendValue}>2</Text><Text style={styles.legendLabel}>Lotadas</Text></View>
          <View><Text style={styles.legendValue}>3</Text><Text style={styles.legendLabel}>Moderadas</Text></View>
          <View><Text style={styles.legendValue}>1</Text><Text style={styles.legendLabel}>Tranquila</Text></View>
        </View>
      </Card>

      <SectionTitle title="Atraso por linha" />
      <Card>
        {busLines.slice().sort((a, b) => b.delay - a.delay).map(line => (
          <View key={line.id} style={styles.delayRow}>
            <View style={[styles.lineMarker, { backgroundColor: line.color }]} />
            <Text style={styles.delayCode}>{line.code}</Text>
            <Text style={styles.delayRoute} numberOfLines={1}>{line.destination}</Text>
            <Text style={[styles.delayValue, { color: line.delay >= 10 ? colors.red : colors.orange }]}>{line.delay} min</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { paddingHorizontal: 20, paddingTop: 42, paddingBottom: 120 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '900' }, subtitle: { color: colors.muted, marginTop: 5, marginBottom: 20 },
  revenueCard: { backgroundColor: colors.ink, borderRadius: 24, padding: 20, height: 210, marginBottom: 22, overflow: 'hidden' },
  revenueLabel: { color: '#93A0B8', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  revenueValue: { color: colors.white, fontSize: 30, fontWeight: '900', marginTop: 8 },
  revenuePill: { alignSelf: 'flex-start', marginTop: 9, backgroundColor: '#234338', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
  revenuePillText: { color: '#75E0B3', fontSize: 10, fontWeight: '700' },
  sparkline: { position: 'absolute', bottom: 0, left: 20, right: 20, height: 75, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  sparkBar: { flex: 1, backgroundColor: '#6179DB', borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  barRow: { marginBottom: 16 }, barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  barCode: { color: colors.ink, fontWeight: '800' }, barValue: { color: colors.muted, fontWeight: '700', fontSize: 12 },
  barTrack: { height: 8, borderRadius: 5, backgroundColor: colors.border, overflow: 'hidden' }, barFill: { height: '100%', borderRadius: 5 },
  occupancyTop: { flexDirection: 'row', alignItems: 'center' }, donut: { width: 110, height: 110, borderRadius: 55, borderWidth: 15, borderColor: colors.primary, borderRightColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  donutInner: { alignItems: 'center' }, donutValue: { color: colors.ink, fontWeight: '900', fontSize: 22 }, donutLabel: { color: colors.muted, fontSize: 10 },
  occupancyTitle: { color: colors.ink, fontWeight: '800', fontSize: 16 }, occupancyText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  legend: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, marginTop: 18 },
  legendValue: { textAlign: 'center', color: colors.ink, fontWeight: '900', fontSize: 17 }, legendLabel: { color: colors.muted, fontSize: 10, marginTop: 2 },
  delayRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }, lineMarker: { width: 7, height: 28, borderRadius: 4, marginRight: 10 },
  delayCode: { width: 52, color: colors.ink, fontWeight: '800' }, delayRoute: { flex: 1, color: colors.muted, fontSize: 12 }, delayValue: { fontWeight: '900', fontSize: 12 },
});
