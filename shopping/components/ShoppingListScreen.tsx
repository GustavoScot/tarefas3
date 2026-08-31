import React, { useState, useContext, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Switch } from 'react-native';
import { UserContext } from '../UserContext';

type ShoppingItem = {
  id: string;
  name: string;
  bought: boolean;
};

export default function ShoppingListScreen() {
  const { userName, setUserName } = useContext(UserContext);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddItem = useCallback(() => {
    if (newItemName.trim() === '') return;
    setItems(prev => [...prev, { id: Date.now().toString(), name: newItemName, bought: false }]);
    setNewItemName('');
  }, [newItemName]);

  const toggleBought = useCallback((id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, bought: !item.bought } : item
    ));
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const pendingCount = useMemo(() => {
    return items.filter(item => !item.bought).length;
  }, [items]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {userName}!</Text>
        <TouchableOpacity onPress={() => setUserName(null)}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsText}>Itens Pendentes: {pendingCount}</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar itens..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 10 }]}
          placeholder="Novo item..."
          value={newItemName}
          onChangeText={setNewItemName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={[styles.itemText, item.bought && styles.itemBoughtText]}>
              {item.name}
            </Text>
            <Switch
              value={item.bought}
              onValueChange={() => toggleBought(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum item encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  logoutText: { color: '#e74c3c', fontWeight: 'bold' },
  statsCard: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, marginBottom: 20 },
  statsText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', width: '100%', marginBottom: 15 },
  searchInput: { backgroundColor: '#eef2f5', padding: 10, borderRadius: 8, marginBottom: 20 },
  inputGroup: { flexDirection: 'row', marginBottom: 20 },
  addButton: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center', width: 50 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  itemText: { fontSize: 16, color: '#333' },
  itemBoughtText: { textDecorationLine: 'line-through', color: '#aaa' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 }
});