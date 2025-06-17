import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoader } from '../components/LoaderContext';
import { Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const statusColors = {
  applied: '#4facfe',
  interviewScheduled: '#ffc107',
  shortlisted: '#7ed6df',
  rejected: '#ff6b6b',
  offered: '#6ab04c',
  offerAccepted: '#2980b9',
  offerRejected: '#e84393',
};

const statusList = [
  'applied',
  'interviewScheduled',
  'shortlisted',
  'rejected',
  'offered',
  'offerAccepted',
  'offerRejected',
];

const statusLabelMap = {
  applied: 'Applied',
  interviewScheduled: 'Interview Scheduled',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
  offered: 'Offered',
  offerAccepted: 'Offer Accepted',
  offerRejected: 'Offer Rejected'
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const { setLoading, loading } = useLoader();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedStatus, setSelectedStatus] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [sortByDate, setSortByDate] = useState(false);

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Applications',
      headerRight: () => (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 15 }}>
          <Ionicons name="funnel-outline" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(
        `${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/applications/getAllAppliedApplicationsByStudentId`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res?.data?.status) {
        const sorted = res.data.data.sort((a, b) => {
          const order = {
            interviewScheduled: 1,
            applied: 2,
            rejected: 3,
            shortlisted: 4,
            offered: 5,
            offerAccepted: 6,
            offerRejected: 7,
          };
          return order[a.status] - order[b.status];
        });
        setApplications(sorted);
        setFilteredApps(sorted);
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
      useNativeDriver: true,
    }).start();
  }, []);

  const filterByStatus = (status, sort = sortByDate) => {
    setSelectedStatus(status);
    let filtered = status ? applications.filter((app) => app.status === status) : applications;
    if (sort) {
      filtered = filtered.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
    }
    setFilteredApps(filtered);
    setModalVisible(false);
  };


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
          <Text style={styles.detailText}><Text style={styles.bold}>Type:</Text> {item.type?.toUpperCase()}</Text>
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
              {statusLabelMap[item.status] || item.status}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>

        {/* Modal for status filtering */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter By Status</Text>

            {statusList.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => filterByStatus(status)}
              >
                <Text
                  style={[
                    styles.modalOption,
                    selectedStatus === status && { fontWeight: 'bold', color: '#4facfe' },
                  ]}
                >
                  {statusLabelMap[status]}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => {
                const newSort = !sortByDate;
                setSortByDate(newSort);
                filterByStatus(selectedStatus, newSort);
              }}
            >
              <Text
                style={[
                  styles.modalOption,
                  sortByDate && { fontWeight: 'bold', color: '#4facfe' },
                ]}
              >
                Sort by Latest Date
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSortByDate(false);
                filterByStatus('');
              }}
            >
              <Text style={styles.clearFilters}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {!loading && filteredApps.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No applications found for selected status.</Text>
            <Text style={styles.emptySubText}>Try changing the filter or check back later.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredApps}
            keyExtractor={(item) => item.applicationId?.toString()}
            renderItem={renderApplication}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Applications;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  clearFilters: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
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
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
