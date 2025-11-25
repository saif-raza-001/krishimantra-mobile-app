import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import theme from '../../theme';

export default function NotificationSettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    allNotifications: true,
    taskReminders: true,
    weatherAlerts: true,
    diseaseAlerts: false,
    marketUpdates: true,
    cropHealth: true,
    emailNotifications: false,
    smsNotifications: false,
  });

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    Alert.alert(t('common.success'), t('notificationSettings.saved'), [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerIcon}>🔔</Text>
        <Text style={styles.headerTitle}>{t('notificationSettings.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('notificationSettings.subtitle')}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Master Toggle */}
        <View style={styles.section}>
          <SettingItem
            icon="🔔"
            title={t('notificationSettings.allNotifications')}
            description={t('notificationSettings.allNotificationsDesc')}
            value={settings.allNotifications}
            onToggle={() => toggleSetting('allNotifications')}
            primary
          />
        </View>

        {/* App Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notificationSettings.appNotifications')}</Text>
          
          <SettingItem
            icon="📋"
            title={t('notificationSettings.taskReminders')}
            description={t('notificationSettings.taskRemindersDesc')}
            value={settings.taskReminders}
            onToggle={() => toggleSetting('taskReminders')}
          />
          
          <SettingItem
            icon="🌤️"
            title={t('notificationSettings.weatherAlerts')}
            description={t('notificationSettings.weatherAlertsDesc')}
            value={settings.weatherAlerts}
            onToggle={() => toggleSetting('weatherAlerts')}
          />
          
          <SettingItem
            icon="🔬"
            title={t('notificationSettings.diseaseAlerts')}
            description={t('notificationSettings.diseaseAlertsDesc')}
            value={settings.diseaseAlerts}
            onToggle={() => toggleSetting('diseaseAlerts')}
          />
          
          <SettingItem
            icon="💰"
            title={t('notificationSettings.marketUpdates')}
            description={t('notificationSettings.marketUpdatesDesc')}
            value={settings.marketUpdates}
            onToggle={() => toggleSetting('marketUpdates')}
          />
          
          <SettingItem
            icon="🌾"
            title={t('notificationSettings.cropHealth')}
            description={t('notificationSettings.cropHealthDesc')}
            value={settings.cropHealth}
            onToggle={() => toggleSetting('cropHealth')}
          />
        </View>

        {/* Communication Channels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notificationSettings.channels')}</Text>
          
          <SettingItem
            icon="✉️"
            title={t('notificationSettings.emailNotifications')}
            description={t('notificationSettings.emailNotificationsDesc')}
            value={settings.emailNotifications}
            onToggle={() => toggleSetting('emailNotifications')}
          />
          
          <SettingItem
            icon="📱"
            title={t('notificationSettings.smsNotifications')}
            description={t('notificationSettings.smsNotificationsDesc')}
            value={settings.smsNotifications}
            onToggle={() => toggleSetting('smsNotifications')}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>💾 {t('notificationSettings.saveSettings')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const SettingItem = ({ icon, title, description, value, onToggle, primary }) => (
  <View style={[styles.settingItem, primary && styles.settingItemPrimary]}>
    <View style={styles.settingIcon}>
      <Text style={styles.settingIconText}>{icon}</Text>
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, primary && styles.settingTitlePrimary]}>{title}</Text>
      <Text style={styles.settingDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#D0D0D0', true: theme.colors.primaryLight }}
      thumbColor={value ? theme.colors.primary : '#f4f3f4'}
    />
  </View>
);

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
    padding: 15,
    borderRadius: theme.spacing.radiusLarge,
    ...theme.spacing.shadowSmall,
  },
  sectionTitle: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textSecondary, 
    marginBottom: 15, 
    marginLeft: 5 
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  settingItemPrimary: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.radiusMedium,
    padding: 12,
    marginBottom: 5,
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingIconText: { fontSize: 24 },
  settingContent: { flex: 1 },
  settingTitle: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.textPrimary, 
    marginBottom: 3 
  },
  settingTitlePrimary: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold,
  },
  settingDescription: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary, 
    lineHeight: 18 
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    margin: 15,
    paddingVertical: 16,
    borderRadius: theme.spacing.radiusMedium,
    alignItems: 'center',
    ...theme.spacing.shadowMedium,
  },
  saveButtonText: { 
    color: '#fff', 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold,
  },
});
