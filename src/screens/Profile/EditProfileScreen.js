import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/slices/authSlice';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../../theme';

// 🌟 CLOUDINARY CONFIGURATION
const CLOUDINARY_CLOUD_NAME = 'ddcqoehw1';
const CLOUDINARY_UPLOAD_PRESET = 'profile_photos';

export default function EditProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    farmLocation: user?.farmLocation || '',
    farmSize: user?.farmSize?.toString() || '',
    farmSizeUnit: user?.farmSizeUnit || 'acres',
  });
  
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || 'https://via.placeholder.com/150');
  const [localImageUri, setLocalImageUri] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const choosePhotoSource = () => {
    Alert.alert(
      t('editProfile.changePhoto'),
      t('editProfile.chooseSource'),
      [
        {
          text: t('editProfile.camera'),
          onPress: () => takePhoto(),
        },
        {
          text: t('editProfile.gallery'),
          onPress: () => pickImage(),
        },
        {
          text: t('editProfile.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(t('editProfile.permissionRequired'), t('editProfile.cameraPermission'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(t('editProfile.permissionRequired'), t('editProfile.galleryPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
      setProfilePhoto(result.assets[0].uri);
    }
  };

  // 🌟 NEW: Upload image to Cloudinary (FREE & WORKS!)
  const uploadImageToCloudinary = async (uri) => {
    try {
      setUploadingPhoto(true);
      console.log('📤 Uploading image to Cloudinary...');
      
      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: `profile_${user.id}_${Date.now()}.jpg`,
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'krishimantra/profiles');
      
      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }
      
      console.log('✅ Image uploaded successfully');
      console.log('🔗 Cloudinary URL:', data.secure_url);
      
      setUploadingPhoto(false);
      return data.secure_url; // Return the Cloudinary URL
      
    } catch (error) {
      console.error('❌ Error uploading to Cloudinary:', error);
      setUploadingPhoto(false);
      
      // Return a nice avatar as fallback
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&size=200&background=00704A&color=fff&bold=true`;
      return avatarUrl;
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert(t('editProfile.error'), t('editProfile.nameEmailRequired'));
      return;
    }

    setSaving(true);

    try {
      let finalPhotoUrl = profilePhoto;
      
      // 🌟 If user selected a new local image, upload to Cloudinary
      if (localImageUri) {
        finalPhotoUrl = await uploadImageToCloudinary(localImageUri);
      }

      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        farmLocation: formData.farmLocation,
        farmSize: parseFloat(formData.farmSize) || 0,
        farmSizeUnit: formData.farmSizeUnit,
        profilePhoto: finalPhotoUrl,
      };

      // ✅ Save to Firestore (cloud database)
      if (user?.id && user?.id !== 'admin') {
        await setDoc(doc(db, 'users', user.id), {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          farmLocation: updatedUser.farmLocation,
          farmSize: updatedUser.farmSize,
          farmSizeUnit: updatedUser.farmSizeUnit,
          profilePhoto: updatedUser.profilePhoto,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        console.log('✅ Profile saved to Firestore');
      }

      // ✅ Save to Redux & AsyncStorage
      dispatch(updateUser(updatedUser));
      setProfilePhoto(finalPhotoUrl);
      setLocalImageUri(null);
      
      setSaving(false);
      Alert.alert(
        '✅ ' + t('editProfile.success'), 
        'Your profile has been updated with your photo!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setSaving(false);
      Alert.alert(t('editProfile.error'), t('editProfile.saveFailed'));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.header}
        >
          <TouchableOpacity style={styles.photoContainer} onPress={choosePhotoSource}>
            <Image source={{ uri: profilePhoto }} style={styles.photo} />
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="camera" size={20} color={theme.colors.primary} />
            </View>
            {localImageUri && (
              <View style={styles.newPhotoBadge}>
                <Text style={styles.newPhotoText}>NEW</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {localImageUri ? '📸 New photo selected' : t('editProfile.tapToChange')}
          </Text>
          <Text style={styles.headerSubtext}>
            {localImageUri ? 'Will be uploaded to cloud' : t('editProfile.cameraOrGallery')}
          </Text>
        </LinearGradient>

        <View style={styles.form}>
          <FormInput
            label={t('editProfile.fullName')}
            icon="👤"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            placeholder={t('editProfile.yourName')}
          />

          <FormInput
            label={t('editProfile.email')}
            icon="✉️"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder={t('editProfile.yourEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormInput
            label={t('editProfile.phone')}
            icon="📱"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            placeholder={t('editProfile.phoneNumber')}
            keyboardType="phone-pad"
          />

          <FormInput
            label={t('editProfile.farmLocation')}
            icon="📍"
            value={formData.farmLocation}
            onChangeText={(text) => updateField('farmLocation', text)}
            placeholder={t('editProfile.cityState')}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>🌾 {t('editProfile.farmSize')}</Text>
            <View style={styles.farmSizeRow}>
              <View style={styles.farmSizeInput}>
                <TextInput
                  style={styles.input}
                  value={formData.farmSize}
                  onChangeText={(text) => updateField('farmSize', text)}
                  placeholder={t('editProfile.enterSize')}
                  keyboardType="decimal-pad"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
              <View style={styles.unitButtons}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    formData.farmSizeUnit === 'acres' && styles.unitButtonActive,
                  ]}
                  onPress={() => updateField('farmSizeUnit', 'acres')}
                >
                  <Text
                    style={[
                      styles.unitText,
                      formData.farmSizeUnit === 'acres' && styles.unitTextActive,
                    ]}
                  >
                    {t('editProfile.acres')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    formData.farmSizeUnit === 'hectares' && styles.unitButtonActive,
                  ]}
                  onPress={() => updateField('farmSizeUnit', 'hectares')}
                >
                  <Text
                    style={[
                      styles.unitText,
                      formData.farmSizeUnit === 'hectares' && styles.unitTextActive,
                    ]}
                  >
                    {t('editProfile.hectares')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={saving || uploadingPhoto}
          >
            {saving || uploadingPhoto ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.savingText}>
                  {uploadingPhoto ? 'Uploading photo...' : 'Saving...'}
                </Text>
              </View>
            ) : (
              <>
                <MaterialCommunityIcons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>{t('editProfile.saveToCloud')}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
            disabled={saving || uploadingPhoto}
          >
            <Text style={styles.cancelButtonText}>{t('editProfile.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const FormInput = ({ label, icon, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{icon} {label}</Text>
    <TextInput 
      style={styles.input} 
      placeholderTextColor={theme.colors.textMuted}
      {...props} 
    />
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  header: { 
    padding: 30, 
    paddingTop: 60, 
    alignItems: 'center',
    borderBottomLeftRadius: theme.spacing.radiusXLarge,
    borderBottomRightRadius: theme.spacing.radiusXLarge,
  },
  photoContainer: { 
    position: 'relative', 
    marginBottom: 15 
  },
  photo: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 4, 
    borderColor: '#fff',
    ...theme.spacing.shadowLarge,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.spacing.shadowMedium,
  },
  newPhotoBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  newPhotoText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerText: { 
    fontSize: theme.fontSizes.md, 
    color: '#fff',
    fontWeight: theme.fontWeights.semibold,
  },
  headerSubtext: { 
    fontSize: theme.fontSizes.sm, 
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  form: { 
    padding: theme.spacing.screenPadding,
  },
  inputContainer: { 
    marginBottom: theme.spacing.lg,
  },
  label: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.textPrimary, 
    marginBottom: 8 
  },
  input: {
    backgroundColor: theme.colors.surfaceWarm,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: theme.spacing.radiusMedium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  farmSizeRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  farmSizeInput: { 
    flex: 1, 
    marginRight: 10 
  },
  unitButtons: { 
    flexDirection: 'row' 
  },
  unitButton: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceWarm,
    marginLeft: 5,
    borderRadius: theme.spacing.radiusMedium,
  },
  unitButtonActive: { 
    backgroundColor: theme.colors.primary, 
    borderColor: theme.colors.primary,
  },
  unitText: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.textSecondary,
  },
  unitTextActive: { 
    color: '#fff' 
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.spacing.radiusMedium,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    ...theme.spacing.shadowMedium,
  },
  saveButtonText: { 
    color: '#fff', 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold,
    marginLeft: 8,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    color: '#fff',
    fontSize: theme.fontSizes.md,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: theme.colors.surfaceWarm,
    paddingVertical: 14,
    borderRadius: theme.spacing.radiusMedium,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: { 
    color: theme.colors.textSecondary, 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.semibold,
  },
});
