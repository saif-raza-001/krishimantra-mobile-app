import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';

export default function SoilAnalysisScreen() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    moisture: '',
  });

  const analyzeSoil = () => {
    setAnalyzing(true);

    // Simulate analysis
    setTimeout(() => {
      const mockResult = {
        nitrogen: {
          value: formData.nitrogen || Math.floor(Math.random() * 100 + 50),
          status: 'Optimal',
          recommendation: 'Nitrogen levels are good. Maintain current fertilization.',
        },
        phosphorus: {
          value: formData.phosphorus || Math.floor(Math.random() * 50 + 20),
          status: 'Low',
          recommendation: 'Apply phosphorus-rich fertilizer (DAP) at 50kg per acre.',
        },
        potassium: {
          value: formData.potassium || Math.floor(Math.random() * 80 + 40),
          status: 'Medium',
          recommendation: 'Potassium is moderate. Consider adding potash fertilizer.',
        },
        ph: {
          value: formData.ph || (Math.random() * 2 + 6).toFixed(1),
          status: 'Optimal',
          recommendation: 'pH level is ideal for most crops.',
        },
        moisture: {
          value: formData.moisture || Math.floor(Math.random() * 30 + 40),
          status: 'Optimal',
          recommendation: 'Soil moisture is adequate.',
        },
        cropRecommendations: [
          { name: '🌾 Wheat', suitability: 95 },
          { name: '🌽 Corn', suitability: 88 },
          { name: '🥔 Potato', suitability: 82 },
        ],
      };

      setResult(mockResult);
      setAnalyzing(false);
    }, 2000);
  };

  const resetAnalysis = () => {
    setResult(null);
    setFormData({
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      ph: '',
      moisture: '',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Optimal': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Low': return '#F44336';
      default: return '#666';
    }
  };

  if (!result) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🧪</Text>
          <Text style={styles.headerTitle}>Soil Analysis</Text>
          <Text style={styles.headerSubtitle}>Enter your soil test values or leave blank for demo</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>NPK Values (ppm)</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nitrogen (N)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 85"
              keyboardType="numeric"
              value={formData.nitrogen}
              onChangeText={(text) => setFormData({ ...formData, nitrogen: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phosphorus (P)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 45"
              keyboardType="numeric"
              value={formData.phosphorus}
              onChangeText={(text) => setFormData({ ...formData, phosphorus: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Potassium (K)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 65"
              keyboardType="numeric"
              value={formData.potassium}
              onChangeText={(text) => setFormData({ ...formData, potassium: text })}
            />
          </View>

          <Text style={styles.formTitle}>Other Parameters</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>pH Level</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 6.5"
              keyboardType="numeric"
              value={formData.ph}
              onChangeText={(text) => setFormData({ ...formData, ph: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Moisture (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 55"
              keyboardType="numeric"
              value={formData.moisture}
              onChangeText={(text) => setFormData({ ...formData, moisture: text })}
            />
          </View>

          <TouchableOpacity 
            style={styles.analyzeButton} 
            onPress={analyzeSoil}
            disabled={analyzing}
          >
            <Text style={styles.analyzeButtonText}>
              {analyzing ? '🔬 Analyzing...' : '🔬 Analyze Soil'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>📊 Analysis Results</Text>
      </View>

      {/* NPK Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NPK Levels</Text>

        <ResultCard 
          label="Nitrogen (N)"
          value={`${result.nitrogen.value} ppm`}
          status={result.nitrogen.status}
          recommendation={result.nitrogen.recommendation}
          color={getStatusColor(result.nitrogen.status)}
        />

        <ResultCard 
          label="Phosphorus (P)"
          value={`${result.phosphorus.value} ppm`}
          status={result.phosphorus.status}
          recommendation={result.phosphorus.recommendation}
          color={getStatusColor(result.phosphorus.status)}
        />

        <ResultCard 
          label="Potassium (K)"
          value={`${result.potassium.value} ppm`}
          status={result.potassium.status}
          recommendation={result.potassium.recommendation}
          color={getStatusColor(result.potassium.status)}
        />
      </View>

      {/* pH and Moisture */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soil Conditions</Text>

        <ResultCard 
          label="pH Level"
          value={result.ph.value}
          status={result.ph.status}
          recommendation={result.ph.recommendation}
          color={getStatusColor(result.ph.status)}
        />

        <ResultCard 
          label="Moisture"
          value={`${result.moisture.value}%`}
          status={result.moisture.status}
          recommendation={result.moisture.recommendation}
          color={getStatusColor(result.moisture.status)}
        />
      </View>

      {/* Crop Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌱 Recommended Crops</Text>
        {result.cropRecommendations.map((crop, index) => (
          <View key={index} style={styles.cropCard}>
            <Text style={styles.cropName}>{crop.name}</Text>
            <View style={styles.suitabilityBar}>
              <View style={[styles.suitabilityFill, { width: `${crop.suitability}%` }]} />
            </View>
            <Text style={styles.suitabilityText}>{crop.suitability}% Suitable</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetAnalysis}>
        <Text style={styles.resetButtonText}>🔄 New Analysis</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const ResultCard = ({ label, value, status, recommendation, color }) => (
  <View style={styles.resultCard}>
    <View style={styles.resultCardHeader}>
      <Text style={styles.resultLabel}>{label}</Text>
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
    <Text style={styles.resultValue}>{value}</Text>
    <Text style={styles.resultRecommendation}>{recommendation}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#9C27B0', padding: 30, paddingTop: 60, alignItems: 'center' },
  headerIcon: { fontSize: 60, marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9, textAlign: 'center' },
  form: { padding: 20 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 15 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 10, 
    padding: 15, 
    fontSize: 16 
  },
  analyzeButton: { 
    backgroundColor: '#9C27B0', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  analyzeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultHeader: { backgroundColor: '#9C27B0', padding: 25, paddingTop: 50, alignItems: 'center' },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  resultCard: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resultCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  resultLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  resultValue: { fontSize: 24, fontWeight: 'bold', color: '#9C27B0', marginBottom: 10 },
  resultRecommendation: { fontSize: 14, color: '#666', lineHeight: 20 },
  cropCard: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cropName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  suitabilityBar: { 
    height: 10, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 5, 
    overflow: 'hidden',
    marginBottom: 8,
  },
  suitabilityFill: { height: '100%', backgroundColor: '#4CAF50' },
  suitabilityText: { fontSize: 14, color: '#666', textAlign: 'right' },
  resetButton: { 
    backgroundColor: '#2196F3', 
    margin: 20, 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
