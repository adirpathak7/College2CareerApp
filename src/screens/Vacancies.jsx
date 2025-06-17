import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DataTable } from 'react-native-paper';
import Constants from 'expo-constants';
import axios from 'axios';
import VacancyCard from './VacancyCard';
import { useLoader } from '../components/LoaderContext';
import { Dropdown } from 'react-native-element-dropdown';

const Vacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const { setLoading } = useLoader();
  const [apiResponse, setApiResponse] = useState({ message: '', type: '' });
  const [filters, setFilters] = useState({
    sortBy: null,
    jobType: null,
    location: null,
  });

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

  useEffect(() => {
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

    fetchVacancies();
  }, []);

  const handleFilterChange = (value, field) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const filteredVacancies = vacancies
    .filter((vacancy) => !filters.jobType || vacancy.jobType === filters.jobType)
    .filter((vacancy) => !filters.location || vacancy.location === filters.location)
    .sort((a, b) => {
      if (filters.sortBy === 'latest') {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      }
      if (filters.sortBy === 'highest') {
        return b.salary - a.salary;
      }
      return 0;
    });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {apiResponse.message && (
        <Text style={[styles.responseMessage, apiResponse.type === 'success' ? styles.success : styles.error]}>
          {apiResponse.type === 'success' ? 'Success: ' : 'Error: '}
          {apiResponse.message}
        </Text>
      )}

      <View style={styles.sortContainer}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortButton,
              filters.sortBy === option.value && styles.sortButtonSelected,
            ]}
            onPress={() => handleFilterChange(option.value, 'sortBy')}
          >
            <Text
              style={[
                styles.sortButtonText,
                filters.sortBy === option.value && styles.sortButtonTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredVacancies.slice(0, visibleCount).map((vacancy) => (
        <VacancyCard key={vacancy.vacancyId} {...vacancy} />
      ))}

      {visibleCount < filteredVacancies.length && (
        <TouchableOpacity style={styles.button} onPress={() => setVisibleCount(visibleCount + 3)}>
          <Text style={styles.buttonText}>Show More</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  dropdown: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#4facfe',
    marginVertical: 20,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseMessage: {
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    textAlign: 'center',
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
});

export default Vacancies;
