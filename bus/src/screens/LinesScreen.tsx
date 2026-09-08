import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { LineCard } from '../components';
import { busLines } from '../data';
import { colors } from '../theme';
import { RootStackParamList } from '../types';

export function LinesScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList> }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => busLines.filter(line =>
    `${line.code} ${line.origin} ${line.destination}`.toLowerCase().includes(search.toLowerCase())
  ), [search]);
  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <LineCard line={item} onPress={() => navigation.navigate('Details', { lineId: item.id })} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<>
          <Text style={styles.title}>Linhas</Text>
          <Text style={styles.subtitle}>Acompanhe as linhas em operação</Text>
          <View style={styles.search}><Text style={styles.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="Buscar linha ou destino" placeholderTextColor="#98A2B3" style={styles.input} /></View>
          <View style={styles.countRow}><Text style={styles.count}>{filtered.length} linhas encontradas</Text><View style={styles.live}><Text style={styles.liveText}>● AO VIVO</Text></View></View>
        </>}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma linha encontrada.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 42, paddingBottom: 120 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '900' },
  subtitle: { color: colors.muted, marginTop: 5, marginBottom: 20 },
  search: { height: 52, backgroundColor: colors.card, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border },
  searchIcon: { fontSize: 24, color: colors.muted, marginRight: 10 },
  input: { flex: 1, color: colors.ink, fontSize: 14 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 18 },
  count: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  live: { backgroundColor: colors.greenSoft, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  liveText: { color: colors.green, fontWeight: '800', fontSize: 9, letterSpacing: 0.5 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
});
