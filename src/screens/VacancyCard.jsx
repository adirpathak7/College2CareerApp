import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useLoader } from '../components/LoaderContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';


const VacancyCard = ({ vacancyId, title, description, eligibility_criteria, annualPackage, locationType, type, industry, companyName }) => {
    const { setLoading } = useLoader()

    const handleNewApplication = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');

            const response = await axios.post(`${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/applications/newApplications`, { vacancyId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.data.status) {
                // console.log(response.data);
                Alert.alert('Success', 'Applied successfully!');
            } else {
                Alert.alert('Error', response.data.message || 'Failed to apply');
                // console.log(response.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong.');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (<Card style={styles.card}>
        <Card.Content>
            <Title>{title}</Title>
            <Paragraph>{description}</Paragraph>
            <View style={styles.details}>
                <Text style={styles.detailText}>Eligibility: {eligibility_criteria}</Text>
                <Text style={styles.detailText}>Anual Package: {annualPackage}</Text>
                <Text style={styles.detailText}>Industry: {industry}</Text>
                <Text style={styles.detailText}>Location: {locationType}</Text>
                <Text style={styles.detailText}>Type: {type}</Text>
                <Text style={styles.detailText}>Company: {companyName}</Text>
            </View>
        </Card.Content>
        <Card.Actions>
            <Button
                onPress={handleNewApplication}
                labelStyle={{ color: '#4facfe' }}
                style={{
                    borderColor: '#4facfe',
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                }}
                mode="outlined"
            >
                Apply Now
            </Button>
        </Card.Actions>

    </Card>
    );
}
const styles = StyleSheet.create({
    card: {
        marginBottom: 15,
        borderRadius: 10,
        elevation: 5,
    },
    details: {
        marginTop: 10,
    },
    detailText: {
        fontSize: 12,
        color: '#555',
    },
});

export default VacancyCard;
