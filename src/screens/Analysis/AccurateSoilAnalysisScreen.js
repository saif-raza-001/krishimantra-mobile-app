import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import theme from '../../theme';

export default function AccurateSoilAnalysisScreen({ navigation }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
  });
  const [result, setResult] = useState(null);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const analyzeSoil = () => {
    const ph = parseFloat(formData.ph);
    const n = parseFloat(formData.nitrogen);
    const p = parseFloat(formData.phosphorus);
    const k = parseFloat(formData.potassium);

    if (isNaN(ph) || isNaN(n) || isNaN(p) || isNaN(k)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for all fields');
      return;
    }

    if (ph < 3 || ph > 10) {
      Alert.alert('Invalid pH', 'pH should be between 3 and 10');
      return;
    }

    const analysis = calculateSoilAnalysis(ph, n, p, k);
    setResult(analysis);
  };

  const calculateSoilAnalysis = (ph, n, p, k) => {
    let soilType = '';
    if (ph < 5.5) soilType = 'Acidic Sandy Soil';
    else if (ph >= 5.5 && ph < 6.5) soilType = 'Slightly Acidic Loamy Soil';
    else if (ph >= 6.5 && ph <= 7.5) soilType = 'Neutral Loamy Soil';
    else if (ph > 7.5 && ph < 8.5) soilType = 'Alkaline Clay Soil';
    else soilType = 'Highly Alkaline Soil';

    const getNutrientLevel = (value, low, medium) => {
      if (value < low) return 'Low';
      if (value < medium) return 'Medium';
      return 'High';
    };

    const nLevel = getNutrientLevel(n, 100, 200);
    const pLevel = getNutrientLevel(p, 15, 30);
    const kLevel = getNutrientLevel(k, 100, 200);

    let phAdjustment = '';
    if (ph < 6.0) {
      const limeNeeded = ((6.5 - ph) * 200).toFixed(0);
      phAdjustment = `Add ${limeNeeded} kg/acre of agricultural lime to raise pH`;
    } else if (ph > 7.5) {
      const sulfurNeeded = ((ph - 7.0) * 50).toFixed(0);
      phAdjustment = `Add ${sulfurNeeded} kg/acre of elemental sulfur to lower pH`;
    } else {
      phAdjustment = 'pH is in optimal range. No adjustment needed.';
    }

    const fertilizers = [];
    
    if (nLevel === 'Low') {
      const ureaNeeded = ((200 - n) / 46 * 100).toFixed(0);
      fertilizers.push(`Urea (46-0-0): ${ureaNeeded} kg/acre`);
    } else if (nLevel === 'Medium') {
      fertilizers.push(`Urea (46-0-0): 100 kg/acre for maintenance`);
    }

    if (pLevel === 'Low') {
      const dapNeeded = ((30 - p) / 46 * 100).toFixed(0);
      fertilizers.push(`DAP (18-46-0): ${dapNeeded} kg/acre`);
    } else if (pLevel === 'Medium') {
      fertilizers.push(`DAP (18-46-0): 50 kg/acre for maintenance`);
    }

    if (kLevel === 'Low') {
      const mopNeeded = ((200 - k) / 60 * 100).toFixed(0);
      fertilizers.push(`MOP (0-0-60): ${mopNeeded} kg/acre`);
    } else if (kLevel === 'Medium') {
      fertilizers.push(`MOP (0-0-60): 75 kg/acre for maintenance`);
    }

    let suitableCrops = [];
    if (ph >= 6.0 && ph <= 7.5) {
      suitableCrops = ['Rice', 'Wheat', 'Corn', 'Vegetables', 'Cotton'];
    } else if (ph < 6.0) {
      suitableCrops = ['Potato', 'Blueberry', 'Tea', 'Sweet Potato'];
    } else {
      suitableCrops = ['Barley', 'Beetroot', 'Asparagus'];
    }

    let organicRecommendations = 'Apply 5-10 tons/acre of well-decomposed farmyard manure or compost annually to improve soil structure and nutrient retention.';
    
    if (nLevel === 'Low') {
      organicRecommendations += ' Add green manure crops or neem cake for nitrogen boost.';
    }

    return {
      soilType, ph, nLevel, pLevel, kLevel, phAdjustment, fertilizers,
      suitableCrops, organicRecommendations, nitrogen: n, phosphorus: p, potassium: k,
    };
  };

  const getNutrientColor = (level) => {
    if (level === 'High') return theme.colors.primary;
    if (level === 'Medium') return theme.colors.accent;
    return theme.colors.error;
  };

  const resetForm = () => {
    setFormData({ ph: '', nitrogen: '', phosphorus: '', potassium: '' });
    setResult(null);
  };

  if (!result) {
    return (
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={[theme.colors.accentBlue, '#1976D2']}
            style={styles.header}
          >
            <Text style={styles.headerIcon}>🧪</Text>
            <Text style={styles.headerTitle}>{t('soilAnalysis.accurate')}</Text>
            <Text style={styles.headerSubtitle}>Enter your soil test values</Text>
          </LinearGradient>

          <View style={styles.form}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>📝 How to get these values:</Text>
              <Text style={styles.infoText}>1. Buy a soil testing kit ($10-30) online or from agricultural stores</Text>
              <Text style={styles.infoText}>2. Follow kit instructions to test your soil</Text>
              <Text style={styles.infoText}>3. Enter the values below for accurate recommendations</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>🧪 {t('soilAnalysis.ph')} (3-10)</Text>
              <TextInput style={styles.input} placeholder="e.g., 6.5" value={formData.ph}
                onChangeText={(text) => updateField('ph', text)} keyboardType="decimal-pad" />
              <Text style={styles.hint}>Optimal range: 6.0 - 7.5</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>🌿 {t('soilAnalysis.nitrogen')} (N) in ppm</Text>
              <TextInput style={styles.input} placeholder="e.g., 180" value={formData.nitrogen}
                onChangeText={(text) => updateField('nitrogen', text)} keyboardType="numeric" />
              <Text style={styles.hint}>Typical range: 50 - 300 ppm</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>🧪 {t('soilAnalysis.phosphorus')} (P) in ppm</Text>
              <TextInput style={styles.input} placeholder="e.g., 25" value={formData.phosphorus}
                onChangeText={(text) => updateField('phosphorus', text)} keyboardType="numeric" />
              <Text style={styles.hint}>Typical range: 10 - 50 ppm</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>⚡ {t('soilAnalysis.potassium')} (K) in ppm</Text>
              <TextInput style={styles.input} placeholder="e.g., 150" value={formData.potassium}
                onChangeText={(text) => updateField('potassium', text)} keyboardType="numeric" />
              <Text style={styles.hint}>Typical range: 80 - 250 ppm</Text>
            </View>

            <TouchableOpacity style={styles.analyzeButton} onPress={analyzeSoil}>
              <Text style={styles.analyzeButtonText}>🔬 {t('soilAnalysis.analyzing')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton}
              onPress={() => navigation.navigate('QuickSoilAnalysis')}>
              <Text style={styles.switchButtonText}>📸 Or use {t('soilAnalysis.quick')} (Image)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.resultSection}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>✅ {t('soilAnalysis.results')}</Text>
          <Text style={styles.resultSubtitle}>{result.soilType}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Your Soil Values</Text>
          <View style={styles.valueGrid}>
            <ValueCard label={t('soilAnalysis.ph')} value={result.ph.toFixed(1)} color={theme.colors.accentBlue} />
            <ValueCard label={t('soilAnalysis.nitrogen')} value={`${result.nitrogen} ppm`} color={getNutrientColor(result.nLevel)} />
            <ValueCard label={t('soilAnalysis.phosphorus')} value={`${result.phosphorus} ppm`} color={getNutrientColor(result.pLevel)} />
            <ValueCard label={t('soilAnalysis.potassium')} value={`${result.potassium} ppm`} color={getNutrientColor(result.kLevel)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Nutrient Status</Text>
          <NutrientBar label={t('soilAnalysis.nitrogen') + " (N)"} level={result.nLevel} color={getNutrientColor(result.nLevel)} />
          <NutrientBar label={t('soilAnalysis.phosphorus') + " (P)"} level={result.pLevel} color={getNutrientColor(result.pLevel)} />
          <NutrientBar label={t('soilAnalysis.potassium') + " (K)"} level={result.kLevel} color={getNutrientColor(result.kLevel)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 pH Adjustment</Text>
          <Text style={styles.text}>{result.phAdjustment}</Text>
        </View>

        {result.fertilizers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💊 Fertilizer Recommendations</Text>
            {result.fertilizers.map((fertilizer, index) => (
              <View key={index} style={styles.fertilizerItem}>
                <Text style={styles.fertilizerIcon}>✓</Text>
                <Text style={styles.fertilizerText}>{fertilizer}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌿 Organic Amendments</Text>
          <Text style={styles.text}>{result.organicRecommendations}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌾 Best Crops for Your Soil</Text>
          <View style={styles.cropsGrid}>
            {result.suitableCrops.map((crop, index) => (
              <View key={index} style={styles.cropChip}>
                <Text style={styles.cropText}>{crop}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.newAnalysisButton} onPress={resetForm}>
          <Text style={styles.newAnalysisButtonText}>🔄 New Analysis</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const ValueCard = ({ label, value, color }) => (
  <View style={styles.valueCard}>
    <Text style={[styles.valueNumber, { color }]}>{value}</Text>
    <Text style={styles.valueLabel}>{label}</Text>
  </View>
);

const NutrientBar = ({ label, level, color }) => (
  <View style={styles.nutrientContainer}>
    <Text style={styles.nutrientLabel}>{label}</Text>
    <View style={styles.nutrientBarBg}>
      <View style={[styles.nutrientBarFill, { 
        width: level === 'High' ? '100%' : level === 'Medium' ? '60%' : '30%',
        backgroundColor: color 
      }]} />
    </View>
    <Text style={[styles.nutrientLevel, { color }]}>{level}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 30, paddingTop: 60, alignItems: 'center', borderBottomLeftRadius: theme.spacing.radiusXLarge, borderBottomRightRadius: theme.spacing.radiusXLarge },
  headerIcon: { fontSize: 60, marginBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)' },
  form: { padding: 20 },
  infoBox: { backgroundColor: '#E3F2FD', padding: 18, borderRadius: 12, marginBottom: 25, borderLeftWidth: 4, borderLeftColor: theme.colors.accentBlue },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#1565C0', marginBottom: 10 },
  infoText: { fontSize: 13, color: '#1565C0', marginBottom: 6, lineHeight: 20 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 },
  input: { backgroundColor: theme.colors.surfaceWarm, paddingVertical: 14, paddingHorizontal: 15, borderRadius: 10, fontSize: 16, borderWidth: 2, borderColor: theme.colors.border },
  hint: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 5, fontStyle: 'italic' },
  analyzeButton: { backgroundColor: theme.colors.accentBlue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, ...theme.spacing.shadowMedium },
  analyzeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchButton: { backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  switchButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  resultSection: { padding: 20 },
  resultHeader: { backgroundColor: theme.colors.primary, padding: 25, borderRadius: 15, marginBottom: 20, ...theme.spacing.shadowMedium },
  resultTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  resultSubtitle: { fontSize: 18, color: 'rgba(255,255,255,0.9)' },
  section: { backgroundColor: theme.colors.surfaceWarm, padding: 20, borderRadius: 12, marginBottom: 15, ...theme.spacing.shadowSmall },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 15 },
  text: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 },
  valueGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  valueCard: { width: '48%', backgroundColor: theme.colors.background, padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  valueNumber: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  valueLabel: { fontSize: 12, color: theme.colors.textSecondary },
  nutrientContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  nutrientLabel: { fontSize: 14, color: theme.colors.textPrimary, flex: 1 },
  nutrientBarBg: { flex: 2, height: 10, backgroundColor: theme.colors.border, borderRadius: 5, marginHorizontal: 10, overflow: 'hidden' },
  nutrientBarFill: { height: '100%', borderRadius: 5 },
  nutrientLevel: { fontSize: 14, fontWeight: 'bold', width: 60, textAlign: 'right' },
  fertilizerItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: theme.colors.background, padding: 12, borderRadius: 8 },
  fertilizerIcon: { fontSize: 18, color: theme.colors.primary, marginRight: 10 },
  fertilizerText: { fontSize: 14, color: theme.colors.textPrimary, flex: 1, fontWeight: '500' },
  cropsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  cropChip: { backgroundColor: theme.colors.background, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  cropText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  newAnalysisButton: { backgroundColor: theme.colors.accentBlue, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, ...theme.spacing.shadowMedium },
  newAnalysisButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
