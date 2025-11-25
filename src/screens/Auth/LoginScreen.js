import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/authSlice';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, ADMIN_EMAIL, ADMIN_PASSWORD } from '../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../theme';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      // Check if admin login
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        // Admin login
        const adminUser = {
          id: 'admin',
          name: 'Admin',
          email: ADMIN_EMAIL,
          role: 'admin',
          profilePhoto: 'https://ui-avatars.com/api/?name=Admin&size=200&background=00704A&color=fff',
        };

        dispatch(setUser({
          user: adminUser,
          token: 'admin-token',
        }));

        Alert.alert('Welcome Admin!', 'You have full access to the system.', [
          { text: 'OK', onPress: () => navigation.replace('AdminDashboard') }
        ]);
        setLoading(false);
        return;
      }

      // Regular user login with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      let userData;
      if (userDoc.exists()) {
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          ...userDoc.data(),
        };
      } else {
        // Fallback if no Firestore doc
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.email.split('@')[0],
          profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.email.split('@')[0])}&size=200&background=00704A&color=fff`,
        };
      }

      dispatch(setUser({
        user: userData,
        token: await firebaseUser.getIdToken(),
      }));

      setLoading(false);
      navigation.replace('Dashboard');

    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.topGradient}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🌾</Text>
            </View>
            <Text style={styles.appName}>KrishiMantra</Text>
            <Text style={styles.tagline}>Smart Farming, Better Harvest</Text>
          </View>

          {/* Login Card */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtext}>Login to continue farming smarter</Text>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.loginGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Login</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signupLink}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.signupText}>
                Don't have an account? <Text style={styles.signupBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <FeatureItem icon="robot" text="AI Powered" />
            <FeatureItem icon="sprout" text="Crop Management" />
            <FeatureItem icon="chart-line" text="Analytics" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureBadge}>
      <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.screenPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    ...theme.spacing.shadowMedium,
  },
  logoIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: theme.fontSizes.xxxl,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: theme.fontSizes.sm,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 5,
    fontStyle: 'italic',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.radiusXLarge,
    padding: 25,
    ...theme.spacing.shadowLarge,
  },
  welcomeText: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 5,
  },
  welcomeSubtext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.spacing.radiusMedium,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  loginButton: {
    borderRadius: theme.spacing.radiusMedium,
    marginTop: 10,
    overflow: 'hidden',
    ...theme.spacing.shadowMedium,
  },
  loginGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  signupBold: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.bold,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeights.semibold,
  },
});