import React, { useState } from 'react';
import { View } from 'react-native';
import { UserContext } from './UserContext';
import LoginScreen from './components/LoginScreen';
import ShoppingListScreen from './components/ShoppingListScreen';

export default function App() {
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ userName, setUserName }}>
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {userName ? <ShoppingListScreen /> : <LoginScreen />}
      </View>
    </UserContext.Provider>
  );
}