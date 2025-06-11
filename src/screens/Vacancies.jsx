import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DataTable } from 'react-native-paper';
import Constants from 'expo-constants';
import axios from 'axios';
import VacancyCard from './VacancyCard';
import { useLoader } from '../components/LoaderContext';

const Vacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const { setLoading } = useLoader();
  const [apiResponse, setApiResponse] = useState({ message: '', type: '' });

  useEffect(() => {
    if (apiResponse.message) {
      const timer = setTimeout(() => {
        setApiResponse({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [apiResponse]);

  useEffect(() => {
    const fetchVacancies = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${Constants.expoConfig.extra.BASE_URL}/api/college2career/users/companies/getHiringVacancies`);
        if (response.data.status) {
          setVacancies(response.data.data);
        } else {
          // setLoading(true)
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

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const handleBackToTop = () => {
    setVisibleCount(3);
  };
  return (
    <ScrollView style={styles.container}>
      {apiResponse.message ? (
        <Text style={[
          styles.responseMessage,
          apiResponse.type === 'success' ? styles.success : styles.error
        ]}>
          {apiResponse.type === 'success' ? 'Success: ' : 'Error: '}
          {apiResponse.message}
        </Text>
      ) : null}
      {/* <Text style={styles.heading}>Vacancies</Text> */}
      <>
        {vacancies.slice(0, visibleCount).map((vacancy) => (
          <VacancyCard key={vacancy.vacancyId} {...vacancy} />
        ))}

        {visibleCount < vacancies.length ? (
          <TouchableOpacity style={styles.button} onPress={handleShowMore}>
            <Text style={styles.buttonText}>Show More</Text>
          </TouchableOpacity>
        ) : vacancies.length > 3 ? (
          <TouchableOpacity style={[styles.button, styles.backToTop]} onPress={handleBackToTop}>
            <Text style={styles.buttonText}>Back to Top</Text>
          </TouchableOpacity>
        ) : null}
      </>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
    marginTop: 20,
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
  backToTop: {
    backgroundColor: '#ff6b6b',
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
