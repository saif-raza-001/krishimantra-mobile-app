import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Easing, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../theme';

export default function FloatingChatButton({ onPress }) {
  const floatValue = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  
  // Inner ripple animations (inside the orb)
  const innerRipple1 = useRef(new Animated.Value(1)).current;
  const innerRipple1Opacity = useRef(new Animated.Value(0.6)).current;
  
  const innerRipple2 = useRef(new Animated.Value(1)).current;
  const innerRipple2Opacity = useRef(new Animated.Value(0.6)).current;
  
  // Outer soft rings (thin, non-blocking)
  const outerRing1 = useRef(new Animated.Value(1)).current;
  const outerRing1Opacity = useRef(new Animated.Value(0.3)).current;
  
  const outerRing2 = useRef(new Animated.Value(1)).current;
  const outerRing2Opacity = useRef(new Animated.Value(0.3)).current;
  
  // Center glow pulse
  const glowPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: -6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Center glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Inner Ripple 1 (inside orb)
    Animated.loop(
      Animated.parallel([
        Animated.timing(innerRipple1, {
          toValue: 1.4,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(innerRipple1Opacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Inner Ripple 2 (inside orb, delayed)
    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(innerRipple2, {
            toValue: 1.4,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(innerRipple2Opacity, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1000);

    // Outer Ring 1 (thin, outside)
    Animated.loop(
      Animated.parallel([
        Animated.timing(outerRing1, {
          toValue: 1.6,
          duration: 3000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(outerRing1Opacity, {
          toValue: 0,
          duration: 3000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Outer Ring 2 (thin, outside, delayed)
    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(outerRing2, {
            toValue: 1.6,
            duration: 3000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(outerRing2Opacity, {
            toValue: 0,
            duration: 3000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1500);
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.85,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    if (onPress) onPress();
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          transform: [
            { translateY: floatValue },
            { scale: pressScale }
          ] 
        }
      ]}
    >
      {/* Outer Soft Ring 1 - THIN & NON-BLOCKING */}
      <Animated.View 
        pointerEvents="none"
        style={[
          styles.outerRing,
          {
            transform: [{ scale: outerRing1 }],
            opacity: outerRing1Opacity,
          }
        ]}
      />

      {/* Outer Soft Ring 2 - THIN & NON-BLOCKING */}
      <Animated.View 
        pointerEvents="none"
        style={[
          styles.outerRing,
          {
            transform: [{ scale: outerRing2 }],
            opacity: outerRing2Opacity,
          }
        ]}
      />

      {/* Center Touchable Orb */}
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        {/* Pulsing Glow Behind */}
        <Animated.View 
          style={[
            styles.glowOuter,
            { transform: [{ scale: glowPulse }] }
          ]}
        >
          <View style={styles.glow} />
        </Animated.View>

        {/* Main Gradient Orb */}
        <View style={styles.orb}>
          <LinearGradient
            colors={[theme.colors.primaryLight, theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.orbGradient}
          >
            {/* INNER Ripple 1 - INSIDE THE ORB */}
            <Animated.View 
              style={[
                styles.innerRipple,
                {
                  transform: [{ scale: innerRipple1 }],
                  opacity: innerRipple1Opacity,
                }
              ]}
            />

            {/* INNER Ripple 2 - INSIDE THE ORB */}
            <Animated.View 
              style={[
                styles.innerRipple,
                {
                  transform: [{ scale: innerRipple2 }],
                  opacity: innerRipple2Opacity,
                }
              ]}
            />

            {/* Glossy top shine */}
            <View style={styles.shine}>
              <LinearGradient
                colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.2)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.shineGradient}
              />
            </View>

            {/* AI Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons 
                name="chat-processing" 
                size={28} 
                color="#FFFFFF" 
              />
            </View>

            {/* Sparkle indicator */}
            <View style={styles.sparkle}>
              <MaterialCommunityIcons name="shimmer" size={10} color="#FFD700" />
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 75,
    alignSelf: 'center',
    zIndex: 999,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Outer Soft Rings - THIN & NON-BLOCKING
  outerRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5, // THIN border
    borderColor: theme.colors.primary,
  },
  
  // Touchable area - ONLY the orb itself
  touchable: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Outer glow behind orb
  glowOuter: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  glow: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: theme.colors.primary,
    opacity: 0.15,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  
  // Main orb
  orb: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // INNER Ripples - CONTAINED inside the orb
  innerRipple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '60%',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: 'hidden',
  },
  shineGradient: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  sparkle: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 5,
  },
});