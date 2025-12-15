import React, { useState, useEffect, useLayoutEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import axios from 'axios';
import VacancyCard from './VacancyCard';
import { useLoader } from '../components/LoaderContext';

const Vacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [modalVisible, setModalVisible] = useState(false);
  const { setLoading } = useLoader();
  const [apiResponse, setApiResponse] = useState({ message: '', type: '' });
  const [filters, setFilters] = useState({
    sortBy: null,
    jobType: null,
    location: null,
  });

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Vacancies',
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

          {/* Filter Button */}
          <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 15 }}>
            <Ionicons name="funnel-outline" size={24} color="black" />
          </TouchableOpacity>

          {/* Refresh Button */}
          <TouchableOpacity onPress={fetchVacancies}>
            <Ionicons name="refresh-outline" size={24} color="black" />
          </TouchableOpacity>

        </View>
      ),
    });
  }, [navigation]);

  const sortOptions = [
    { label: 'Latest Upload', value: 'latest' },
    { label: 'Highest Package', value: 'highest' },
  ];

  const typeOptions = [
    { label: 'Full-time', value: 'fulltime' },
    { label: 'Part-time', value: 'parttime' },
    { label: 'Internship', value: 'internship' },
  ];

  const locationOptions = [
    { label: 'Onsite', value: 'onsite' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'Remote', value: 'remote' },
  ];

  const fetchVacancies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/companies/getHiringVacancies`);
      if (response.data.status) {
        setVacancies(response.data.data);
      } else {
        setApiResponse({ message: response.data.message, type: 'error' });
      }
    } catch (error) {
      alert('Failed to fetch vacancies.');
      console.log('Failed to fetch vacancies: ' + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const handleFilterChange = (value, field) => {
    setFilters(() => {
      const newFilters = {
        sortBy: null,
        jobType: null,
        location: null,
      };
      newFilters[field] = value;
      return newFilters;
    });
    setModalVisible(false);
  };

  const filteredVacancies = vacancies
    .filter((vacancy) => !filters.jobType || vacancy.type === filters.jobType)
    .filter((vacancy) => !filters.location || vacancy.locationType === filters.location)
    .sort((a, b) => {
      if (filters.sortBy === 'latest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (filters.sortBy === 'highest') {
        const getSalaryNumber = (value) => {
          if (!value) return 0;
          const match = value.match(/[\d.]+/);
          return match ? parseFloat(match[0]) : 0;
        };
        return getSalaryNumber(b.annualPackage) - getSalaryNumber(a.annualPackage);
      }

      return 0;
    });

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filteredVacancies.length === 0 && styles.centerContent}
      >
        {filteredVacancies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No vacancies found matching your criteria.</Text>
            <Text style={styles.emptySubText}>Try adjusting the filters or check back later.</Text>
          </View>
        ) : (
          <>
            {filteredVacancies.slice(0, visibleCount).map((vacancy) => (
              <VacancyCard key={vacancy.vacancyId} {...vacancy} />
            ))}
            {visibleCount < filteredVacancies.length && (
              <TouchableOpacity style={styles.button} onPress={() => setVisibleCount(visibleCount + 3)}>
                <Text style={styles.buttonText}>Show More</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* FILTER MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Sort By</Text>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                handleFilterChange(option.value, 'sortBy');
                setModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.modalOption,
                  filters.sortBy === option.value && { fontWeight: 'bold', color: '#4facfe' },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.modalTitle}>Job Type</Text>
          {typeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => {
                handleFilterChange(option.value, 'jobType');
                setModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.modalOption,
                  filters.jobType === option.value && { fontWeight: 'bold', color: '#4facfe' },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.modalTitle}>Location</Text>
          {locationOptions.map((option) => (
            <TouchableOpacity key={option.value} onPress={() => handleFilterChange(option.value, 'location')}>
              <Text
                style={[
                  styles.modalOption,
                  filters.location === option.value && { fontWeight: 'bold', color: '#4facfe' },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => {
              setFilters({ sortBy: null, jobType: null, location: null });
              setModalVisible(false);
            }}
          >
            <Text style={styles.clearFilters}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#4facfe',
    marginVertical: 20,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
    marginTop: 15,
    marginBottom: 5,
  },
  modalOption: {
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  clearFilters: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default Vacancies;
