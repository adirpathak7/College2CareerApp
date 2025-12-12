import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoaderProvider } from './src/components/LoaderContext';
import Loader from './src/components/Loader';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
      setLoading(false);
    };

    checkToken();
  }, []);

  useEffect(() => {
    const axiosInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('userToken');
          setIsLoggedIn(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(axiosInterceptor);
    };
  }, []);

  if (loading) return null;

  return (
    <LoaderProvider>
      <Loader />
      <NavigationContainer>
        <AppNavigator isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      </NavigationContainer>
    </LoaderProvider>
  );
}
