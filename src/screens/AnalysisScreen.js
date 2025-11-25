import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../theme';

export default function AnalysisScreen({ navigation }) {
  const { t } = useTranslation();
  
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerIcon}>🔬</Text>
        <Text style={styles.headerTitle}>{t('analysis.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('dashboard.poweredBy')}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Disease Detection Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('DiseaseDetection')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#D32F2F', '#C62828']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🔬</Text>
              <View style={styles.cardBadge}>
                <MaterialCommunityIcons name="robot" size={14} color="#fff" />
                <Text style={styles.badgeText}>Real AI</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>{t('analysis.diseaseDetection')}</Text>
            <Text style={styles.cardDescription}>
              Upload crop photos for AI-powered disease identification and treatment recommendations
            </Text>
            <View style={styles.cardFooter}>
              <MaterialCommunityIcons name="arrow-right-circle" size={28} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Soil Analysis Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('SoilAnalysis')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8D6E63', '#6D4C41']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🌱</Text>
              <View style={styles.cardBadge}>
                <MaterialCommunityIcons name="star" size={14} color="#fff" />
                <Text style={styles.badgeText}>2 Methods</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>{t('analysis.soilAnalysis')}</Text>
            <Text style={styles.cardDescription}>
              Quick AI estimates or accurate analysis with test kit values - your choice!
            </Text>
            <View style={styles.cardFooter}>
              <MaterialCommunityIcons name="arrow-right-circle" size={28} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Info Note */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>AI-Powered Analysis</Text>
            <Text style={styles.infoText}>
              Our AI models are trained on thousands of crop images to provide accurate disease detection and soil recommendations.
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  header: { 
    padding: 30, 
    paddingTop: 60, 
    alignItems: 'center',
    borderBottomLeftRadius: theme.spacing.radiusXLarge,
    borderBottomRightRadius: theme.spacing.radiusXLarge,
  },
  headerIcon: { fontSize: 60, marginBottom: 10 },
  headerTitle: { 
    fontSize: theme.fontSizes.xxl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff', 
    marginBottom: 5 
  },
  headerSubtitle: { 
    fontSize: theme.fontSizes.md, 
    color: 'rgba(255,255,255,0.9)' 
  },
  content: { 
    padding: theme.spacing.screenPadding,
  },
  card: { 
    marginBottom: 20, 
    borderRadius: theme.spacing.radiusLarge, 
    overflow: 'hidden', 
    ...theme.spacing.shadowLarge,
  },
  cardGradient: { 
    padding: 25, 
    minHeight: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cardIcon: { 
    fontSize: 50,
  },
  cardBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: theme.spacing.radiusMedium,
    gap: 5,
  },
  badgeText: { 
    fontSize: theme.fontSizes.xs, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff' 
  },
  cardTitle: { 
    fontSize: theme.fontSizes.xl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff', 
    marginBottom: 12 
  },
  cardDescription: { 
    fontSize: theme.fontSizes.sm, 
    color: 'rgba(255,255,255,0.95)', 
    lineHeight: 22, 
    marginBottom: 15,
    flex: 1,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  infoCard: {
    backgroundColor: theme.colors.surfaceWarm,
    padding: 20,
    borderRadius: theme.spacing.radiusLarge,
    flexDirection: 'row',
    gap: 15,
    ...theme.spacing.shadowSmall,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
