import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useDispatch } from 'react-redux';
import { setLanguage } from '../redux/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { LANGUAGES } from '../constants/languages';
import theme from '../theme';

export default function LanguageSelectionScreen({ navigation }) {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState('en');
  const [scaleValues] = useState(
    LANGUAGES.reduce((acc, lang) => {
      acc[lang.code] = new Animated.Value(1);
      return acc;
    }, {})
  );

  const handleSelectLanguage = (code) => {
    setSelected(code);
    
    // Animate selection
    Animated.sequence([
      Animated.spring(scaleValues[code], {
        toValue: 1.05,
        useNativeDriver: true,
        friction: 3,
      }),
      Animated.spring(scaleValues[code], {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }),
    ]).start();
  };

  const handleContinue = () => {
    dispatch(setLanguage(selected));
    navigation.replace('Dashboard');
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>🌍</Text>
          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.subtitle}>भाषा चुनें • Select Language</Text>
        </View>

        {/* Language Grid */}
        <View style={styles.grid}>
          {LANGUAGES.map((lang) => (
            <Animated.View
              key={lang.code}
              style={[
                styles.cardWrapper,
                { transform: [{ scale: scaleValues[lang.code] }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.card,
                  selected === lang.code && styles.cardSelected,
                ]}
                onPress={() => handleSelectLanguage(lang.code)}
                activeOpacity={0.8}
              >
                {/* Watermark background */}
                <Text style={styles.watermark}>{lang.nativeName.charAt(0)}</Text>
                
                {/* Flag */}
                <Text style={styles.flag}>{lang.flag}</Text>
                
                {/* Greeting */}
                <Text style={styles.greeting}>{lang.greeting}</Text>
                
                {/* Language Name */}
                <Text style={styles.langName}>{lang.name}</Text>
                <Text style={styles.langNative}>{lang.nativeName}</Text>
                
                {/* Check mark if selected */}
                {selected === lang.code && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continue →</Text>
        </TouchableOpacity>

        {/* Skip Link */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleContinue}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  icon: { fontSize: 60, marginBottom: 15 },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  
  cardWrapper: { width: '48%', marginBottom: 15 },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    ...theme.spacing.shadowMedium,
  },
  
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  
  watermark: {
    position: 'absolute',
    fontSize: 100,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.03)',
    top: -10,
    right: -10,
  },
  
  flag: { fontSize: 32, marginBottom: 10 },
  greeting: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: theme.colors.primary,
    marginBottom: 5,
  },
  langName: { 
    fontSize: 14, 
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  langNative: { 
    fontSize: 12, 
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  continueButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
    ...theme.spacing.shadowLarge,
  },
  continueText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: theme.colors.primary,
  },
  
  skipButton: { alignItems: 'center', marginTop: 20 },
  skipText: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.8)',
    textDecorationLine: 'underline',
  },
});