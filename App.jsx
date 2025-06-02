import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoaderProvider } from './src/components/LoaderContext';
import Loader from './src/components/Loader';
import Login from './src/screens/Login';
import MainTabs from './src/navigation/MainTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkToken();
  }, []);

  return (
    <LoaderProvider>
      <Loader />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <Stack.Screen name="Login">
              {(props) => <Login {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="MainTabs">
              {(props) => <MainTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </LoaderProvider>
  );
}
