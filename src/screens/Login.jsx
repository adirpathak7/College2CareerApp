import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, KeyboardAvoidingView,
    Platform, Animated
} from 'react-native';
import axios from 'axios';
import message from '../message.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useLoader } from '../components/LoaderContext';
import { LinearGradient } from 'expo-linear-gradient';

const Login = ({ setIsLoggedIn }) => {
    const { setLoading } = useLoader();
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const [inputData, setInputData] = useState({ email: '', password: '' });
    const [inputError, setInputError] = useState({ email: '', password: '' });
    const [apiResponse, setApiResponse] = useState({ message: '', type: '' });

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleInputChange = (name, value) => {
        setInputData((prev) => ({ ...prev, [name]: value }));
        setInputError((prev) => ({ ...prev, [name]: '' }));
        setApiResponse({ message: '', type: '' });
    };

    useEffect(() => {
        if (apiResponse.message) {
            const timer = setTimeout(() => {
                setApiResponse({ message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [apiResponse]);

    const handleLogin = async () => {
        const errors = {};

        if (!inputData.password) {
            errors.password = message.empty + ' password';
            passwordRef.current?.focus(), 100;
        }
        if (!inputData.email) {
            errors.email = message.empty + ' email';
            emailRef.current?.focus(), 100;
        }
        if (Object.keys(errors).length > 0) {
            setInputError(errors);
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('email', inputData.email);
            formData.append('password', inputData.password);

            const response = await axios.post(`${Constants.expoConfig.extra.BASE_URL}/api/college2career/login`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 3000,
            });

            if (response.data.status === false) {
                setApiResponse({ message: response.data.message, type: 'error' });
                setInputData((prev) => ({ ...prev, password: '' }));
            } else {
                const token = response.data.data;
                await AsyncStorage.setItem("userToken", token);
                setInputData({ email: '', password: '' });
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.log("error is: " + error.message);
            if (error.code === 'ECONNREFUSED') {
                setApiResponse({ message: 'Server is taking too long to respond.', type: 'error' });
            } else {
                setApiResponse({ message: 'Something went wrong.', type: 'error' });
            }
            setInputData({ email: '', password: '' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#4facfe', '#00f2fe']}
            style={styles.gradient}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "android" ? 80 : 0}
            >

                <ScrollView contentContainerStyle={styles.container}>
                    {/* next time aisa kuch hua to <View style={{ width: '100%' }}> ye bhi add kr dena */}
                    <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                        <Text style={styles.heading}>Welcome Back 👋</Text>

                        {apiResponse.message ? (
                            <Text style={[
                                styles.responseMessage,
                                apiResponse.type === 'success' ? styles.success : styles.error
                            ]}>
                                {apiResponse.type === 'success' ? 'Success: ' : 'Error: '}
                                {apiResponse.message}
                            </Text>
                        ) : null}

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={inputData.email}
                            ref={emailRef}
                            onChangeText={(text) => handleInputChange('email', text)}
                            autoCapitalize="none"
                            placeholderTextColor="#888"
                        />
                        {inputError.email && <Text style={styles.errorText}>{inputError.email}</Text>}

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={inputData.password}
                            ref={passwordRef}
                            onChangeText={(text) => handleInputChange('password', text)}
                            secureTextEntry
                            placeholderTextColor="#888"
                        />
                        {inputError.password && <Text style={styles.errorText}>{inputError.password}</Text>}

                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

export default Login;

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    heading: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#ffffffcc',
        padding: 14,
        marginBottom: 15,
        borderRadius: 12,
        width: '100%',
        fontSize: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    errorText: {
        color: '#fff',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
        width: '100%',
        marginTop: 10,
    },
    buttonText: {
        color: '#00b4db',
        fontSize: 18,
        fontWeight: 'bold',
    },
    responseMessage: {
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
        textAlign: 'center',
    },
    success: {
        backgroundColor: '#d4edda',
        color: '#155724',
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
    },
});
