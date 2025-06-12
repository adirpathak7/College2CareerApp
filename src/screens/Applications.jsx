// screens/Applications.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoader } from '../components/LoaderContext';

const statusColors = {
  applied: '#007bff',
  interviewScheduled: '#ffc107',
  rejected: '#dc3545'
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const { setLoading } = useLoader();
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchApplications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(`${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/applications/getAllAppliedApplicationsByStudentId`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res?.data?.status) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true
    }).start();
  }, []);

  const renderApplication = ({ item }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Image source={{ uri: item.companyPicture }} style={styles.logo} />
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.company}>{item.companyName}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>📍 {item.city}, {item.state}</Text>
        <Text style={[styles.status, { backgroundColor: statusColors[item.status] }]}>{item.status}</Text>
      </View>

      <Text style={styles.meta}><Text style={styles.bold}>Type:</Text> {item.type.toUpperCase()} | <Text style={styles.bold}>Location:</Text> {item.locationType}</Text>
      <Text style={styles.meta}><Text style={styles.bold}>Package:</Text> {item.annualPackage}</Text>
      <Text style={styles.meta}><Text style={styles.bold}>Eligibility:</Text> {item.eligibility_criteria}</Text>

      <Text style={styles.date}><Ionicons name="calendar" size={14} /> Applied on: {new Date(item.appliedDate).toDateString()}</Text>

      {item.status === 'rejected' && (
        <Text style={styles.reason}>Reason: {item.reason}</Text>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.headerText}>📄 My Applications</Text> */}
      <FlatList
        data={applications}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderApplication}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default Applications;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f2f2f2'
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 10
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  company: {
    fontSize: 14,
    color: '#666'
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  status: {
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    textTransform: 'capitalize'
  },
  label: {
    fontSize: 13,
    color: '#555'
  },
  meta: {
    fontSize: 13,
    color: '#444',
    marginBottom: 3
  },
  bold: {
    fontWeight: 'bold'
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  },
  reason: {
    marginTop: 5,
    color: '#dc3545',
    fontStyle: 'italic'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
