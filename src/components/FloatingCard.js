import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

export default function FloatingCard({ 
  children, 
  style, 
  gradient, 
  onPress, 
  pressable = false,
  shadow = 'medium',
  ...props 
}) {
  
  const getShadowStyle = () => {
    switch(shadow) {
      case 'small': return theme.spacing.shadowSmall;
      case 'medium': return theme.spacing.shadowMedium;
      case 'large': return theme.spacing.shadowLarge;
      case 'floating': return theme.spacing.shadowFloating;
      default: return theme.spacing.shadowMedium;
    }
  };

  const cardStyle = [
    styles.card,
    getShadowStyle(),
    style,
  ];

  // If gradient is provided, use LinearGradient
  if (gradient && gradient.length >= 2) {
    if (pressable || onPress) {
      return (
        <TouchableOpacity 
          style={cardStyle} 
          onPress={onPress}
          activeOpacity={0.8}
          {...props}
        >
          <LinearGradient
            colors={gradient}
            style={styles.gradientInner}
          >
            {children}
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={cardStyle} {...props}>
        <LinearGradient
          colors={gradient}
          style={styles.gradientInner}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  // If pressable/onPress, use TouchableOpacity
  if (pressable || onPress) {
    return (
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Default: simple View
  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.spacing.radiusLarge,
    overflow: 'hidden',
  },
  gradientInner: {
    // Remove fixed width/height - let content determine size
    flex: 1,
  },
});