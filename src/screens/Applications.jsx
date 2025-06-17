import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Animated
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoader } from '../components/LoaderContext';
import { Card } from 'react-native-paper';

const statusColors = {
  applied: '#4facfe',
  interviewScheduled: '#ffc107',
  rejected: '#ff6b6b'
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const { setLoading, loading } = useLoader();
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(
        `${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/applications/getAllAppliedApplicationsByStudentId`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Image source={{ uri: item.companyPicture }} style={styles.logo} />
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.company}>{item.companyName}</Text>
            </View>
          </View>

          <Text style={styles.description}>{item.description}</Text>

          <Text style={styles.detailText}>📍 {item.city}, {item.state}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Type:</Text> {item.type.toUpperCase()}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Location:</Text> {item.locationType}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Package:</Text> {item.annualPackage}</Text>
          <Text style={styles.detailText}><Text style={styles.bold}>Eligibility:</Text> {item.eligibility_criteria}</Text>

          <Text style={styles.date}>
            <Ionicons name="calendar" size={14} /> Applied on: {new Date(item.appliedDate).toDateString()}
          </Text>

          {item.status === 'rejected' && (
            <Text style={styles.reason}>Reason: {item.reason}</Text>
          )}

          <View style={styles.statusContainer}>
            <Text style={[styles.status, { backgroundColor: statusColors[item.status] || '#999' }]}>
              {item.status}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {!loading && applications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven’t applied to any jobs yet.</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderApplication}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Applications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 5,
    backgroundColor: '#f8f6ff',
    borderWidth: 0.3,
    borderColor: '#ccc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  company: {
    fontSize: 14,
    color: '#555',
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  status: {
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    overflow: 'hidden',
    textTransform: 'capitalize',
    elevation: 2,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
  },
  reason: {
    marginTop: 8,
    color: '#ff6b6b',
    fontStyle: 'italic',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
});
