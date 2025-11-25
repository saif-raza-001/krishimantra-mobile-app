import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../theme';

export default function CustomTabBar({ state, descriptors, navigation }) {
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user);
  
  return (
    <View style={styles.tabBarWrapper}>
      {/* Floating Tab Bar with Rounded Edges */}
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Get icon name and label based on route
          let iconName, label, isProfile = false;
          if (route.name === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
            label = t('navigation.home');
          } else if (route.name === 'Crops') {
            iconName = isFocused ? 'sprout' : 'sprout-outline';
            label = t('navigation.crops');
          } else if (route.name === 'Tasks') {
            iconName = isFocused ? 'clipboard-list' : 'clipboard-list-outline';
            label = t('navigation.tasks');
          } else if (route.name === 'Profile') {
            iconName = isFocused ? 'account' : 'account-outline';
            label = t('navigation.profile');
            isProfile = true;
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              {isFocused ? (
                // SELECTED TAB: Raised Circle + Label Below
                <>
                  <View style={styles.raisedCircle}>
                    <View style={styles.circleInner}>
                      {isProfile && user?.profilePhoto ? (
                        // Show profile photo if Profile tab and photo exists
                        <Image 
                          source={{ uri: user.profilePhoto }} 
                          style={styles.profileImage}
                        />
                      ) : (
                        // Show icon for other tabs or if no photo
                        <MaterialCommunityIcons
                          name={iconName}
                          size={30}
                          color="#FFFFFF"
                        />
                      )}
                    </View>
                  </View>
                  {/* Label positioned at bottom */}
                  <View style={styles.labelContainer}>
                    <Text style={styles.labelActive}>{label}</Text>
                  </View>
                </>
              ) : (
                // UNSELECTED TAB: Normal Icon + Label (or small photo for Profile)
                <View style={styles.inactiveTab}>
                  {isProfile && user?.profilePhoto ? (
                    // Small profile photo when inactive
                    <Image 
                      source={{ uri: user.profilePhoto }} 
                      style={styles.profileImageInactive}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={iconName}
                      size={26}
                      color="#FFFFFF"
                    />
                  )}
                  <Text style={styles.label}>{label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingBottom: 20,
    pointerEvents: 'box-none',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#8D6E63', // Warm brown
    height: 85,
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 5,
    marginHorizontal: 10,
    ...theme.spacing.shadowLarge,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // Raised Circle Styles (Selected Tab)
  raisedCircle: {
    position: 'absolute',
    top: -30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.spacing.shadowLarge,
    elevation: 12,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  circleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  // Profile Photo Styles
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImageInactive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  // Label Container for Selected Tab (at bottom)
  labelContainer: {
    position: 'absolute',
    bottom: 8,
    alignItems: 'center',
  },
  
  // Inactive Tab Container
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Labels
  label: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: '600',
  },
  labelActive: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
