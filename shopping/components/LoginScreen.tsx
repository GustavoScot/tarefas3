import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { UserContext } from '../UserContext';

export default function LoginScreen() {
  const { setUserName } = useContext(UserContext);
  const [inputValue, setInputValue] = useState('');

  return (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>Bem-vindo à Lista!</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu nome para entrar"
        value={inputValue}
        onChangeText={setInputValue}
      />
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => { if(inputValue.trim()) setUserName(inputValue) }}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', width: '100%', marginBottom: 15 },
  button: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});