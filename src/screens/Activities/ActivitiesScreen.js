import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { toggleComplete, deleteActivity } from '../../redux/slices/activitiesSlice';
import { decrementPendingTasks, incrementCompletedTasks, incrementPendingTasks } from '../../redux/slices/dashboardSlice';
import { addNotification } from '../../redux/slices/notificationsSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import notificationService from '../../services/notificationService';
import theme from '../../theme';

export default function ActivitiesScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activities = useSelector((state) => state.activities.activities);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleToggleComplete = async (activity) => {
    const wasCompleted = activity.completed;
    dispatch(toggleComplete(activity.id));

    if (!wasCompleted) {
      dispatch(decrementPendingTasks());
      dispatch(incrementCompletedTasks());
      await notificationService.sendActivityCompletedNotification(activity.title);
      
      dispatch(addNotification({
        id: Date.now().toString(),
        title: '✅ Activity Completed',
        message: `You marked "${activity.title}" as complete.`,
        time: new Date().toISOString(),
        read: false,
        type: 'success',
      }));

      Alert.alert('✅ Completed!', `"${activity.title}" marked as complete`, [{ text: 'OK' }]);

      const remainingPending = activities.filter(a => !a.completed && a.id !== activity.id).length;
      if (remainingPending === 0) {
        setTimeout(async () => {
          await notificationService.sendAllActivitiesDoneNotification();
          dispatch(addNotification({
            id: (Date.now() + 1).toString(),
            title: '🎉 All Tasks Complete!',
            message: "Amazing work! You've completed all your activities.",
            time: new Date().toISOString(),
            read: false,
            type: 'success',
          }));
          Alert.alert('🎉 All Tasks Complete!', "Amazing work! You've completed all your activities for today!", [{ text: 'Awesome!' }]);
        }, 1000);
      }
    } else {
      dispatch(incrementPendingTasks());
    }
  };

  const handleDeleteActivity = (activity) => {
    Alert.alert(
      t('common.delete') + ' ' + t('activities.title'), 
      `Are you sure you want to delete "${activity.title}"?`, 
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            dispatch(deleteActivity(activity.id));
            if (!activity.completed) {
              dispatch(decrementPendingTasks());
            }
          },
        },
      ]
    );
  };

  const getUniqueDates = () => {
    const dates = activities.map(a => a.scheduledDate);
    return [...new Set(dates)].sort();
  };

  const filteredActivities = selectedDate 
    ? activities.filter(a => a.scheduledDate === selectedDate)
    : activities;

  const uniqueDates = getUniqueDates();

  const getActivityIcon = (type) => {
    const icons = {
      'Irrigation': '💧',
      'Fertilizer': '🌿',
      'Pesticide': '🧪',
      'Harvesting': '🌾',
      'Planting': '🌱',
      'Other': '📌',
    };
    return icons[type] || '📌';
  };

  const renderActivity = ({ item }) => (
    <View style={styles.activityCard}>
      <TouchableOpacity style={styles.checkbox} onPress={() => handleToggleComplete(item)}>
        <View style={[styles.checkboxInner, item.completed && styles.checkboxCompleted]}>
          {item.completed && <MaterialCommunityIcons name="check" size={18} color="#fff" />}
        </View>
      </TouchableOpacity>

      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityIcon}>{getActivityIcon(item.type)}</Text>
          <Text style={[styles.activityTitle, item.completed && styles.activityTitleCompleted]}>
            {item.title}
          </Text>
        </View>

        {item.description && (
          <Text style={styles.activityDescription}>{item.description}</Text>
        )}

        <View style={styles.activityFooter}>
          <View style={styles.activityMeta}>
            <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{new Date(item.scheduledDate).toLocaleDateString()}</Text>
          </View>
          <View style={[
            styles.priorityBadge,
            item.priority === 'High' && { backgroundColor: '#FFEBEE' },
            item.priority === 'Medium' && { backgroundColor: '#FFF3E0' },
            item.priority === 'Low' && { backgroundColor: '#E8F5E9' },
          ]}>
            <Text style={[
              styles.priorityText,
              item.priority === 'High' && { color: '#F44336' },
              item.priority === 'Medium' && { color: theme.colors.accent },
              item.priority === 'Low' && { color: theme.colors.primary },
            ]}>
              {t('activities.' + item.priority.toLowerCase())}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteActivity(item)}
      >
        <MaterialCommunityIcons name="delete-outline" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>✅</Text>
      <Text style={styles.emptyTitle}>No Activities Yet</Text>
      <Text style={styles.emptyText}>Add your first task to get started!</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddActivity')}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.addButtonGradient}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.addButtonText}>{t('activities.addActivity')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('activities.title')}</Text>
        <Text style={styles.headerSubtitle}>{activities.length} {t('activities.title').toLowerCase()}</Text>
      </LinearGradient>

      {/* Date Filter */}
      {uniqueDates.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateFilter}>
          <TouchableOpacity
            style={[styles.dateChip, selectedDate === null && styles.dateChipActive]}
            onPress={() => setSelectedDate(null)}
          >
            <Text style={[styles.dateChipText, selectedDate === null && styles.dateChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {uniqueDates.map((date) => (
            <TouchableOpacity
              key={date}
              style={[styles.dateChip, selectedDate === date && styles.dateChipActive]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dateChipText, selectedDate === date && styles.dateChipTextActive]}>
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={filteredActivities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState}
      />

      {activities.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddActivity')}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.fabGradient}
          >
            <MaterialCommunityIcons name="plus" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
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
    borderBottomLeftRadius: theme.spacing.radiusXLarge,
    borderBottomRightRadius: theme.spacing.radiusXLarge,
  },
  headerTitle: { 
    fontSize: theme.fontSizes.xxl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: { 
    fontSize: theme.fontSizes.md, 
    color: 'rgba(255,255,255,0.9)',
  },
  dateFilter: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  dateChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.spacing.radiusPill,
    backgroundColor: theme.colors.surfaceWarm,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dateChipText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  dateChipTextActive: {
    color: '#fff',
  },
  list: { 
    padding: theme.spacing.screenPadding,
    paddingBottom: 100,
  },
  activityCard: {
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.spacing.radiusLarge,
    padding: theme.spacing.md,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...theme.spacing.shadowSmall,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityTitle: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
  },
  activityTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  activityDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.spacing.radiusSmall,
  },
  priorityText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: 30,
  },
  addButton: {
    borderRadius: theme.spacing.radiusMedium,
    overflow: 'hidden',
    ...theme.spacing.shadowMedium,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  addButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...theme.spacing.shadowLarge,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
