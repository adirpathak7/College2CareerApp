import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import message from '../message.json';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useLoader } from '../components/LoaderContext';

const Login = ({ setIsLoggedIn }) => {
    const { setLoading } = useLoader();

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const [inputData, setInputData] = useState({ email: '', password: '' });
    const [inputError, setInputError] = useState({ email: '', password: '' });
    const [apiResponse, setApiResponse] = useState({ message: '', type: '' });

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
            passwordRef.current.focus();
        }
        if (!inputData.email) {
            errors.email = message.empty + ' email';
            emailRef.current.focus();
        }

        if (Object.keys(errors).length > 0) {
            setInputError(errors);
            return;
        }

        try {
            setLoading(true)
            const formData = new FormData();

            formData.append('email', inputData.email);
            formData.append('password', inputData.password);

            const response = await axios.post(`${Constants.expoConfig.extra.BASE_URL}/api/college2career/login`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // console.log(response.data)
            if (response.data.status === false) {
                setApiResponse({ message: response.data.message, type: 'error' });
                setInputData((prev) => ({ ...prev, password: '' }));
                setLoading(false);
            } else {
                const token = response.data.data
                await AsyncStorage.setItem("userToken", token)
                setInputData({ email: '', password: '' });
                setIsLoggedIn(true)
                setLoading(false);
            }
        } catch (error) {
            console.log("error is: " + error.message)
            setApiResponse({ message: 'Something went wrong.', type: 'error' });
            setInputData({ email: '', password: '' });
            setLoading(false);
        } finally {
            setLoading(false)
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Login</Text>

            {apiResponse.message ? (
                <Text style={[styles.responseMessage, apiResponse.type === 'success' ? styles.success : styles.error]}>
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
            />
            {inputError.email && <Text style={styles.errorText}>{inputError.email}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={inputData.password}
                ref={passwordRef}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry
            />
            {inputError.password && <Text style={styles.errorText}>{inputError.password}</Text>}

            <Button title="Login" onPress={handleLogin} />
        </View>
    );
}
export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    heading: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
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