import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { collection, getDocs, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import theme from '../../theme';

export default function AdminDashboard({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview'); // overview, users, notifications, system
  const [notificationModal, setNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newToday: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    bannedUsers: 0,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(u => 
        u.name?.toLowerCase().includes(query) || 
        u.email?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setUsers(usersList);
      setFilteredUsers(usersList);
      calculateStats(usersList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load users');
    }
  };

  const calculateStats = (usersList) => {
    const now = new Date();
    const today = now.toDateString();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newToday = usersList.filter(u => 
      new Date(u.createdAt).toDateString() === today
    ).length;

    const newThisWeek = usersList.filter(u => 
      new Date(u.createdAt) >= oneWeekAgo
    ).length;

    const newThisMonth = usersList.filter(u => 
      new Date(u.createdAt) >= oneMonthAgo
    ).length;

    const bannedUsers = usersList.filter(u => u.banned === true).length;

    setStats({
      totalUsers: usersList.length,
      activeUsers: usersList.filter(u => !u.banned).length,
      newToday,
      newThisWeek,
      newThisMonth,
      bannedUsers,
    });
  };

  const handleBanUser = async (userId, userName, currentBanStatus) => {
    const action = currentBanStatus ? 'Unban' : 'Ban';
    Alert.alert(
      `${action} User`,
      `Are you sure you want to ${action.toLowerCase()} ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', userId), {
                banned: !currentBanStatus,
                bannedAt: !currentBanStatus ? new Date().toISOString() : null,
              });
              Alert.alert('Success', `User ${action.toLowerCase()}ned successfully`);
              loadUsers();
            } catch (error) {
              console.error('Error banning user:', error);
              Alert.alert('Error', `Failed to ${action.toLowerCase()} user`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = (userId, userName) => {
    Alert.alert(
      'Delete User',
      `⚠️ Are you sure you want to permanently delete ${userName}?\n\nThis action cannot be undone!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              Alert.alert('Success', 'User deleted successfully');
              loadUsers();
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      Alert.alert('Error', 'Please enter title and message');
      return;
    }

    Alert.alert(
      'Send Notification',
      `Send to all ${stats.activeUsers} active users?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              // Store notification in Firestore for all users
              const batch = [];
              users.forEach(user => {
                if (!user.banned) {
                  batch.push(
                    setDoc(doc(collection(db, 'notifications')), {
                      userId: user.id,
                      title: notificationTitle,
                      message: notificationMessage,
                      createdAt: new Date().toISOString(),
                      read: false,
                      type: 'admin_broadcast',
                    })
                  );
                }
              });

              await Promise.all(batch);
              
              Alert.alert('Success', `Notification sent to ${stats.activeUsers} users!`);
              setNotificationModal(false);
              setNotificationTitle('');
              setNotificationMessage('');
            } catch (error) {
              console.error('Error sending notification:', error);
              Alert.alert('Error', 'Failed to send notification');
            }
          },
        },
      ]
    );
  };

  const handleExportUsers = () => {
    // Create CSV data
    let csv = 'Name,Email,Joined Date,Farm Location,Farm Size,Status\n';
    users.forEach(u => {
      csv += `"${u.name}","${u.email}","${new Date(u.createdAt).toLocaleDateString()}","${u.farmLocation || 'N/A'}","${u.farmSize || 0} ${u.farmSizeUnit || 'acres'}","${u.banned ? 'Banned' : 'Active'}"\n`;
    });

    Alert.alert(
      'Export Users',
      `${users.length} users ready to export as CSV.\n\nData:\n${csv.slice(0, 200)}...`,
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from Admin Panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const renderOverviewTab = () => (
    <View>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard icon="account-group" value={stats.totalUsers} label="Total Users" color={theme.colors.primary} />
        <StatCard icon="account-check" value={stats.activeUsers} label="Active" color={theme.colors.accentBlue} />
        <StatCard icon="account-plus" value={stats.newToday} label="New Today" color={theme.colors.accent} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="calendar-week" value={stats.newThisWeek} label="This Week" color="#9C27B0" />
        <StatCard icon="calendar-month" value={stats.newThisMonth} label="This Month" color="#FF5722" />
        <StatCard icon="account-cancel" value={stats.bannedUsers} label="Banned" color="#F44336" />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionCard} onPress={loadUsers}>
          <MaterialCommunityIcons name="refresh" size={24} color={theme.colors.primary} />
          <Text style={styles.actionText}>Refresh Data</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => setNotificationModal(true)}>
          <MaterialCommunityIcons name="bell-ring" size={24} color={theme.colors.accent} />
          <Text style={styles.actionText}>Send Broadcast Notification</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleExportUsers}>
          <MaterialCommunityIcons name="download" size={24} color={theme.colors.accentBlue} />
          <Text style={styles.actionText}>Export User Data (CSV)</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Dashboard')}>
          <MaterialCommunityIcons name="view-dashboard" size={24} color="#9C27B0" />
          <Text style={styles.actionText}>View App as User</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUsersTab = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name or email..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Users List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          All Users ({filteredUsers.length})
          {searchQuery && ` - Search: "${searchQuery}"`}
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-off" size={60} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No users found' : 'No users yet'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((userData) => (
            <View key={userData.id} style={[styles.userCard, userData.banned && styles.userCardBanned]}>
              <View style={styles.userInfo}>
                <View style={[styles.userAvatar, userData.banned && { backgroundColor: '#F44336' }]}>
                  <Text style={styles.userAvatarText}>
                    {userData.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{userData.name}</Text>
                    {userData.banned && (
                      <View style={styles.bannedBadge}>
                        <Text style={styles.bannedText}>BANNED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userEmail}>{userData.email}</Text>
                  <Text style={styles.userDate}>
                    📅 {new Date(userData.createdAt).toLocaleDateString()}
                  </Text>
                  {userData.farmLocation && (
                    <Text style={styles.userFarm}>
                      🏡 {userData.farmLocation} • {userData.farmSize || 0} {userData.farmSizeUnit || 'acres'}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => handleBanUser(userData.id, userData.name, userData.banned)}
                >
                  <MaterialCommunityIcons 
                    name={userData.banned ? "account-check" : "account-cancel"} 
                    size={24} 
                    color={userData.banned ? theme.colors.accentBlue : "#FF9800"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => handleDeleteUser(userData.id, userData.name)}
                >
                  <MaterialCommunityIcons name="delete" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderSystemTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>System Information</Text>
      
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>App Version</Text>
        <Text style={styles.infoValue}>KrishiMantra v1.0.0</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Database</Text>
        <Text style={styles.infoValue}>Firebase Firestore</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Authentication</Text>
        <Text style={styles.infoValue}>Firebase Auth (Enabled)</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Total Database Records</Text>
        <Text style={styles.infoValue}>{stats.totalUsers} users</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Admin Email</Text>
        <Text style={styles.infoValue}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={() => {
        Alert.alert(
          '⚠️ Danger Zone',
          'System management features:\n\n• Clear Cache\n• Reset Database\n• Maintenance Mode\n\nThese features are available in production builds.',
          [{ text: 'OK' }]
        );
      }}>
        <MaterialCommunityIcons name="alert" size={20} color="#fff" />
        <Text style={styles.dangerButtonText}>Danger Zone Settings</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>👑 Admin Panel</Text>
            <Text style={styles.headerSubtitle}>Welcome, {user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
            onPress={() => setSelectedTab('overview')}
          >
            <MaterialCommunityIcons 
              name="view-dashboard" 
              size={20} 
              color={selectedTab === 'overview' ? theme.colors.primary : '#fff'} 
            />
            <Text style={[styles.tabText, selectedTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'users' && styles.tabActive]}
            onPress={() => setSelectedTab('users')}
          >
            <MaterialCommunityIcons 
              name="account-group" 
              size={20} 
              color={selectedTab === 'users' ? theme.colors.primary : '#fff'} 
            />
            <Text style={[styles.tabText, selectedTab === 'users' && styles.tabTextActive]}>
              Users
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'system' && styles.tabActive]}
            onPress={() => setSelectedTab('system')}
          >
            <MaterialCommunityIcons 
              name="cog" 
              size={20} 
              color={selectedTab === 'system' ? theme.colors.primary : '#fff'} 
            />
            <Text style={[styles.tabText, selectedTab === 'system' && styles.tabTextActive]}>
              System
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'users' && renderUsersTab()}
        {selectedTab === 'system' && renderSystemTab()}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Notification Modal */}
      <Modal
        visible={notificationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📢 Broadcast Notification</Text>
              <TouchableOpacity onPress={() => setNotificationModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Send to {stats.activeUsers} active users
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Notification Title"
              placeholderTextColor={theme.colors.textMuted}
              value={notificationTitle}
              onChangeText={setNotificationTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Notification Message"
              placeholderTextColor={theme.colors.textMuted}
              value={notificationMessage}
              onChangeText={setNotificationMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleSendNotification}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.modalButtonGradient}
              >
                <MaterialCommunityIcons name="send" size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Send Notification</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const StatCard = ({ icon, value, label, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.screenPadding,
    borderBottomLeftRadius: theme.spacing.radiusXLarge,
    borderBottomRightRadius: theme.spacing.radiusXLarge,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
  logoutButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: theme.spacing.radiusMedium,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.spacing.radiusSmall,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: theme.fontSizes.xs,
    color: '#fff',
    fontWeight: theme.fontWeights.semibold,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginTop: 15,
    marginBottom: 5,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.spacing.radiusLarge,
    padding: theme.spacing.md,
    marginHorizontal: 5,
    alignItems: 'center',
    ...theme.spacing.shadowMedium,
  },
  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
  },
  statLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: theme.spacing.screenPadding,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceWarm,
    padding: 16,
    borderRadius: theme.spacing.radiusMedium,
    marginBottom: 10,
    ...theme.spacing.shadowSmall,
  },
  actionText: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeights.semibold,
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.spacing.radiusMedium,
    paddingHorizontal: 15,
    marginHorizontal: theme.spacing.screenPadding,
    marginTop: 15,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceWarm,
    padding: 15,
    borderRadius: theme.spacing.radiusMedium,
    marginBottom: 10,
    ...theme.spacing.shadowSmall,
  },
  userCardBanned: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  userName: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginRight: 8,
  },
  bannedBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.spacing.radiusSmall,
  },
  bannedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: theme.fontWeights.bold,
  },
  userEmail: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 3,
  },
  userDate: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  userFarm: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 8,
    marginLeft: 5,
  },
  infoCard: {
    backgroundColor: theme.colors.surfaceWarm,
    padding: 16,
    borderRadius: theme.spacing.radiusMedium,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.spacing.shadowSmall,
  },
  infoLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeights.semibold,
  },
  infoValue: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeights.bold,
  },
  dangerButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: theme.spacing.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    ...theme.spacing.shadowMedium,
    gap: 10,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.radiusLarge,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    ...theme.spacing.shadowLarge,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.spacing.radiusMedium,
    padding: 15,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButton: {
    borderRadius: theme.spacing.radiusMedium,
    overflow: 'hidden',
    ...theme.spacing.shadowMedium,
  },
  modalButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
  },
});