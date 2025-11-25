import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { incrementPendingTasks, addRecentActivity } from '../../redux/slices/dashboardSlice';
import { addActivity } from '../../redux/slices/activitiesSlice';
import { useTranslation } from 'react-i18next';
import theme from '../../theme';

export default function AddActivityScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    type: 'Irrigation',
    priority: 'Medium',
  });

  const activityTypes = ['Irrigation', 'Fertilizer', 'Pesticide', 'Harvesting', 'Planting', 'Other'];
  const priorities = ['Low', 'Medium', 'High'];

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const getActivityIcon = (type) => {
    const icons = {
      'Irrigation': '💧',
      'Fertilizer': '🌿',
      'Pesticide': '🧪',
      'Harvesting': '🌾',
      'Planting': '🌱',
      'Other': '📌',
    };
    return icons[type] || '📌';
  };

  const handleSubmit = () => {
    if (!formData.title) {
      Alert.alert(t('common.error'), 'Please enter activity title');
      return;
    }

    const activityId = Date.now().toString();
    const newActivity = {
      id: activityId,
      title: formData.title,
      description: formData.description,
      scheduledDate: formData.scheduledDate,
      type: formData.type,
      priority: formData.priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    dispatch(addActivity(newActivity));
    dispatch(incrementPendingTasks());
    dispatch(addRecentActivity({
      id: activityId,
      title: formData.title,
      time: 'Just now',
      icon: getActivityIcon(formData.type),
      completed: false,
    }));
    
    Alert.alert(t('common.success'), 'Activity added successfully!');
    navigation.goBack();
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
            label={t('activities.activityTitle') + ' *'}
            icon="📋"
            value={formData.title}
            onChangeText={(text) => updateField('title', text)}
            placeholder={t('activities.exampleTitle')}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('activities.activityType')}</Text>
            <View style={styles.typeGrid}>
              {activityTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => updateField('type', type)}
                >
                  <Text style={styles.typeIcon}>{getActivityIcon(type)}</Text>
                  <Text
                    style={[
                      styles.typeText,
                      formData.type === type && styles.typeTextActive,
                    ]}
                  >
                    {t('activities.' + type.toLowerCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <FormInput
            label={t('activities.scheduledDate')}
            icon="📅"
            value={formData.scheduledDate}
            onChangeText={(text) => updateField('scheduledDate', text)}
            placeholder="YYYY-MM-DD"
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('activities.priority')}</Text>
            <View style={styles.row}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    formData.priority === priority && styles.priorityButtonActive,
                    formData.priority === priority && priority === 'High' && { backgroundColor: '#F44336' },
                    formData.priority === priority && priority === 'Medium' && { backgroundColor: theme.colors.accent },
                    formData.priority === priority && priority === 'Low' && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => updateField('priority', priority)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      formData.priority === priority && styles.priorityTextActive,
                    ]}
                  >
                    {t('activities.' + priority.toLowerCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('activities.description')}</Text>
            <TextInput
              style={styles.textArea}
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              placeholder={t('activities.addDetails')}
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>➕ {t('activities.addActivity')}</Text>
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
      <Text style={styles.inputIcon}>{icon}</Text>
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
  inputIcon: { marginRight: 10, fontSize: 20 },
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
  typeGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginTop: 5 
  },
  typeButton: { 
    width: '31%', 
    margin: '1%', 
    padding: 12, 
    borderRadius: theme.spacing.radiusMedium, 
    borderWidth: 1, 
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceWarm,
  },
  typeButtonActive: { 
    backgroundColor: theme.colors.background, 
    borderColor: theme.colors.primary, 
    borderWidth: 2 
  },
  typeIcon: { fontSize: 24, marginBottom: 5 },
  typeText: { 
    fontSize: theme.fontSizes.xs, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.textSecondary,
  },
  typeTextActive: { 
    color: theme.colors.primary,
  },
  row: { flexDirection: 'row' },
  priorityButton: { 
    flex: 1, 
    paddingVertical: 10, 
    marginHorizontal: 5, 
    borderRadius: theme.spacing.radiusSmall, 
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceWarm,
  },
  priorityButtonActive: { borderWidth: 0 },
  priorityText: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.textSecondary,
  },
  priorityTextActive: { color: '#fff' },
  submitButton: { 
    backgroundColor: theme.colors.primary, 
    padding: 18, 
    borderRadius: theme.spacing.radiusMedium, 
    alignItems: 'center', 
    marginTop: 20,
    ...theme.spacing.shadowMedium,
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold,
  },
});
