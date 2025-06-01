// screens/Companies.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Companies = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏢 Companies will be listed here.</Text>
    </View>
  );
};

export default Companies;

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
