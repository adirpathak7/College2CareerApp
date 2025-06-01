// screens/Home.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Home = () => {
    return (
        <View style={styles.container}>
            {/* <Image
                source={require('../assets/welcome.png')} // optional, or replace with your logo
                style={styles.image}
            /> */}
            <Text style={styles.heading}>Welcome to Student Dashboard</Text>
            <Text style={styles.subheading}>Explore your profile, applications, and companies.</Text>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f2f6ff',
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 10,
    },
    subheading: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
});
