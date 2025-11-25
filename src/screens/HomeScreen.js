import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { marketAPI } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      const response = await marketAPI.getPrices();
      setPrices(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.log('Error:', error);
      alert('Cannot connect to backend. Check if backend is running.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌾 AgriSmart</Text>
        <Text style={styles.subtitle}>Smart Farming Assistant</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Market Prices</Text>
        {prices.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cropName}>{item.crop}</Text>
            <Text style={styles.market}>{item.market}, {item.state}</Text>
            <Text style={styles.price}>₹{item.price}/{item.unit}</Text>
            <Text style={[styles.change, item.change >= 0 ? styles.up : styles.down]}>
              {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change)}%
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Analysis')}
      >
        <Text style={styles.buttonText}>🔬 Start Soil Analysis</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#4CAF50', padding: 30, paddingTop: 60, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', marginTop: 5 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cropName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  market: { fontSize: 14, color: '#666', marginTop: 5 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginTop: 5 },
  change: { fontSize: 14, marginTop: 5 },
  up: { color: '#4CAF50' },
  down: { color: '#f44336' },
  button: { backgroundColor: '#4CAF50', padding: 15, margin: 20, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
