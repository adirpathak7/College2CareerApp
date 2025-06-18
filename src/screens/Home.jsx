import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Title, Paragraph, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const Home = ({ navigation }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardStats = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            const response = await axios.get(`${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/students/getStudentDashboardStats`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.data) {
                setStats(response.data.data);
            }
            console.log("my data " + response.data);

        } catch (error) {
            console.log('Dashboard Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const StatCard = ({ title, value }) => (
        <Card style={styles.statCard}>
            <Card.Content>
                <Title>{value}</Title>
                <Paragraph>{title}</Paragraph>
            </Card.Content>
        </Card>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.welcome}>👋 Welcome, Student!</Text>
            <Text style={styles.tagline}>Your career journey starts here.</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#2e86de" style={{ marginTop: 30 }} />
            ) : (
                <>
                    <View style={styles.grid}>
                        <StatCard title="Total Companies" value={stats?.totalCompanies || 0} />
                        <StatCard title="Total Offers" value={stats?.totalOffers || 0} />
                        <StatCard title="Interviews Scheduled" value={stats?.interviewsScheduled || 0} />
                        <StatCard title="Total Applications" value={stats?.totalApplications || 0} />
                        <StatCard title="Applied" value={stats?.totalApplications || 0} />
                        <StatCard title="Shortlisted" value={stats?.shortlistedApplications || 0} />
                        <StatCard title="Interview Scheduled" value={stats?.interviewScheduledApplications || 0} />
                        <StatCard title="Offered" value={stats?.offeredApplications || 0} />
                    </View>

                    <View style={styles.cardContainer}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Title>My Applications</Title>
                                <Paragraph>Track your submitted applications.</Paragraph>
                            </Card.Content>
                            <Card.Actions>
                                <Button onPress={() => navigation.navigate('Applications')}>View</Button>
                            </Card.Actions>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title>My Offers</Title>
                                <Paragraph>Check your received offers.</Paragraph>
                            </Card.Content>
                            <Card.Actions>
                                <Button onPress={() => navigation.navigate('Offers')}>View</Button>
                            </Card.Actions>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Title>Explore Companies</Title>
                                <Paragraph>Discover hiring companies.</Paragraph>
                            </Card.Content>
                            <Card.Actions>
                                <Button onPress={() => navigation.navigate('Companies')}>Browse</Button>
                            </Card.Actions>
                        </Card>
                    </View>
                </>
            )}

            <Text style={styles.footerNote}>Stay updated and don’t miss any opportunity!</Text>
        </ScrollView>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f0f4f8',
        flexGrow: 1,
    },
    welcome: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2e86de',
        marginBottom: 5,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        marginBottom: 12,
        borderRadius: 10,
        elevation: 3,
    },
    cardContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        marginBottom: 15,
    },
    footerNote: {
        marginTop: 30,
        textAlign: 'center',
        fontSize: 14,
        color: '#888',
    },
});
