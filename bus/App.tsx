import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { LinesScreen } from './src/screens/LinesScreen';
import { colors } from './src/theme';
import { RootStackParamList, TabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const icons: Record<keyof TabParamList, string> = { Início: '⌂', Linhas: '▤', Análises: '▥' };

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: '#98A2B3',
      tabBarLabelStyle: styles.tabLabel,
      tabBarStyle: [styles.tabBar, { height: 69 + insets.bottom, paddingBottom: 8 + insets.bottom }],
      tabBarIcon: ({ focused, color }) => <View style={[styles.tabIcon, focused && styles.tabIconActive]}><Text style={[styles.tabIconText, { color }]}>{icons[route.name]}</Text></View>,
    })}>
      <Tab.Screen name="Início" component={DashboardScreen} />
      <Tab.Screen name="Linhas" component={LinesScreen} />
      <Tab.Screen name="Análises" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: colors.background }, headerShadowVisible: false, headerTintColor: colors.ink, headerTitleStyle: { fontWeight: '800' } }}>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Detalhes da linha', headerBackTitle: 'Voltar' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: { position: 'absolute', borderTopWidth: 0, backgroundColor: colors.white, paddingTop: 7, shadowColor: colors.ink, shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 15 },
  tabLabel: { fontSize: 10, fontWeight: '800' },
  tabIcon: { width: 34, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabIconActive: { backgroundColor: colors.primarySoft },
  tabIconText: { fontSize: 21, fontWeight: '900' },
});
