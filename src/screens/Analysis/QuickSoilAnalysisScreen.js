import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ML_SERVICE_URL } from '@env';
import theme from '../../theme';

export default function QuickSoilAnalysisScreen({ navigation }) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photos');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!pickerResult.canceled) {
      setSelectedImage(pickerResult.assets[0]);
      analyzeSoilWithAI(pickerResult.assets[0]);
    }
  };

  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow camera access');
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!cameraResult.canceled) {
      setSelectedImage(cameraResult.assets[0]);
      analyzeSoilWithAI(cameraResult.assets[0]);
    }
  };

  const analyzeSoilWithAI = async (image) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      const uriParts = image.uri.split('/');
      const filename = uriParts[uriParts.length - 1];
      
      formData.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: filename || 'soil.jpg',
      });

      console.log('🌱 Sending to ML service:', ML_SERVICE_URL);
      
      const response = await axios.post(
        `${ML_SERVICE_URL}/api/soil-analysis`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          timeout: 60000,
        }
      );

      console.log('✅ Soil Analysis:', response.data);
      setResult(response.data);
      
    } catch (error) {
      console.error('❌ Soil Analysis Error:', error.message);
      
      // Show error result instead of demo data
      setResult({
        success: false,
        is_soil: false,
        detected_object: 'Unknown',
        message: 'Failed to connect to AI service. Please check your internet connection and try again.',
        tips: [
          'Ensure you have a stable internet connection',
          'Try again in a few moments',
          'Make sure you are uploading a soil image'
        ]
      });
      
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScreen = () => {
    setSelectedImage(null);
    setResult(null);
    setAnalyzing(false);
  };

  const getNutrientColor = (level) => {
    if (level === 'High') return theme.colors.primary;
    if (level === 'Medium') return theme.colors.accent;
    if (level === 'N/A') return theme.colors.textMuted;
    return theme.colors.error;
  };

  // Initial upload screen
  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.uploadSection}>
          <Text style={styles.icon}>📸</Text>
          <Text style={styles.title}>{t('soilAnalysis.quick')}</Text>
          <Text style={styles.subtitle}>Upload a photo of your soil</Text>

          <TouchableOpacity style={styles.buttonPrimary} onPress={takePhotoWithCamera}>
            <Text style={styles.buttonIcon}>📷</Text>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={pickImageFromGallery}>
            <Text style={styles.buttonIcon}>🖼️</Text>
            <Text style={styles.buttonSecondaryText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>⚠️ Important Note</Text>
            <Text style={styles.disclaimerText}>
              This provides ESTIMATES based on visual analysis. For precise farming decisions and fertilizer calculations, use {t('soilAnalysis.accurate')}.
            </Text>
          </View>

          <TouchableOpacity style={styles.switchButton}
            onPress={() => navigation.navigate('AccurateSoilAnalysis')}>
            <Text style={styles.switchButtonText}>🧪 {t('soilAnalysis.accurate')}</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>💡 Tips for best results:</Text>
            <Text style={styles.infoItem}>• Take photo of clean soil surface</Text>
            <Text style={styles.infoItem}>• Good lighting is important</Text>
            <Text style={styles.infoItem}>• Remove debris and plants</Text>
            <Text style={styles.infoItem}>• Focus on the soil texture</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />

      {analyzing && (
        <View style={styles.analyzingBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.analyzingText}>🤖 {t('soilAnalysis.analyzing')}</Text>
          <Text style={styles.analyzingSubtext}>AI is examining visual properties...</Text>
        </View>
      )}

      {/* ❌ NOT SOIL - Show Error Message */}
      {result && !analyzing && (result.is_soil === false || result.success === false) && (
        <View style={styles.resultSection}>
          <View style={styles.notSoilBanner}>
            <Text style={styles.notSoilIcon}>🚫</Text>
            <Text style={styles.notSoilTitle}>Not Soil Detected</Text>
          </View>

          <View style={styles.detectedObjectCard}>
            <Text style={styles.detectedLabel}>AI Detected:</Text>
            <Text style={styles.detectedObject}>
              {result.detected_object || 'This image does not appear to be soil'}
            </Text>
          </View>

          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              {result.message || 'Please upload a clear photo of actual soil for analysis.'}
            </Text>
          </View>

          {result.tips && result.tips.length > 0 && (
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Tips for Soil Photos:</Text>
              {result.tips.map((tip, index) => (
                <Text key={index} style={styles.tipItem}>• {tip}</Text>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.retryButton} onPress={resetScreen}>
            <Text style={styles.retryButtonText}>📸 Try Again with Soil Image</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ SOIL DETECTED - Show Analysis Results */}
      {result && !analyzing && result.is_soil !== false && result.success !== false && (
        <View style={styles.resultSection}>
          <View style={styles.successBanner}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>Soil Analysis Complete</Text>
          </View>

          <View style={styles.estimateBanner}>
            <Text style={styles.estimateText}>📊 ESTIMATES ONLY - Not for precision farming</Text>
          </View>

          <View style={styles.soilTypeHeader}>
            <Text style={styles.soilTypeTitle}>🌍 {result.soil_type}</Text>
            <Text style={styles.soilColor}>Color: {result.color}</Text>
          </View>

          <View style={styles.propertiesGrid}>
            <PropertyCard icon="📏" label="Texture" value={result.texture} />
            <PropertyCard icon="💧" label="Moisture" value={result.moisture} />
            <PropertyCard icon="🧪" label={t('soilAnalysis.ph')} value={result.ph_estimate ? `~${result.ph_estimate.toFixed(1)}` : 'N/A'} />
            <PropertyCard icon="🌿" label="Organic" value={result.organic_matter} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Nutrient Estimates</Text>
            <NutrientBar label={t('soilAnalysis.nitrogen') + " (N)"} level={result.nitrogen} color={getNutrientColor(result.nitrogen)} />
            <NutrientBar label={t('soilAnalysis.phosphorus') + " (P)"} level={result.phosphorus} color={getNutrientColor(result.phosphorus)} />
            <NutrientBar label={t('soilAnalysis.potassium') + " (K)"} level={result.potassium} color={getNutrientColor(result.potassium)} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Recommendations</Text>
            <Text style={styles.text}>{result.recommendations}</Text>
          </View>

          {result.suitable_crops && result.suitable_crops.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌾 Suitable Crops</Text>
              <View style={styles.cropsGrid}>
                {result.suitable_crops.map((crop, index) => (
                  <View key={index} style={styles.cropChip}>
                    <Text style={styles.cropText}>{crop}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {result.improvements && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔧 Improvements</Text>
              <Text style={styles.text}>{result.improvements}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.upgradeButton}
            onPress={() => {
              resetScreen();
              navigation.navigate('AccurateSoilAnalysis');
            }}>
            <Text style={styles.upgradeButtonText}>🧪 {t('soilAnalysis.accurate')}</Text>
            <Text style={styles.upgradeButtonSubtext}>Use soil test kit for precise results</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retryButton} onPress={resetScreen}>
            <Text style={styles.retryButtonText}>📸 Analyze Another Sample</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const PropertyCard = ({ icon, label, value }) => (
  <View style={styles.propertyCard}>
    <Text style={styles.propertyIcon}>{icon}</Text>
    <Text style={styles.propertyLabel}>{label}</Text>
    <Text style={styles.propertyValue}>{value || 'N/A'}</Text>
  </View>
);

const NutrientBar = ({ label, level, color }) => (
  <View style={styles.nutrientContainer}>
    <Text style={styles.nutrientLabel}>{label}</Text>
    <View style={styles.nutrientBarBg}>
      <View style={[styles.nutrientBarFill, { 
        width: level === 'High' ? '100%' : level === 'Medium' ? '60%' : level === 'Low' ? '30%' : '0%',
        backgroundColor: color 
      }]} />
    </View>
    <Text style={[styles.nutrientLevel, { color }]}>{level || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  uploadSection: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, paddingTop: 80 },
  icon: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: 30, textAlign: 'center' },
  buttonPrimary: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, width: '100%', justifyContent: 'center', ...theme.spacing.shadowMedium, marginBottom: 10 },
  buttonSecondary: { backgroundColor: theme.colors.surfaceWarm, flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, width: '100%', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.primary, marginBottom: 15 },
  buttonIcon: { fontSize: 24, marginRight: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonSecondaryText: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' },
  disclaimerBox: { backgroundColor: '#FFF3E0', padding: 20, borderRadius: 12, width: '100%', marginBottom: 15, borderLeftWidth: 4, borderLeftColor: theme.colors.accent },
  disclaimerTitle: { fontSize: 16, fontWeight: 'bold', color: '#E65100', marginBottom: 8 },
  disclaimerText: { fontSize: 13, color: '#E65100', lineHeight: 20 },
  switchButton: { backgroundColor: theme.colors.accentBlue, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, marginBottom: 20 },
  switchButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  infoBox: { backgroundColor: theme.colors.surfaceWarm, padding: 15, borderRadius: 10, width: '100%' },
  infoText: { fontSize: 13, fontWeight: 'bold', color: theme.colors.primaryDark, marginBottom: 8 },
  infoItem: { fontSize: 12, color: theme.colors.textSecondary, marginLeft: 5, marginVertical: 3 },
  imagePreview: { width: '100%', height: 250, resizeMode: 'cover' },
  analyzingBox: { backgroundColor: theme.colors.surfaceWarm, padding: 30, margin: 20, borderRadius: 15, alignItems: 'center', ...theme.spacing.shadowMedium },
  analyzingText: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary, marginTop: 15 },
  analyzingSubtext: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 5 },
  resultSection: { margin: 20 },
  
  // Not Soil Styles
  notSoilBanner: { backgroundColor: '#FFEBEE', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#F44336' },
  notSoilIcon: { fontSize: 50, marginBottom: 10 },
  notSoilTitle: { fontSize: 22, fontWeight: 'bold', color: '#D32F2F' },
  detectedObjectCard: { backgroundColor: '#FFF3E0', padding: 15, borderRadius: 12, marginBottom: 15 },
  detectedLabel: { fontSize: 14, color: '#E65100', marginBottom: 5 },
  detectedObject: { fontSize: 18, fontWeight: 'bold', color: '#E65100' },
  messageCard: { backgroundColor: theme.colors.surfaceWarm, padding: 15, borderRadius: 12, marginBottom: 15 },
  messageText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 },
  tipsCard: { backgroundColor: '#E3F2FD', padding: 15, borderRadius: 12, marginBottom: 15 },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', color: '#1565C0', marginBottom: 10 },
  tipItem: { fontSize: 14, color: '#1565C0', marginVertical: 3 },
  
  // Success Styles
  successBanner: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  successIcon: { fontSize: 24, marginRight: 10 },
  successText: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  
  estimateBanner: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 10, marginBottom: 15, alignItems: 'center' },
  estimateText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  soilTypeHeader: { backgroundColor: theme.colors.primary, padding: 20, borderRadius: 15, marginBottom: 15, ...theme.spacing.shadowMedium },
  soilTypeTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  soilColor: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  propertiesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  propertyCard: { width: '48%', backgroundColor: theme.colors.surfaceWarm, padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', ...theme.spacing.shadowSmall },
  propertyIcon: { fontSize: 32, marginBottom: 8 },
  propertyLabel: { fontSize: 11, color: theme.colors.textSecondary, marginBottom: 4 },
  propertyValue: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary },
  section: { backgroundColor: theme.colors.surfaceWarm, padding: 20, borderRadius: 12, marginBottom: 15, ...theme.spacing.shadowSmall },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 15 },
  text: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22 },
  nutrientContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  nutrientLabel: { fontSize: 13, color: theme.colors.textPrimary, flex: 1 },
  nutrientBarBg: { flex: 2, height: 8, backgroundColor: theme.colors.border, borderRadius: 4, marginHorizontal: 10, overflow: 'hidden' },
  nutrientBarFill: { height: '100%', borderRadius: 4 },
  nutrientLevel: { fontSize: 13, fontWeight: 'bold', width: 60, textAlign: 'right' },
  cropsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  cropChip: { backgroundColor: theme.colors.background, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  cropText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  upgradeButton: { backgroundColor: theme.colors.accentBlue, padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10, ...theme.spacing.shadowMedium },
  upgradeButtonText: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  upgradeButtonSubtext: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  retryButton: { backgroundColor: theme.colors.primary, paddingVertical: 15, marginTop: 15, borderRadius: 12, alignItems: 'center', ...theme.spacing.shadowSmall },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
