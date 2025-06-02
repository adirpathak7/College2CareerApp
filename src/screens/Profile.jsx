import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileForm from './ProfileForm';
import { MaterialIcons } from '@expo/vector-icons';
import { useLoader } from '../components/LoaderContext';


const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const { setLoading } = useLoader();

    const fetchProfile = async () => {
        try {
            setLoading(true)

            const token = await AsyncStorage.getItem('userToken');
            const res = await axios.get(
                `${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/students/getStudentProfileByUsersId`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const student = res.data?.data?.[0];
            if (student) setProfile(student);
            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
            setLoading(false);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (!profile || editMode) {
        return (
            <ProfileForm
                existingProfile={profile}
                onSuccess={() => {
                    setEditMode(false);
                    fetchProfile();
                }}
                onCancel={() => setEditMode(false)}
            />
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🎓 Student Profile</Text>

            <View style={styles.card}>
                <ProfileField label="Student Name" value={profile.studentName} />
                <ProfileField label="Roll Number" value={profile.rollNumber} />
                <ProfileField label="Course" value={profile.course} />
                <ProfileField label="Graduation Year" value={profile.graduationYear} />
                <ProfileField label="Email" value={profile.email} />
                <ProfileField label="Resume" value={profile.resumeURL ? 'Uploaded' : 'Not Uploaded'} />
                <ProfileField label="Status" value={profile.status || 'Pending'} />
                {!!profile.statusReason?.trim() && <ProfileField label="Reason" value={profile.statusReason} />}
            </View>

            <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
                <MaterialIcons name="edit" size={20} color="#fff" />
                <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const ProfileField = ({ label, value }) => (
    <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#F4FBFF', flex: 1 },
    title: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 25,
        color: '#004E89',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    fieldRow: {
        marginBottom: 15,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 3,
    },
    fieldValue: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
    editBtn: {
        backgroundColor: '#007ACC',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    editText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Profile;
