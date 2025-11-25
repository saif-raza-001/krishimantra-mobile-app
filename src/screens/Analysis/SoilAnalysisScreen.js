import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../../theme';

export default function SoilAnalysisScreen({ navigation }) {
  const { t } = useTranslation();
  
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#8D6E63', '#6D4C41']}
        style={styles.header}
      >
        <Text style={styles.headerIcon}>🌱</Text>
        <Text style={styles.headerTitle}>{t('soilAnalysis.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('soilAnalysis.selectMethod')}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Analysis Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('QuickSoilAnalysis')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.cardGradient}
          >
            <View style={styles.cardIconContainer}>
              <MaterialCommunityIcons name="camera" size={40} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>{t('soilAnalysis.quick')}</Text>
            <Text style={styles.cardSubtitle}>Upload soil photo</Text>
            
            <View style={styles.cardFeatures}>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                <Text style={styles.featureText}>Instant AI analysis</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                <Text style={styles.featureText}>Soil type estimation</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                <Text style={styles.featureText}>General recommendations</Text>
              </View>
            </View>

            <View style={styles.badge}>
              <MaterialCommunityIcons name="robot" size={14} color="#fff" />
              <Text style={styles.badgeText}>AI Powered</Text>
            </View>

            <Text style={styles.cardNote}>Best for: Quick checks, beginners</Text>

            <View style={styles.cardArrow}>
              <MaterialCommunityIcons name="arrow-right-circle" size={32} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Accurate Analysis Card */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('AccurateSoilAnalysis')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.accentBlue, '#1976D2']}
            style={styles.cardGradient}
          >
            <View style={styles.cardIconContainer}>
              <MaterialCommunityIcons name="flask" size={40} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>{t('soilAnalysis.accurate')}</Text>
            <Text style={styles.cardSubtitle}>Enter soil test values</Text>
            
            <View style={styles.cardFeatures}>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                <Text style={styles.featureText}>Precise fertilizer calculations</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                <Text style={styles.featureText}>Scientific recommendations</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                <Text style={styles.featureText}>Professional results</Text>
              </View>
            </View>

            <View style={[styles.badge, { backgroundColor: '#FFC107' }]}>
              <MaterialCommunityIcons name="star" size={14} color="#000" />
              <Text style={[styles.badgeText, { color: '#000' }]}>Recommended</Text>
            </View>

            <Text style={styles.cardNote}>Best for: Professional farming decisions</Text>

            <View style={styles.cardArrow}>
              <MaterialCommunityIcons name="arrow-right-circle" size={32} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color={theme.colors.primary} />
            <Text style={styles.infoTitle}>Pro Tip</Text>
          </View>
          <Text style={styles.infoText}>
            For best results, use a soil testing kit ($10-30) and enter actual values in Accurate Analysis.
          </Text>
          <Text style={styles.infoText}>
            You can buy soil test kits online or from agricultural stores.
          </Text>
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
    alignItems: 'center',
    position: 'relative',
  },
  cardIconContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardTitle: { 
    fontSize: theme.fontSizes.xl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff', 
    marginBottom: 5 
  },
  cardSubtitle: { 
    fontSize: theme.fontSizes.md, 
    color: 'rgba(255,255,255,0.9)', 
    marginBottom: 20 
  },
  cardFeatures: { 
    width: '100%', 
    marginBottom: 15 
  },
  featureRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10,
    gap: 10,
  },
  featureText: { 
    fontSize: theme.fontSizes.sm, 
    color: '#fff', 
    flex: 1 
  },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: theme.spacing.radiusPill, 
    marginBottom: 15,
    gap: 6,
  },
  badgeText: { 
    fontSize: theme.fontSizes.xs, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff' 
  },
  cardNote: { 
    fontSize: theme.fontSizes.xs, 
    color: 'rgba(255,255,255,0.8)', 
    fontStyle: 'italic',
    marginBottom: 10,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  infoSection: { 
    backgroundColor: theme.colors.surfaceWarm, 
    padding: 20, 
    borderRadius: theme.spacing.radiusLarge, 
    marginTop: 10,
    ...theme.spacing.shadowSmall,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  infoTitle: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary,
  },
  infoText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary, 
    lineHeight: 22,
    marginBottom: 10,
  },
});
