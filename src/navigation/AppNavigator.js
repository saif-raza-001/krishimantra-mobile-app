import theme from '../theme';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';

// Components
import FloatingChatButton from '../components/FloatingChatButton';
import CustomTabBar from '../components/CustomTabBar';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

// Language Selection Screen
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';

// Main Screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import DiseaseDetectionScreen from '../screens/DiseaseDetectionScreen';
import WeatherScreen from '../screens/WeatherScreen';
import MarketTrendsScreen from '../screens/MarketTrendsScreen';
import CropsListScreen from '../screens/Crops/CropsListScreen';
import CropDetailScreen from '../screens/Crops/CropDetailScreen';
import AddCropScreen from '../screens/Crops/AddCropScreen';
import ActivitiesScreen from '../screens/Activities/ActivitiesScreen';
import AddActivityScreen from '../screens/Activities/AddActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnalysisScreen from '../screens/AnalysisScreen';

// Chat Screen (Modal)
import ChatScreen from '../screens/Chat/ChatScreen';

// Soil Analysis Screens
import SoilAnalysisScreen from '../screens/Analysis/SoilAnalysisScreen';
import QuickSoilAnalysisScreen from '../screens/Analysis/QuickSoilAnalysisScreen';
import AccurateSoilAnalysisScreen from '../screens/Analysis/AccurateSoilAnalysisScreen';

// Profile Screens
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import AboutScreen from '../screens/Profile/AboutScreen';
import NotificationSettingsScreen from '../screens/Profile/NotificationSettingsScreen';
import LanguageSettingsScreen from '../screens/Profile/LanguageSettingsScreen';

// Notifications Screen
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';

// Admin Screen
import AdminDashboard from '../screens/Admin/AdminDashboard';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator with Custom Tab Bar
function MainTabs() {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Crops" component={CropsListScreen} />
        <Tab.Screen name="Tasks" component={ActivitiesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {/* Floating Chat Button - Centered */}
      <View style={styles.floatingButtonContainer}>
        <FloatingChatButton onPress={() => setChatVisible(true)} />
      </View>

      {/* Chat Modal */}
      <ChatScreen 
        visible={chatVisible} 
        onClose={() => setChatVisible(false)} 
      />
    </View>
  );
}

// Main Stack Navigator
export default function AppNavigator() {
  // ✅ Get authentication state from Redux
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  // ✅ Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ✅ Determine initial route based on authentication
  let initialRoute = 'Login';
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      initialRoute = 'AdminDashboard';
    } else {
      initialRoute = 'Dashboard';
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary }, 
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen} 
          options={{ headerShown: false }} 
        />
        
        {/* Language Selection Screen */}
        <Stack.Screen 
          name="LanguageSelection" 
          component={LanguageSelectionScreen} 
          options={{ headerShown: false }} 
        />
        
        {/* Admin Dashboard */}
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboard} 
          options={{ headerShown: false }} 
        />
        
        {/* Main App with Bottom Tabs */}
        <Stack.Screen 
          name="Dashboard" 
          component={MainTabs} 
          options={{ headerShown: false }} 
        />
        
        {/* Analysis Screens */}
        <Stack.Screen 
          name="Analysis" 
          component={AnalysisScreen} 
          options={{ title: 'AI Analysis' }} 
        />
        <Stack.Screen 
          name="DiseaseDetection" 
          component={DiseaseDetectionScreen} 
          options={{ title: 'Disease Detection' }} 
        />
        
        {/* Soil Analysis Screens */}
        <Stack.Screen 
          name="SoilAnalysis" 
          component={SoilAnalysisScreen} 
          options={{ title: 'Soil Analysis' }} 
        />
        <Stack.Screen 
          name="QuickSoilAnalysis" 
          component={QuickSoilAnalysisScreen} 
          options={{ title: 'Quick Analysis' }} 
        />
        <Stack.Screen 
          name="AccurateSoilAnalysis" 
          component={AccurateSoilAnalysisScreen} 
          options={{ title: 'Accurate Analysis' }} 
        />
        
        {/* Profile Screens */}
        <Stack.Screen 
          name="EditProfile" 
          component={EditProfileScreen} 
          options={{ title: 'Edit Profile' }} 
        />
        <Stack.Screen 
          name="About" 
          component={AboutScreen} 
          options={{ title: 'About KrishiMantra' }} 
        />
        <Stack.Screen 
          name="NotificationSettings" 
          component={NotificationSettingsScreen} 
          options={{ title: 'Notifications' }} 
        />
        <Stack.Screen 
          name="LanguageSettings" 
          component={LanguageSettingsScreen} 
          options={{ title: 'Language' }} 
        />
        
        {/* Notifications Screen */}
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen} 
          options={{ title: 'Notifications' }} 
        />
        
        {/* Other Feature Screens */}
        <Stack.Screen 
          name="Weather" 
          component={WeatherScreen} 
          options={{ title: 'Weather Forecast' }} 
        />
        <Stack.Screen 
          name="MarketTrends" 
          component={MarketTrendsScreen} 
          options={{ title: 'Market Prices' }} 
        />
        
        {/* Crop Screens */}
        <Stack.Screen 
          name="CropDetail" 
          component={CropDetailScreen} 
          options={{ title: 'Crop Details' }} 
        />
        <Stack.Screen 
          name="AddCrop" 
          component={AddCropScreen} 
          options={{ title: 'Add New Crop' }} 
        />
        
        {/* Activity Screens */}
        <Stack.Screen 
          name="AddActivity" 
          component={AddActivityScreen} 
          options={{ title: 'Add Activity' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
});
