import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import Register from '../screens/Register';
import Home from '../screens/Home';
import Applications from '../screens/Applications';
import Vacancies from '../screens/Vacancies';
import Profile from '../screens/Profile';
import Offers from '../screens/Offers';

const Tab = createBottomTabNavigator();

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
                        await AsyncStorage.removeItem('autoLogin');
                        setIsLoggedIn(false);
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

                    switch (route.name) {
                        case 'Home':
                            iconName = 'home-outline';
                            break;
                        case 'Applications':
                            iconName = 'document-text-outline';
                            break;
                        case 'Vacancies':
                            iconName = 'briefcase-outline';
                            break;
                        case 'Offers':
                            iconName = 'gift-outline';
                            break;
                        case 'Profile':
                            iconName = 'person-outline';
                            break;
                        default:
                            iconName = 'ellipse-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Applications" component={Applications} />
            <Tab.Screen name="Vacancies" component={Vacancies} />
            <Tab.Screen name="Offers" component={Offers} />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
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
