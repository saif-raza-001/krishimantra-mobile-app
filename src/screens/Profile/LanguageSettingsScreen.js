import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../../redux/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../../constants/languages';
import { saveLanguage } from '../../i18n';
import theme from '../../theme';

export default function LanguageSettingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLanguage = useSelector((state) => state.auth.language);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleSelectLanguage = async (code) => {
    setSelectedLanguage(code);
    
    // Change language in i18n
    await i18n.changeLanguage(code);
    
    // Save to Redux
    dispatch(setLanguage(code));
    
    // Save to AsyncStorage
    await saveLanguage(code);
    
    const languageName = LANGUAGES.find(l => l.code === code)?.name;
    
    Alert.alert(
      t('common.success'),
      `Language changed to ${languageName}. The app will now display in your selected language!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerIcon}>🌐</Text>
        <Text style={styles.headerTitle}>{t('language.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('language.subtitle')}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                selectedLanguage === language.code && styles.languageItemSelected,
              ]}
              onPress={() => handleSelectLanguage(language.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={[
                  styles.languageName,
                  selectedLanguage === language.code && styles.languageNameSelected,
                ]}>
                  {language.name}
                </Text>
                <Text style={styles.languageNative}>{language.nativeName}</Text>
              </View>
              {selectedLanguage === language.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 {t('language.note')}</Text>
          <Text style={styles.infoText}>
            The entire app interface and AI chatbot will respond in your selected language.
          </Text>
        </View>
      </ScrollView>
    </View>
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
  headerIcon: { fontSize: 50, marginBottom: 10 },
  headerTitle: { 
    fontSize: theme.fontSizes.xxl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff', 
    marginBottom: 5 
  },
  headerSubtitle: { 
    fontSize: theme.fontSizes.sm, 
    color: 'rgba(255,255,255,0.9)' 
  },
  content: { flex: 1 },
  section: {
    backgroundColor: theme.colors.surfaceWarm,
    margin: 15,
    borderRadius: theme.spacing.radiusLarge,
    overflow: 'hidden',
    ...theme.spacing.shadowSmall,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  languageItemSelected: {
    backgroundColor: theme.colors.background,
  },
  languageFlag: { fontSize: 32, marginRight: 15, width: 40 },
  languageInfo: { flex: 1 },
  languageName: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.textPrimary, 
    marginBottom: 3 
  },
  languageNameSelected: { 
    color: theme.colors.primary, 
    fontWeight: theme.fontWeights.bold,
  },
  languageNative: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary,
  },
  checkmark: { 
    fontSize: 24, 
    color: theme.colors.primary, 
    fontWeight: theme.fontWeights.bold,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    margin: 15,
    padding: 20,
    borderRadius: theme.spacing.radiusMedium,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accentBlue,
  },
  infoTitle: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.bold, 
    color: '#1976D2', 
    marginBottom: 10 
  },
  infoText: { 
    fontSize: theme.fontSizes.sm, 
    color: '#1565C0', 
    lineHeight: 22 
  },
});
