import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../theme';

export default function CropDetailScreen({ route, navigation }) {
  const { crop } = route.params;

  const handleDelete = () => {
    Alert.alert(
      'Delete Crop',
      `Are you sure you want to delete ${crop.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Delete logic here
            navigation.goBack();
          }
        },
      ]
    );
  };

  const getDaysUntilHarvest = () => {
    if (!crop.harvestDate) return null;
    const today = new Date();
    const harvest = new Date(crop.harvestDate);
    const diff = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysUntilHarvest = getDaysUntilHarvest();

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.cropIconContainer}>
          <Text style={styles.cropIcon}>🌾</Text>
        </View>
        <Text style={styles.title}>{crop.name}</Text>
        {crop.variety && (
          <Text style={styles.variety}>{crop.variety}</Text>
        )}
      </LinearGradient>

      {/* Status Cards */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusCard, { backgroundColor: theme.colors.background }]}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color={theme.colors.primary} />
          <Text style={styles.statusLabel}>Health</Text>
          <Text style={[styles.statusValue, { color: theme.colors.primary }]}>
            {crop.health}
          </Text>
        </View>
        <View style={[styles.statusCard, { backgroundColor: '#E3F2FD' }]}>
          <MaterialCommunityIcons name="sprout" size={24} color={theme.colors.accentBlue} />
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={[styles.statusValue, { color: theme.colors.accentBlue }]}>
            {crop.status}
          </Text>
        </View>
      </View>

      {/* Harvest Countdown */}
      {daysUntilHarvest !== null && (
        <View style={[
          styles.harvestCard,
          { backgroundColor: daysUntilHarvest <= 7 ? '#FFF3E0' : theme.colors.background }
        ]}>
          <MaterialCommunityIcons 
            name={daysUntilHarvest <= 7 ? "alert-circle" : "calendar-star"} 
            size={28} 
            color={daysUntilHarvest <= 7 ? theme.colors.accent : theme.colors.primary}
          />
          <View style={styles.harvestInfo}>
            <Text style={styles.harvestLabel}>Harvest Date</Text>
            <Text style={[
              styles.harvestValue,
              { color: daysUntilHarvest <= 7 ? '#E65100' : theme.colors.primaryDark }
            ]}>
              {daysUntilHarvest > 0 
                ? `${daysUntilHarvest} days remaining`
                : daysUntilHarvest === 0
                  ? 'Harvest TODAY!'
                  : 'Harvest overdue'
              }
            </Text>
            <Text style={styles.harvestDate}>
              {new Date(crop.harvestDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>
      )}

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Basic Information</Text>
        
        <InfoRow 
          icon="texture-box" 
          label="Area" 
          value={`${crop.area} ${crop.areaUnit || 'acres'}`} 
        />
        <InfoRow 
          icon="calendar-check" 
          label="Planted Date" 
          value={new Date(crop.plantedDate).toLocaleDateString()} 
        />
        {crop.expectedYield && (
          <InfoRow 
            icon="weight-kilogram" 
            label="Expected Yield" 
            value={`${crop.expectedYield} kg`} 
          />
        )}
        {crop.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>📝 Notes</Text>
            <Text style={styles.notesText}>{crop.notes}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.navigate('AddCrop', { crop })}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#fff" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabel}>
      <MaterialCommunityIcons name={icon} size={18} color={theme.colors.textSecondary} />
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={styles.value}>{value}</Text>
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
  cropIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cropIcon: { fontSize: 40 },
  title: { 
    fontSize: theme.fontSizes.xxxl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff' 
  },
  variety: { 
    fontSize: theme.fontSizes.lg, 
    color: 'rgba(255,255,255,0.9)', 
    marginTop: 5 
  },
  
  statusContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginTop: -30,
    gap: 10,
  },
  statusCard: {
    flex: 1,
    padding: 15,
    borderRadius: theme.spacing.radiusLarge,
    alignItems: 'center',
    ...theme.spacing.shadowMedium,
  },
  statusLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  statusValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    marginTop: 4,
  },

  harvestCard: {
    flexDirection: 'row',
    margin: 15,
    padding: 20,
    borderRadius: theme.spacing.radiusLarge,
    alignItems: 'center',
    ...theme.spacing.shadowSmall,
  },
  harvestInfo: {
    marginLeft: 15,
    flex: 1,
  },
  harvestLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  harvestValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    marginBottom: 4,
  },
  harvestDate: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },

  section: { 
    backgroundColor: theme.colors.surfaceWarm, 
    margin: 15, 
    padding: 20, 
    borderRadius: theme.spacing.radiusLarge,
    ...theme.spacing.shadowSmall,
  },
  sectionTitle: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary,
    marginBottom: 15 
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.borderLight,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary,
  },
  value: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.textPrimary,
  },
  notesContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  notesLabel: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  buttonRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 15,
    gap: 10,
  },
  button: { 
    flex: 1, 
    flexDirection: 'row',
    gap: 8,
    padding: 16, 
    borderRadius: theme.spacing.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.spacing.shadowMedium,
  },
  editButton: { 
    backgroundColor: theme.colors.accentBlue,
  },
  deleteButton: { 
    backgroundColor: '#F44336',
  },
  buttonText: { 
    color: '#fff', 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.bold,
  },
});