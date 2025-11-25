import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '../../redux/slices/notificationsSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../theme';

export default function NotificationsScreen({ navigation }) {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    Alert.alert('Success', 'All notifications marked as read');
  };

  const handleDelete = (id) => {
    dispatch(deleteNotification(id));
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => dispatch(clearAllNotifications()),
        },
      ]
    );
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'success': return theme.colors.primary;
      case 'warning': return theme.colors.accent;
      case 'error': return theme.colors.error;
      default: return theme.colors.accentBlue;
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return 'check-circle';
      case 'warning': return 'alert-circle';
      case 'error': return 'close-circle';
      default: return 'information';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount} unread
          </Text>
        </View>
      </LinearGradient>

      {/* Actions */}
      {notifications.length > 0 && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMarkAllAsRead}>
            <MaterialCommunityIcons name="check-all" size={18} color={theme.colors.primary} />
            <Text style={styles.actionText}>Mark all read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClearAll}>
            <MaterialCommunityIcons name="delete-outline" size={18} color="#F44336" />
            <Text style={[styles.actionText, styles.clearText]}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView style={styles.list}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-off-outline" size={80} color="#DDD" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>You're all caught up!</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[
                styles.notificationCard,
                !notif.read && styles.notificationUnread,
              ]}
              onPress={() => handleMarkAsRead(notif.id)}
              activeOpacity={0.7}
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(notif.type) }]}>
                    <MaterialCommunityIcons 
                      name={getTypeIcon(notif.type)} 
                      size={24} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.notificationTextContainer}>
                    <Text style={styles.notificationTitle}>{notif.title}</Text>
                    <Text style={styles.notificationMessage}>{notif.message}</Text>
                    <Text style={styles.notificationTime}>{formatTime(notif.time)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(notif.id)}
                  >
                    <MaterialCommunityIcons name="close" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Info Note */}
      <View style={styles.infoNote}>
        <MaterialCommunityIcons name="information-outline" size={20} color="#1565C0" />
        <Text style={styles.infoText}>
          Notifications will also be sent to your phone as SMS
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  header: { 
    padding: 20, 
    paddingTop: 60, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderBottomLeftRadius: theme.spacing.radiusXLarge,
    borderBottomRightRadius: theme.spacing.radiusXLarge,
  },
  backButton: { marginRight: 15, padding: 5 },
  headerTextContainer: { flex: 1 },
  headerTitle: { 
    fontSize: theme.fontSizes.xxl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff' 
  },
  headerSubtitle: { 
    fontSize: theme.fontSizes.sm, 
    color: 'rgba(255,255,255,0.9)', 
    marginTop: 5 
  },
  actions: { 
    flexDirection: 'row', 
    padding: 15, 
    gap: 10 
  },
  actionButton: { 
    flex: 1, 
    backgroundColor: theme.colors.surfaceWarm, 
    flexDirection: 'row',
    padding: 12, 
    borderRadius: theme.spacing.radiusMedium, 
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.spacing.shadowSmall,
    gap: 6,
  },
  actionText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.primary, 
    fontWeight: theme.fontWeights.semibold,
  },
  clearButton: { 
    backgroundColor: '#FFEBEE' 
  },
  clearText: { 
    color: '#F44336' 
  },
  list: { flex: 1 },
  notificationCard: {
    backgroundColor: theme.colors.surfaceWarm,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: theme.spacing.radiusMedium,
    padding: 15,
    ...theme.spacing.shadowSmall,
    position: 'relative',
  },
  notificationUnread: {
    backgroundColor: theme.colors.background,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  notificationContent: { flex: 1 },
  notificationHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start' 
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationTextContainer: { flex: 1 },
  notificationTitle: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    marginBottom: 5 
  },
  notificationMessage: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary, 
    lineHeight: 20, 
    marginBottom: 8 
  },
  notificationTime: { 
    fontSize: theme.fontSizes.xs, 
    color: theme.colors.textMuted,
  },
  deleteButton: { 
    padding: 5,
    marginLeft: 10,
  },
  unreadDot: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  emptyState: { 
    alignItems: 'center', 
    paddingTop: 100 
  },
  emptyTitle: { 
    fontSize: theme.fontSizes.xl, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    marginTop: 20, 
    marginBottom: 10 
  },
  emptyText: { 
    fontSize: theme.fontSizes.md, 
    color: theme.colors.textSecondary,
  },
  infoNote: { 
    backgroundColor: '#E3F2FD', 
    padding: 15, 
    margin: 15, 
    borderRadius: theme.spacing.radiusMedium, 
    borderLeftWidth: 4, 
    borderLeftColor: theme.colors.accentBlue,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: { 
    fontSize: theme.fontSizes.sm, 
    color: '#1565C0', 
    lineHeight: 20, 
    flex: 1 
  },
});