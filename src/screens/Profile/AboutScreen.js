import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import theme from '../../theme';

export default function AboutScreen() {
  const { t } = useTranslation();

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerIcon}>🌾</Text>
        <Text style={styles.headerTitle}>{t('about.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('about.subtitle')}</Text>
        <Text style={styles.version}>{t('about.version')} 1.0.0</Text>
      </LinearGradient>

      {/* App Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about.aboutApp')}</Text>
        <Text style={styles.description}>
          {t('about.description1')}
        </Text>
        <Text style={styles.description}>
          {t('about.description2')}
        </Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about.keyFeatures')}</Text>
        <FeatureItem icon="🤖" text={t('about.feature1')} />
        <FeatureItem icon="🌱" text={t('about.feature2')} />
        <FeatureItem icon="🌾" text={t('about.feature3')} />
        <FeatureItem icon="📋" text={t('about.feature4')} />
        <FeatureItem icon="💬" text={t('about.feature5')} />
        <FeatureItem icon="🌤️" text={t('about.feature6')} />
        <FeatureItem icon="💰" text={t('about.feature7')} />
      </View>

      {/* Development Team */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about.developmentTeam')}</Text>
        
        {/* Lead Developer - MD SAIF RAZA */}
        <View style={styles.developerCard}>
          <View style={styles.developerHeader}>
            <Text style={styles.developerIcon}>👨‍💻</Text>
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>MD SAIF RAZA</Text>
              <Text style={styles.developerRole}>{t('about.fullStackDev')}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => openLink('mailto:saifraza867@gmail.com')}
          >
            <Text style={styles.contactIcon}>✉️</Text>
            <Text style={styles.contactText}>saifraza867@gmail.com</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => openLink('https://www.linkedin.com/in/saifraza2')}
          >
            <Text style={styles.contactIcon}>🔗</Text>
            <Text style={styles.contactText}>LinkedIn Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Team Member - MEGHA */}
        <View style={styles.developerCard}>
          <View style={styles.developerHeader}>
            <Text style={styles.developerIcon}>👩‍💻</Text>
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>MEGHA</Text>
              <Text style={styles.developerRole}>{t('about.fullStackDev')}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => openLink('https://www.linkedin.com/in/megha-922554263')}
          >
            <Text style={styles.contactIcon}>🔗</Text>
            <Text style={styles.contactText}>LinkedIn Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Team Member - MEHAK GARG */}
        <View style={styles.developerCard}>
          <View style={styles.developerHeader}>
            <Text style={styles.developerIcon}>👩‍💻</Text>
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>MEHAK GARG</Text>
              <Text style={styles.developerRole}>{t('about.fullStackDev')}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => openLink('https://www.linkedin.com/in/mehak-garg-0433b7290')}
          >
            <Text style={styles.contactIcon}>🔗</Text>
            <Text style={styles.contactText}>LinkedIn Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Technology Stack */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about.builtWith')}</Text>
        <TechItem icon="⚛️" name={t('about.tech1Name')} description={t('about.tech1Desc')} />
        <TechItem icon="🤖" name={t('about.tech2Name')} description={t('about.tech2Desc')} />
        <TechItem icon="🟢" name={t('about.tech3Name')} description={t('about.tech3Desc')} />
        <TechItem icon="🍃" name={t('about.tech4Name')} description={t('about.tech4Desc')} />
        <TechItem icon="🐍" name={t('about.tech5Name')} description={t('about.tech5Desc')} />
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('about.legal')}</Text>
        <Text style={styles.legalText}>
          {t('about.legalText1')}
        </Text>
        <Text style={styles.legalText}>
          {t('about.legalText2')}
        </Text>
      </View>

      {/* Made with Love */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('about.madeWith')}</Text>
        <Text style={styles.footerSubtext}>{t('about.empowering')}</Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const TechItem = ({ icon, name, description }) => (
  <View style={styles.techItem}>
    <Text style={styles.techIcon}>{icon}</Text>
    <View style={styles.techInfo}>
      <Text style={styles.techName}>{name}</Text>
      <Text style={styles.techDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  header: { 
    padding: 40, 
    paddingTop: 60, 
    alignItems: 'center',
    borderBottomLeftRadius: theme.spacing.radiusXLarge,
    borderBottomRightRadius: theme.spacing.radiusXLarge,
  },
  headerIcon: { fontSize: 60, marginBottom: 10 },
  headerTitle: { 
    fontSize: theme.fontSizes.xxxl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff', 
    marginBottom: 5 
  },
  headerSubtitle: { 
    fontSize: theme.fontSizes.md, 
    color: 'rgba(255,255,255,0.95)', 
    marginBottom: 5 
  },
  version: { 
    fontSize: theme.fontSizes.sm, 
    color: 'rgba(255,255,255,0.85)' 
  },
  section: {
    backgroundColor: theme.colors.surfaceWarm,
    margin: 15,
    padding: 20,
    borderRadius: theme.spacing.radiusLarge,
    ...theme.spacing.shadowSmall,
  },
  sectionTitle: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    marginBottom: 15 
  },
  description: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary, 
    lineHeight: 22, 
    marginBottom: 10 
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  featureIcon: { fontSize: 24, marginRight: 15, width: 35 },
  featureText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textPrimary, 
    flex: 1 
  },
  developerCard: {
    backgroundColor: theme.colors.background,
    padding: 15,
    borderRadius: theme.spacing.radiusMedium,
    marginBottom: 15,
  },
  developerHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  developerIcon: { fontSize: 40, marginRight: 15 },
  developerInfo: { flex: 1 },
  developerName: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    marginBottom: 3 
  },
  developerRole: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.spacing.radiusSmall,
    marginBottom: 8,
  },
  contactIcon: { fontSize: 18, marginRight: 10 },
  contactText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.primary, 
    fontWeight: theme.fontWeights.semibold,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  techIcon: { fontSize: 28, marginRight: 15, width: 40 },
  techInfo: { flex: 1 },
  techName: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.textPrimary, 
    marginBottom: 3 
  },
  techDescription: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary,
  },
  legalText: { 
    fontSize: theme.fontSizes.xs, 
    color: theme.colors.textMuted, 
    lineHeight: 18, 
    marginBottom: 8 
  },
  footer: { 
    alignItems: 'center', 
    padding: 20 
  },
  footerText: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.primary, 
    marginBottom: 5 
  },
  footerSubtext: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary,
  },
});
