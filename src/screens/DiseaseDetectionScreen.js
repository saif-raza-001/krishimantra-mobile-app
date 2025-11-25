import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ML_SERVICE_URL } from '@env';
import theme from '../theme';

export default function DiseaseDetectionScreen() {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow camera access to take photos');
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!cameraResult.canceled) {
      setSelectedImage(cameraResult.assets[0]);
      analyzeImageWithAI(cameraResult.assets[0]);
    }
  };

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
      analyzeImageWithAI(pickerResult.assets[0]);
    }
  };

  const analyzeImageWithAI = async (image) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      const uriParts = image.uri.split('/');
      const filename = uriParts[uriParts.length - 1];
      
      formData.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: filename || 'plant.jpg',
      });

      console.log('🤖 Sending to ML service:', ML_SERVICE_URL);
      
      const response = await axios.post(
        `${ML_SERVICE_URL}/api/disease-detection`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          timeout: 60000,
        }
      );

      console.log('✅ AI Response:', response.data);
      setResult(response.data);
      
    } catch (error) {
      console.error('❌ AI Error:', error.message);
      console.error('Error details:', error.response?.data);
      
      Alert.alert(
        'Using Demo Mode',
        'ML service error. Showing demo results.',
        [{ text: 'OK' }]
      );
      
      const demoResult = {
        success: true,
        disease: 'Leaf Blight',
        confidence: 0.92,
        severity: 'Medium',
        description: 'Common fungal disease affecting leaves',
        treatment: 'Apply fungicide (Mancozeb 75% WP) at 2g/liter every 10-15 days',
        prevention: 'Remove infected leaves, ensure proper spacing, avoid overhead watering',
      };
      setResult(demoResult);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScreen = () => {
    setSelectedImage(null);
    setResult(null);
    setAnalyzing(false);
  };

  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.uploadSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📸</Text>
          </View>
          <Text style={styles.title}>{t('diseaseDetection.title')}</Text>
          <Text style={styles.subtitle}>{t('diseaseDetection.uploadImage')}</Text>

          <TouchableOpacity style={styles.buttonPrimary} onPress={takePhotoWithCamera}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.buttonGradient}
            >
              <MaterialCommunityIcons name="camera" size={24} color="#fff" />
              <Text style={styles.buttonText}>{t('diseaseDetection.takePhoto')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={pickImageFromGallery}>
            <MaterialCommunityIcons name="image" size={24} color={theme.colors.primary} />
            <Text style={styles.buttonSecondaryText}>{t('diseaseDetection.chooseGallery')}</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="lightbulb-on" size={20} color={theme.colors.primary} />
              <Text style={styles.infoTitle}>Tips for best results</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.infoItemText}>Take clear, well-lit photos</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.infoItemText}>Focus on affected areas</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="check" size={16} color={theme.colors.primary} />
              <Text style={styles.infoItemText}>Include multiple leaves</Text>
            </View>
          </View>

          <View style={styles.aiIndicator}>
            <MaterialCommunityIcons name="robot" size={20} color={theme.colors.primary} />
            <Text style={styles.aiText}>{t('dashboard.poweredBy')}</Text>
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
          <Text style={styles.analyzingText}>🤖 {t('diseaseDetection.analyzing')}</Text>
          <Text style={styles.analyzingSubtext}>This may take a few seconds</Text>
        </View>
      )}

      {result && !analyzing && (
        <View style={styles.resultSection}>
          <LinearGradient
            colors={
              result.severity === 'None' || result.severity === 'Low' 
                ? [theme.colors.primary, theme.colors.primaryDark]
                : result.severity === 'Error' 
                  ? ['#F44336', '#D32F2F']
                  : [theme.colors.accent, '#F57C00']
            }
            style={styles.resultHeader}
          >
            <View style={styles.resultHeaderContent}>
              <MaterialCommunityIcons 
                name={
                  result.severity === 'None' ? 'check-circle' : 
                  result.severity === 'Error' ? 'close-circle' : 
                  'alert-circle'
                } 
                size={32} 
                color="#fff" 
              />
              <View style={styles.resultHeaderText}>
                <Text style={styles.resultTitle}>{result.disease}</Text>
                <Text style={styles.confidenceText}>
                  {t('diseaseDetection.confidence')}: {(result.confidence * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.resultContent}>
            <View style={styles.resultItem}>
              <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
              <View style={styles.resultItemContent}>
                <Text style={styles.sectionLabel}>Description</Text>
                <Text style={styles.sectionText}>{result.description}</Text>
              </View>
            </View>

            {result.treatment !== 'N/A' && (
              <View style={styles.resultItem}>
                <MaterialCommunityIcons name="pill" size={20} color={theme.colors.accent} />
                <View style={styles.resultItemContent}>
                  <Text style={styles.sectionLabel}>{t('diseaseDetection.treatment')}</Text>
                  <Text style={styles.sectionText}>{result.treatment}</Text>
                </View>
              </View>
            )}

            {result.prevention !== 'N/A' && (
              <View style={styles.resultItem}>
                <MaterialCommunityIcons name="shield-check" size={20} color={theme.colors.accentBlue} />
                <View style={styles.resultItemContent}>
                  <Text style={styles.sectionLabel}>{t('diseaseDetection.prevention')}</Text>
                  <Text style={styles.sectionText}>{result.prevention}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.retryButton} onPress={resetScreen}>
        <LinearGradient
          colors={[theme.colors.accentBlue, '#1976D2']}
          style={styles.retryButtonGradient}
        >
          <MaterialCommunityIcons name="camera-retake" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Analyze Another</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  uploadSection: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: theme.spacing.screenPadding,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surfaceWarm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...theme.spacing.shadowMedium,
  },
  icon: { fontSize: 60 },
  title: { 
    fontSize: theme.fontSizes.xxl, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: theme.fontSizes.md, 
    color: theme.colors.textSecondary, 
    marginBottom: 30, 
    textAlign: 'center' 
  },
  buttonPrimary: { 
    width: '100%', 
    borderRadius: theme.spacing.radiusMedium, 
    overflow: 'hidden',
    marginBottom: 15,
    ...theme.spacing.shadowMedium,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.bold,
  },
  buttonSecondary: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: theme.spacing.radiusMedium,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    marginBottom: 20,
    gap: 10,
  },
  buttonSecondaryText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
  },
  infoBox: { 
    backgroundColor: theme.colors.surfaceWarm, 
    padding: 20, 
    borderRadius: theme.spacing.radiusLarge, 
    marginTop: 20, 
    width: '100%',
    ...theme.spacing.shadowSmall,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoItemText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary,
  },
  aiIndicator: { 
    marginTop: 30, 
    padding: 15, 
    backgroundColor: theme.colors.background, 
    borderRadius: theme.spacing.radiusPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiText: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.primary,
  },
  imagePreview: { 
    width: '100%', 
    height: 300, 
    resizeMode: 'cover' 
  },
  analyzingBox: { 
    backgroundColor: theme.colors.surfaceWarm, 
    padding: 30, 
    margin: 20, 
    borderRadius: theme.spacing.radiusLarge, 
    alignItems: 'center', 
    ...theme.spacing.shadowMedium,
  },
  analyzingText: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.primary, 
    marginTop: 15 
  },
  analyzingSubtext: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary, 
    marginTop: 5 
  },
  resultSection: { 
    margin: 20 
  },
  resultHeader: { 
    padding: 20, 
    borderRadius: theme.spacing.radiusLarge, 
    marginBottom: 15,
    ...theme.spacing.shadowMedium,
  },
  resultHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  resultHeaderText: {
    flex: 1,
  },
  resultTitle: { 
    fontSize: theme.fontSizes.xl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff', 
    marginBottom: 5,
  },
  confidenceText: { 
    fontSize: theme.fontSizes.sm, 
    color: 'rgba(255,255,255,0.9)',
  },
  resultContent: { 
    backgroundColor: theme.colors.surfaceWarm, 
    padding: 20, 
    borderRadius: theme.spacing.radiusLarge, 
    ...theme.spacing.shadowSmall,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  resultItemContent: {
    flex: 1,
  },
  sectionLabel: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    marginBottom: 6,
  },
  sectionText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary, 
    lineHeight: 22 
  },
  retryButton: { 
    margin: 20, 
    borderRadius: theme.spacing.radiusMedium, 
    overflow: 'hidden',
    ...theme.spacing.shadowMedium,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  retryButtonText: { 
    color: '#fff', 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.bold,
  },
});
