// src/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainTabs from './MainTabs';
import Login from '../screens/Login';
import Register from '../screens/Register';
import ATSChecker from '../screens/ATSChecker';

const Stack = createNativeStackNavigator();

const AppNavigator = ({ isLoggedIn, setIsLoggedIn }) => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
                <>
                    <Stack.Screen name="Login">
                        {() => <Login setIsLoggedIn={setIsLoggedIn} />}
                    </Stack.Screen>

                    <Stack.Screen name="Register" component={Register} />
                </>
            ) : (
                <>
                    <Stack.Screen name="MainTabs">
                        {() => <MainTabs setIsLoggedIn={setIsLoggedIn} />}
                    </Stack.Screen>
                    <Stack.Screen name="ATSChecker" component={ATSChecker} />
                </>
            )}
        </Stack.Navigator>
    );
};
export default AppNavigator;