import React, { useState } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useLoader } from '../components/LoaderContext';


const ProfileForm = ({ existingProfile, onSuccess, onCancel }) => {
    const { setLoading } = useLoader();

    const isEdit = !!existingProfile;

    const [inputData, setInputData] = useState({
        studentName: existingProfile?.studentName || '',
        email: existingProfile?.email || '',
        rollNumber: existingProfile?.rollNumber || '',
        course: existingProfile?.course || '',
        graduationYear: existingProfile?.graduationYear || '',
        resume: null,
        resumeURL: existingProfile?.resumeURL || '',
    });

    const courses = ['B.Tech', 'BCA', 'B.Sc IT', 'MCA', 'M.Tech'];
    const [resumeName, setResumeName] = useState(existingProfile?.resumeURL ? 'Resume already uploaded' : '');

    const pickResume = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
        if (!result.canceled) {
            const file = result.assets[0];
            if (file.size > 1.5 * 1024 * 1024) {
                Alert.alert('File too large', 'Please upload PDF under 1.5MB');
                return;
            }
            setInputData({ ...inputData, resume: file });
            setResumeName(file.name);
        }
    };

    const handleSubmit = async () => {
        if (!inputData.studentName || (!isEdit && (!inputData.rollNumber || !inputData.course || !inputData.graduationYear))) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const formData = new FormData();
        formData.append('studentName', inputData.studentName);
        formData.append('email', inputData.email);
        if (!isEdit) {
            formData.append('rollNumber', inputData.rollNumber);
            formData.append('course', inputData.course);
            formData.append('graduationYear', inputData.graduationYear);
        }

        if (inputData.resume) {
            formData.append('resume', {
                uri: inputData.resume.uri,
                name: inputData.resume.name,
                type: 'application/pdf',
            });
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');

            const response = isEdit
                ? await axios.put(`${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/students/updateStudentProfileByStudentId`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                })
                : await axios.post(`${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/students/createStudentProfile`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

            setLoading(false);
            if (response.data.status) {
                Alert.alert('Success', response.data.message);
                onSuccess();
            } else {
                Alert.alert('Error', response.data.message);
            }
        } catch (err) {
            console.error('Submit error:', err);
            Alert.alert('Error', 'Something went wrong');
            setLoading(false);
        } finally {
            setLoading(false)
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{isEdit ? 'Edit Profile' : 'Create Profile'}</Text>

            <TextInput
                placeholder="Student Name"
                value={inputData.studentName}
                onChangeText={(text) => setInputData({ ...inputData, studentName: text })}
                style={styles.input}
            />
            {isEdit && (
                <TextInput
                    placeholder="Email"
                    value={inputData.email}
                    onChangeText={(text) => setInputData({ ...inputData, email: text })}
                    style={styles.input}
                />
            )}
            {!isEdit && (
                <>
                    <TextInput
                        placeholder="Roll Number"
                        value={inputData.rollNumber}
                        keyboardType="numeric"
                        onChangeText={(text) => setInputData({ ...inputData, rollNumber: text })}
                        style={styles.input}
                    />
                    <Text style={styles.pickerLabel}>Select Course</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={inputData.course}
                            onValueChange={(value) => setInputData({ ...inputData, course: value })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Course" value="" />
                            {courses.map((course) => (
                                <Picker.Item key={course} label={course} value={course} />
                            ))}
                        </Picker>
                    </View>
                    <TextInput
                        placeholder="Passing Year- Ex. 2025"
                        keyboardType="numeric"
                        value={inputData.graduationYear}
                        onChangeText={(text) => setInputData({ ...inputData, graduationYear: text })}
                        style={styles.input}
                    />
                </>
            )}

            <TouchableOpacity onPress={pickResume} style={styles.uploadButton}>
                <Text style={styles.uploadText}>
                    {resumeName ||
                        (isEdit && inputData.resumeURL ? 'Previous resume used ✅' : 'Upload Resume (PDF, max 1.5MB)')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Update Profile</Text>
            </TouchableOpacity>
            <View style={{ width: 10 }} />
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flex: 1 },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#007ACC' },
    input: {
        borderWidth: 1,
        borderColor: '#B0C4DE',
        padding: Platform.OS === 'ios' ? 15 : 10,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    uploadButton: {
        borderWidth: 1,
        borderColor: '#ADD8E6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        backgroundColor: '#DFF6FF',
    },
    uploadText: { textAlign: 'center', color: '#007ACC' },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#B0C4DE',
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    picker: {
        height: 50,
        color: '#333',
    },
    pickerLabel: {
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
        marginTop: 10,
    },
    primaryButton: {
        backgroundColor: '#007ACC',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    cancelButton: {
        backgroundColor: '#888',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },

});

export default ProfileForm;
