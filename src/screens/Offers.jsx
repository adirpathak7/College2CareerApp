import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    Linking,
    TextInput,
    Modal,
    Pressable,
    TouchableOpacity
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoader } from '../components/LoaderContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


const Offers = () => {
    const [offers, setOffers] = useState([]);
    const { setLoading } = useLoader();
    const [apiResponse, setApiResponse] = useState({ message: '', type: '' });

    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectOfferId, setRejectOfferId] = useState(null);

    const [rejectApplicationId, setRejectApplicationId] = useState(null);

    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Offers',
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                    <TouchableOpacity onPress={fetchOffers}>
                        <Ionicons name="refresh-outline" size={24} color="black" />
                    </TouchableOpacity>

                </View>
            ),
        });
    }, [navigation]);

    const fetchOffers = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(
                `${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/offers/getAllOffersByStudentId`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setOffers(response.data.data || []);
        } catch (error) {
            console.error(error);
            setApiResponse({ message: `Failed to fetch offers. ${error}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleAccept = async (offerId, applicationId) => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');

            const offerAcceptURL = `${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/offers/updateOfferStatusAccepted/${offerId}`;
            const appAcceptURL = `${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/applications/updateStatusToOfferAcceptedStudentId/${applicationId}`;

            // console.log('✅ Accept Offer URL:', offerAcceptURL);
            // console.log('✅ Accept Application URL:', appAcceptURL);

            await axios.put(offerAcceptURL, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            await axios.put(appAcceptURL, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setApiResponse({ message: 'Offer accepted successfully.', type: 'success' });
            fetchOffers();
        } catch (error) {
            console.error('❌ Accept Error:', error);
            setApiResponse({ message: 'Failed to accept offer.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };


    const openRejectDialog = (offerId, applicationId) => {
        setRejectOfferId(offerId);
        setRejectApplicationId(applicationId);
        setRejectReason('');
        setShowRejectDialog(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            Alert.alert('Reason Required', 'Please enter a reason for rejection.');
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const formData = new FormData();
            formData.append('reason', rejectReason);

            const offerRejectURL = `${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/offers/updateOfferStatusRejected/${rejectOfferId}`;
            const appRejectURL = `${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/applications/updateStatusToOfferRejectedStudentId/${rejectApplicationId}`;

            // console.log('❌ Reject Offer URL:', offerRejectURL);
            // console.log('❌ Reject Application URL:', appRejectURL);

            await axios.put(offerRejectURL, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            await axios.put(appRejectURL, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setApiResponse({ message: 'Offer rejected successfully.', type: 'success' });
            setShowRejectDialog(false);
            fetchOffers();
        } catch (error) {
            console.error('❌ Reject Error:', error);
            setApiResponse({ message: 'Failed to reject offer.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };


    return (
        <ScrollView style={styles.container}>
            {apiResponse.message ? (
                <Text
                    style={[
                        styles.responseMessage,
                        apiResponse.type === 'success' ? styles.success : styles.error,
                    ]}
                >
                    {apiResponse.message}
                </Text>
            ) : null}

            {offers.length === 0 ? (
                <Text style={styles.emptyText}>No offers available</Text>
            ) : (
                offers.map((offer, index) => (
                    <Card key={index} style={styles.card}>
                        <Card.Title title={offer.companyName} subtitle={offer.position} />

                        <Card.Content>
                            <Text style={styles.label}>Annual Package:</Text>
                            <Text>{offer.annualPackage}</Text>

                            <Text style={styles.label}>Joining Date:</Text>
                            <Text>{offer.joiningDate}</Text>

                            <Text style={styles.label}>Timing:</Text>
                            <Text>{offer.timing}</Text>

                            <Text style={styles.label}>Description:</Text>
                            <Text>{offer.description}</Text>

                            {offer.offerLetterURL && (
                                <Text
                                    style={styles.link}
                                    onPress={() => Linking.openURL(offer.offerLetterURL)}
                                >
                                    📄 View Offer Letter
                                </Text>
                            )}

                            <Text style={styles.status}>
                                Status: {offer.status || 'Not Updated'}
                            </Text>
                        </Card.Content>

                        <Card.Actions style={styles.actions}>
                            <Button
                                mode="contained"
                                onPress={() => handleAccept(offer.offerId, offer.applicationId)}
                                style={styles.acceptBtn}
                            >
                                I Accept
                            </Button>

                            <Button
                                mode="outlined"
                                onPress={() => openRejectDialog(offer.offerId, offer.applicationId)}
                                style={styles.rejectBtn}
                            >
                                I Reject
                            </Button>

                        </Card.Actions>
                    </Card>
                ))
            )}

            {/* Reject Dialog */}
            <Modal
                visible={showRejectDialog}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRejectDialog(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.dialogBox}>
                        <Text style={styles.dialogTitle}>Reason for Rejection</Text>
                        <TextInput
                            placeholder="Enter reason..."
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            style={styles.textInput}
                            multiline
                        />
                        <View style={styles.dialogActions}>
                            <Pressable onPress={() => setShowRejectDialog(false)} style={styles.dialogCancel}>
                                <Text style={{ color: 'white' }}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={handleRejectSubmit} style={styles.dialogSubmit}>
                                <Text style={{ color: 'white' }}>Submit</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f5f6fa',
    },
    card: {
        marginBottom: 20,
        elevation: 4,
        borderRadius: 12,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 8,
    },
    status: {
        marginTop: 8,
        fontStyle: 'italic',
        color: '#555',
    },
    link: {
        marginTop: 6,
        color: '#1e90ff',
        textDecorationLine: 'underline',
    },
    actions: {
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    acceptBtn: {
        backgroundColor: '#4CAF50',
    },
    rejectBtn: {
        borderColor: '#f44336',
    },
    emptyText: {
        marginTop: 50,
        textAlign: 'center',
        fontSize: 18,
        color: '#777',
    },
    responseMessage: {
        marginVertical: 10,
        padding: 10,
        borderRadius: 5,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    success: {
        backgroundColor: '#d4edda',
        color: '#155724',
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogBox: {
        backgroundColor: 'white',
        width: '85%',
        borderRadius: 10,
        padding: 20,
    },
    dialogTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        minHeight: 80,
        textAlignVertical: 'top',
        borderRadius: 6,
    },
    dialogActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
    },
    dialogCancel: {
        backgroundColor: '#888',
        padding: 10,
        borderRadius: 6,
        marginRight: 10,
    },
    dialogSubmit: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 6,
    },
});
export default Offers;