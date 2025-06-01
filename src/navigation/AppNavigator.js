// src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from '../screens/Login';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
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

    if (loading) return null;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
                <Stack.Screen name="Login">
                    {() => <Login setIsLoggedIn={setIsLoggedIn} />}
                </Stack.Screen>
            ) : (
                <Stack.Screen name="MainTabs" component={MainTabs} />
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
