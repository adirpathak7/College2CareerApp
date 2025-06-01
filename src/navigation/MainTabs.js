import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import Home from '../screens/Home';
import Applications from '../screens/Applications';
import Companies from '../screens/Companies';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = ({ setIsLoggedIn }) => {
    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('userToken');
                        setIsLoggedIn(false); // ✅ This will trigger App.js to switch screen
                    },
                },
            ],
            { cancelable: true }
        );
    };


    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = 'home-outline';
                    else if (route.name === 'Applications') iconName = 'document-text-outline';
                    else if (route.name === 'Companies') iconName = 'business-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Applications" component={Applications} />
            <Tab.Screen name="Companies" component={Companies} />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                    headerRight: () => (
                        <Ionicons
                            name="log-out-outline"
                            size={24}
                            color="black"
                            style={{ marginRight: 15 }}
                            onPress={handleLogout}
                        />
                    ),
                }}
            />

        </Tab.Navigator>

    );
};

export default MainTabs;
