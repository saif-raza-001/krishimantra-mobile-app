import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Request notification permissions
  async requestPermissions() {
    if (!Device.isDevice) {
      Alert.alert('Error', 'Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Failed to get push notification permissions!');
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }

    return true;
  }

  // Send immediate local notification
  async sendNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Schedule notification for later
  async scheduleNotification(title, body, triggerDate, data = {}) {
    try {
      const trigger = {
        date: new Date(triggerDate),
      };

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Cancel scheduled notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Get all scheduled notifications
  async getAllScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Set up listeners for notification events
  setupListeners(onNotificationReceived, onNotificationTapped) {
    // Listener for when notification is received while app is open
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    });
  }

  // Remove listeners
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Helper: Schedule harvest reminder
  async scheduleHarvestReminder(cropName, harvestDate) {
    const reminderDate = new Date(harvestDate);
    reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before

    if (reminderDate > new Date()) {
      return await this.scheduleNotification(
        '🌾 Harvest Reminder',
        `${cropName} will be ready for harvest in 3 days!`,
        reminderDate,
        { type: 'harvest', cropName }
      );
    }
    return null;
  }

  // Helper: Send activity completed notification
  async sendActivityCompletedNotification(activityTitle) {
    await this.sendNotification(
      '✅ Activity Completed!',
      `Great job! "${activityTitle}" marked as complete.`,
      { type: 'activity_completed' }
    );
  }

  // Helper: Send all activities done notification
  async sendAllActivitiesDoneNotification() {
    await this.sendNotification(
      '🎉 All Tasks Complete!',
      "Amazing work! You've completed all your activities for today.",
      { type: 'all_activities_done' }
    );
  }

  // Helper: Send crop disease alert
  async sendDiseaseAlertNotification(cropName, disease) {
    await this.sendNotification(
      '⚠️ Crop Health Alert',
      `${disease} detected in ${cropName}. Check the app for treatment.`,
      { type: 'disease_alert', cropName, disease }
    );
  }
}

export default new NotificationService();
