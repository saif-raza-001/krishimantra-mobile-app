import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../../theme';
import FloatingCard from '../../components/FloatingCard';

export default function DashboardScreen({ navigation }) {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  const stats = useSelector((state) => state.dashboard);
  const notifications = useSelector((state) => state.notifications.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{t('dashboard.greeting')},</Text>
            <Text style={styles.userName}>{user?.name || 'Farmer'} 👋</Text>
          </View>
          
          {/* Professional Notification Icon */}
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.notificationIconContainer}>
              <MaterialCommunityIcons 
                name="bell" 
                size={28} 
                color="#fff" 
              />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="🌱"
          value={stats.totalCrops}
          label={t('dashboard.totalCrops')}
          color={theme.colors.primary}
          onPress={() => navigation.navigate('Crops')}
        />
        <StatCard
          icon="📋"
          value={stats.pendingTasks}
          label={t('dashboard.pendingTasks')}
          color={theme.colors.accent}
          onPress={() => navigation.navigate('Tasks')}
        />
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          icon="✅"
          value={stats.completedTasks}
          label={t('dashboard.completedTasks')}
          color={theme.colors.accentBlue}
          onPress={() => navigation.navigate('Tasks')}
        />
        <StatCard
          icon="💚"
          value={stats.healthyCrops}
          label={t('dashboard.healthyCrops')}
          color={theme.colors.success}
          onPress={() => navigation.navigate('Crops')}
        />
      </View>

      {/* Quick Actions - Using FloatingCard Component */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        
        {/* AI Analysis - Using FloatingCard */}
        <FloatingCard 
          gradient={[theme.colors.primary, theme.colors.primaryDark]}
          onPress={() => navigation.navigate('Analysis')}
          shadow="floating"
          style={{ marginBottom: 15 }}
        >
          <View style={styles.aiAnalysisGradient}>
            <View style={styles.aiAnalysisHeader}>
              <MaterialCommunityIcons name="atom" size={40} color="#fff" />
              <View style={styles.aiAnalysisBadge}>
                <Text style={styles.aiAnalysisBadgeText}>AI Powered</Text>
              </View>
            </View>
            <Text style={styles.aiAnalysisTitle}>{t('dashboard.aiAnalysis')}</Text>
            <Text style={styles.aiAnalysisSubtitle}>{t('dashboard.poweredBy')}</Text>
            <View style={styles.aiAnalysisFeatures}>
              <View style={styles.aiFeatureRow}>
                <Text style={styles.aiFeatureIcon}>🔬</Text>
                <Text style={styles.aiFeatureText}>{t('dashboard.diseaseDetection')}</Text>
              </View>
              <View style={styles.aiFeatureRow}>
                <Text style={styles.aiFeatureIcon}>🌱</Text>
                <Text style={styles.aiFeatureText}>{t('dashboard.soilAnalysis')}</Text>
              </View>
            </View>
            <Text style={styles.aiAnalysisArrow}>›</Text>
          </View>
        </FloatingCard>

        {/* Other Actions Grid - Using FloatingCard */}
        <View style={styles.actionsGrid}>
          <FloatingCard 
            gradient={['#00966A', theme.colors.primary]}
            onPress={() => navigation.navigate('Weather')}
            shadow="medium"
            style={{ width: '48%' }}
          >
            <View style={styles.actionGradient}>
              <Text style={styles.actionIcon}>🌤️</Text>
              <Text style={styles.actionLabel}>{t('dashboard.weather')}</Text>
            </View>
          </FloatingCard>

          <FloatingCard 
            gradient={['#A0826D', '#8D6E63']}
            onPress={() => navigation.navigate('MarketTrends')}
            shadow="medium"
            style={{ width: '48%' }}
          >
            <View style={styles.actionGradient}>
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionLabel}>{t('dashboard.marketPrices')}</Text>
            </View>
          </FloatingCard>
        </View>
      </View>

      {/* Recent Activities */}
      {stats.recentActivities.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('dashboard.recentActivities')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.seeAll}>{t('dashboard.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          {stats.recentActivities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </View>
      )}

      {/* Quick Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 {t('dashboard.todayTip')}</Text>
        <FloatingCard shadow="small">
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              {t('dashboard.tipText')}
            </Text>
          </View>
        </FloatingCard>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const StatCard = ({ icon, value, label, color, onPress }) => (
  <TouchableOpacity 
    style={[styles.statCard, { borderLeftColor: color }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.statIconContainer}>
      <Text style={styles.statIcon}>{icon}</Text>
    </View>
    <View style={styles.statContent}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={styles.statArrow}>›</Text>
  </TouchableOpacity>
);

const ActivityCard = ({ activity }) => {
  const theme = require('../../theme').default;
  return (
    <View style={styles.activityCard}>
      <View style={styles.activityIcon}>
        <Text style={styles.activityEmoji}>{activity.icon || '📌'}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
      <View style={[styles.activityStatus, { 
        backgroundColor: activity.completed ? theme.colors.success : theme.colors.accent 
      }]}>
        <Text style={styles.statusText}>
          {activity.completed ? '✓' : '○'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  header: { 
    paddingTop: 50, 
    paddingBottom: 30, 
    paddingHorizontal: theme.spacing.screenPadding,
    borderBottomLeftRadius: theme.spacing.radiusXLarge,
    borderBottomRightRadius: theme.spacing.radiusXLarge,
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  greeting: { 
    fontSize: theme.fontSizes.md, 
    color: 'rgba(255,255,255,0.9)' 
  },
  userName: { 
    fontSize: theme.fontSizes.xxl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff', 
    marginTop: 5 
  },
  
  // Professional Notification Button
  notificationButton: {
    padding: 8,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: { 
    position: 'absolute', 
    top: -4, 
    right: -4, 
    backgroundColor: theme.colors.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  badgeText: { 
    color: '#fff', 
    fontSize: 11, 
    fontWeight: theme.fontWeights.bold,
  },
  
  statsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: theme.spacing.md, 
    marginTop: -20, 
    marginBottom: 10 
  },
  statCard: { 
    flex: 1, 
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.spacing.radiusLarge, 
    padding: theme.spacing.md,
    marginHorizontal: 5, 
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...theme.spacing.shadowMedium,
  },
  statIconContainer: { marginRight: 10 },
  statIcon: { fontSize: 32 },
  statContent: { flex: 1 },
  statValue: { 
    fontSize: theme.fontSizes.xl, 
    fontWeight: theme.fontWeights.bold,
  },
  statLabel: { 
    fontSize: theme.fontSizes.xs, 
    color: theme.colors.textSecondary, 
    marginTop: 2 
  },
  statArrow: { 
    fontSize: 24, 
    color: theme.colors.textMuted, 
    marginLeft: 5 
  },
  
  section: { 
    paddingHorizontal: theme.spacing.screenPadding, 
    marginTop: theme.spacing.sectionGap,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  sectionTitle: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    marginBottom: 15 
  },
  seeAll: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.primary, 
    fontWeight: theme.fontWeights.semibold,
  },

  // AI Analysis Card Content
  aiAnalysisGradient: {
    padding: 20,
    position: 'relative',
  },
  aiAnalysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiAnalysisIcon: {
    fontSize: 40,
  },
  aiAnalysisBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.spacing.radiusMedium,
  },
  aiAnalysisBadgeText: {
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
  },
  aiAnalysisTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
    marginBottom: 4,
  },
  aiAnalysisSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
  },
  aiAnalysisFeatures: {
    marginBottom: 5,
  },
  aiFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiFeatureIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  aiFeatureText: {
    fontSize: theme.fontSizes.sm,
    color: '#fff',
    fontWeight: theme.fontWeights.medium,
  },
  aiAnalysisArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    fontSize: 40,
    color: 'rgba(255,255,255,0.3)',
  },

  // Other Actions Grid
  actionsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  actionGradient: { 
    padding: 20, 
    alignItems: 'center',
  },
  actionIcon: { fontSize: 40, marginBottom: 8 },
  actionLabel: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: theme.fontWeights.semibold, 
    color: '#fff', 
    textAlign: 'center' 
  },

  activityCard: { 
    flexDirection: 'row', 
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.spacing.radiusMedium, 
    padding: 15, 
    marginBottom: 10,
    alignItems: 'center',
    ...theme.spacing.shadowSmall,
  },
  activityIcon: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: { fontSize: 22 },
  activityContent: { flex: 1 },
  activityTitle: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.textPrimary, 
    marginBottom: 3 
  },
  activityTime: { 
    fontSize: theme.fontSizes.xs, 
    color: theme.colors.textSecondary,
  },
  activityStatus: { 
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: theme.fontWeights.bold,
  },
  
  tipCard: { 
    padding: 18,
  },
  tipText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textPrimary, 
    lineHeight: 20 
  },
});
