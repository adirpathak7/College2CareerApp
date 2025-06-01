// screens/Applications.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Applications = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📄 My Applications will be listed here.</Text>
    </View>
  );
};

export default Applications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});
