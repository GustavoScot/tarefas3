import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, InfoRow, SectionTitle } from '../components';
import { busLines, formatMoney, formatNumber } from '../data';
import { colors } from '../theme';
import { RootStackParamList } from '../types';

export function DetailsScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Details'>) {
  const line = busLines.find(item => item.id === route.params.lineId) ?? busLines[0];
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.routeHero, { backgroundColor: line.color }]}>
        <Text style={styles.heroLabel}>LINHA {line.code}</Text>
        <Text style={styles.heroTitle}>{line.origin}</Text>
        <View style={styles.heroRoute}><View style={styles.heroDot} /><View style={styles.heroLine} /><Text style={styles.heroArrow}>›</Text></View>
        <Text style={styles.heroTitle}>{line.destination}</Text>
        <View style={styles.status}><Text style={styles.statusText}>● EM OPERAÇÃO</Text></View>
      </View>

      <SectionTitle title="Indicadores da linha" />
      <Card style={{ marginBottom: 22 }}>
        <InfoRow icon="♟" label="Passageiros hoje" value={formatNumber(line.passengers)} />
        <InfoRow icon="▣" label="Ônibus em operação" value={String(line.buses)} />
        <InfoRow icon="◷" label="Tempo médio" value={`${line.averageTime} min`} />
        <InfoRow icon="!" label="Atraso atual" value={`${line.delay} min`} />
        <InfoRow icon="◒" label="Ocupação média" value={`${line.occupancy}%`} />
        <InfoRow icon="$" label="Arrecadação" value={formatMoney(line.revenue)} />
      </Card>

      <SectionTitle title="Ocupação" />
      <Card style={{ marginBottom: 22 }}>
        <View style={styles.occupancyHeader}><Text style={styles.occupancyValue}>{line.occupancy}%</Text><Text style={styles.occupancyStatus}>{line.occupancy >= 85 ? 'Alta ocupação' : 'Ocupação regular'}</Text></View>
        <View style={styles.track}><View style={[styles.fill, { width: `${line.occupancy}%`, backgroundColor: line.occupancy >= 85 ? colors.red : colors.green }]} /></View>
        <View style={styles.scale}><Text style={styles.scaleText}>Vazio</Text><Text style={styles.scaleText}>Lotado</Text></View>
      </Card>

      <SectionTitle title="Itinerário principal" />
      <Card>
        {line.stops.map((stop, index) => (
          <View key={stop} style={styles.stopRow}>
            <View style={styles.stopTrack}>
              <View style={[styles.stopDot, { borderColor: line.color, backgroundColor: index === 0 || index === line.stops.length - 1 ? line.color : colors.white }]} />
              {index < line.stops.length - 1 ? <View style={styles.stopLine} /> : null}
            </View>
            <View style={styles.stopText}><Text style={styles.stopName}>{stop}</Text><Text style={styles.stopCaption}>{index === 0 ? 'Ponto inicial' : index === line.stops.length - 1 ? 'Destino final' : `Parada ${index + 1}`}</Text></View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { paddingHorizontal: 20, paddingTop: 42, paddingBottom: 50 },
  routeHero: { borderRadius: 24, padding: 22, marginBottom: 20 }, heroLabel: { color: '#FFFFFFBB', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: colors.white, fontSize: 19, fontWeight: '900', marginTop: 12 }, heroRoute: { flexDirection: 'row', alignItems: 'center', width: 90, marginVertical: 7 },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white }, heroLine: { flex: 1, height: 2, backgroundColor: '#FFFFFF88', marginLeft: 4 }, heroArrow: { color: colors.white, fontSize: 23, marginTop: -2 },
  status: { alignSelf: 'flex-start', backgroundColor: '#FFFFFF25', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6, marginTop: 16 }, statusText: { color: colors.white, fontWeight: '800', fontSize: 9 },
  occupancyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, occupancyValue: { color: colors.ink, fontSize: 27, fontWeight: '900' }, occupancyStatus: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  track: { height: 11, backgroundColor: colors.border, borderRadius: 7, marginTop: 14, overflow: 'hidden' }, fill: { height: '100%', borderRadius: 7 }, scale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }, scaleText: { color: colors.muted, fontSize: 9 },
  stopRow: { flexDirection: 'row', minHeight: 68 }, stopTrack: { width: 26, alignItems: 'center' }, stopDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 3 }, stopLine: { width: 2, flex: 1, backgroundColor: colors.border },
  stopText: { flex: 1, paddingLeft: 8 }, stopName: { color: colors.ink, fontWeight: '800', fontSize: 14 }, stopCaption: { color: colors.muted, fontSize: 11, marginTop: 4 },
});
