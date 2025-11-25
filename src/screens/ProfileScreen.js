import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../theme';

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      'Are you sure you want to logout?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Profile Photo */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Image
            source={{ uri: user?.profilePhoto || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <View style={styles.editBadge}>
            <MaterialCommunityIcons name="pencil" size={16} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name || 'Guest User'}</Text>
        <Text style={styles.email}>{user?.email || 'guest@agrismart.com'}</Text>
      </LinearGradient>

      {/* Farm Info */}
      {user?.farmLocation && (
        <View style={styles.farmInfo}>
          <View style={styles.farmInfoItem}>
            <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
            <Text style={styles.farmInfoText}>{user.farmLocation}</Text>
          </View>
          {user?.farmSize > 0 && (
            <View style={styles.farmInfoItem}>
              <MaterialCommunityIcons name="grid" size={20} color={theme.colors.primary} />
              <Text style={styles.farmInfoText}>{user.farmSize} {t('crops.acres')}</Text>
            </View>
          )}
        </View>
      )}

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.accountSettings')}</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View style={styles.optionIcon}>
            <MaterialCommunityIcons name="account-edit" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.optionText}>{t('profile.editProfile')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <View style={styles.optionIcon}>
            <MaterialCommunityIcons name="bell" size={24} color={theme.colors.accent} />
          </View>
          <Text style={styles.optionText}>{t('profile.notifications')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('LanguageSettings')}
        >
          <View style={styles.optionIcon}>
            <MaterialCommunityIcons name="translate" size={24} color={theme.colors.accentBlue} />
          </View>
          <Text style={styles.optionText}>{t('profile.language')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('About')}
        >
          <View style={styles.optionIcon}>
            <MaterialCommunityIcons name="information" size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.optionText}>{t('profile.about')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <View style={styles.version}>
        <Text style={styles.versionText}>KrishiMantra {t('profile.version')} 1.0.0</Text>
        <Text style={styles.versionText}>{t('profile.madeWith')}</Text>
      </View>
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    ...theme.spacing.shadowLarge,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.spacing.shadowMedium,
  },
  name: { 
    fontSize: theme.fontSizes.xxl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff', 
    marginBottom: 5 
  },
  email: { 
    fontSize: theme.fontSizes.sm, 
    color: 'rgba(255,255,255,0.9)' 
  },
  farmInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceWarm,
    marginHorizontal: 20,
    marginTop: -20,
    padding: 15,
    borderRadius: theme.spacing.radiusLarge,
    ...theme.spacing.shadowMedium,
  },
  farmInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  farmInfoText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textPrimary, 
    fontWeight: theme.fontWeights.semibold,
    marginLeft: 5,
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
    marginBottom: 15,
    color: theme.colors.textPrimary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  optionIcon: { 
    width: 40,
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: { 
    fontSize: theme.fontSizes.md, 
    color: theme.colors.textPrimary, 
    flex: 1, 
    fontWeight: theme.fontWeights.medium,
  },
  logoutButton: {
    backgroundColor: '#E57373',
    padding: 16,
    borderRadius: theme.spacing.radiusMedium,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...theme.spacing.shadowMedium,
  },
  logoutText: { 
    color: '#fff', 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.bold,
    marginLeft: 8,
  },
  version: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 30,
  },
  versionText: { 
    fontSize: theme.fontSizes.xs, 
    color: theme.colors.textSecondary, 
    marginVertical: 2 
  },
});
