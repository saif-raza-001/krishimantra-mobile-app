import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { incrementTotalCrops } from '../../redux/slices/dashboardSlice';
import { addCrop } from '../../redux/slices/cropsSlice';
import { addNotification } from '../../redux/slices/notificationsSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import notificationService from '../../services/notificationService';
import theme from '../../theme';

export default function AddCropScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    area: '',
    areaUnit: 'acres',
    plantedDate: new Date().toISOString().split('T')[0],
    harvestDate: '',
    expectedYield: '',
    notes: '',
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.area) {
      Alert.alert(t('common.error'), 'Please fill in crop name and area');
      return;
    }

    if (!formData.harvestDate) {
      Alert.alert(t('common.error'), 'Please enter expected harvest date');
      return;
    }

    const harvestDate = new Date(formData.harvestDate);
    const today = new Date();
    if (harvestDate <= today) {
      Alert.alert(t('common.error'), 'Harvest date must be in the future');
      return;
    }

    const newCrop = {
      id: Date.now().toString(),
      ...formData,
      health: t('crops.healthy'),
      status: t('crops.growing'),
      createdAt: new Date().toISOString(),
    };

    dispatch(addCrop(newCrop));
    dispatch(incrementTotalCrops());

    const reminderDate = new Date(harvestDate);
    reminderDate.setDate(reminderDate.getDate() - 3);

    if (reminderDate > today) {
      const notificationId = await notificationService.scheduleNotification(
        '🌾 Harvest Reminder',
        `${formData.name} will be ready for harvest in 3 days!`,
        reminderDate,
        { type: 'harvest_reminder', cropId: newCrop.id, cropName: formData.name }
      );

      console.log('📅 Harvest reminder scheduled:', notificationId);
    }

    dispatch(addNotification({
      id: Date.now().toString(),
      title: '🌱 New Crop Added',
      message: `${formData.name} has been added to your farm.`,
      time: new Date().toISOString(),
      read: false,
      type: 'success',
    }));

    Alert.alert(
      t('common.success'), 
      `${formData.name} added successfully! You'll receive a reminder 3 days before harvest.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
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
        <View style={styles.form}>
          <FormInput
            label={t('crops.cropName') + ' *'}
            icon="sprout"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            placeholder="e.g., Rice, Wheat, Cotton"
          />

          <FormInput
            label={t('crops.variety')}
            icon="leaf"
            value={formData.variety}
            onChangeText={(text) => updateField('variety', text)}
            placeholder="e.g., Basmati, IR64"
          />

          <FormInput
            label={t('crops.area') + ' *'}
            icon="texture-box"
            value={formData.area}
            onChangeText={(text) => updateField('area', text)}
            placeholder="Area size"
            keyboardType="numeric"
          />

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.unitButton, formData.areaUnit === 'acres' && styles.unitButtonActive]}
              onPress={() => updateField('areaUnit', 'acres')}
            >
              <Text style={[styles.unitText, formData.areaUnit === 'acres' && styles.unitTextActive]}>
                {t('crops.acres')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, formData.areaUnit === 'hectares' && styles.unitButtonActive]}
              onPress={() => updateField('areaUnit', 'hectares')}
            >
              <Text style={[styles.unitText, formData.areaUnit === 'hectares' && styles.unitTextActive]}>
                {t('crops.hectares')}
              </Text>
            </TouchableOpacity>
          </View>

          <FormInput
            label={t('crops.plantedDate')}
            icon="calendar-check"
            value={formData.plantedDate}
            onChangeText={(text) => updateField('plantedDate', text)}
            placeholder="YYYY-MM-DD"
          />

          <FormInput
            label={t('crops.harvestDate') + ' *'}
            icon="calendar-star"
            value={formData.harvestDate}
            onChangeText={(text) => updateField('harvestDate', text)}
            placeholder="YYYY-MM-DD"
          />
          <Text style={styles.hint}>
            💡 {t('crops.harvestReminder')}
          </Text>

          <FormInput
            label={t('crops.expectedYield')}
            icon="weight-kilogram"
            value={formData.expectedYield}
            onChangeText={(text) => updateField('expectedYield', text)}
            placeholder="Estimated yield in kg"
            keyboardType="numeric"
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('crops.notes')}</Text>
            <TextInput
              style={styles.textArea}
              value={formData.notes}
              onChangeText={(text) => updateField('notes', text)}
              placeholder={t('crops.addNotes')}
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>{t('crops.addCrop')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const FormInput = ({ label, icon, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <MaterialCommunityIcons name={icon} size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
      <TextInput 
        style={styles.input} 
        placeholderTextColor={theme.colors.textMuted}
        {...props} 
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.radiusMedium,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surfaceWarm,
  },
  inputIcon: { marginRight: 10 },
  input: { 
    flex: 1, 
    paddingVertical: 12, 
    fontSize: theme.fontSizes.md, 
    color: theme.colors.textPrimary,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.radiusMedium,
    padding: 12,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceWarm,
    minHeight: 100,
  },
  hint: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    marginTop: -15,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  row: { 
    flexDirection: 'row', 
    marginBottom: theme.spacing.lg,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: theme.spacing.radiusSmall,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceWarm,
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
  unitTextActive: { color: '#fff' },
  submitButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    gap: 8,
    padding: 18,
    borderRadius: theme.spacing.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    ...theme.spacing.shadowMedium,
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold,
  },
});
