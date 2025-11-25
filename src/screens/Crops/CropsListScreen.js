import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { deleteCrop } from '../../redux/slices/cropsSlice';
import { decrementTotalCrops } from '../../redux/slices/dashboardSlice';
import { addNotification } from '../../redux/slices/notificationsSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../../theme';

export default function CropsListScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const crops = useSelector((state) => state.crops.crops);

  const handleDeleteCrop = (crop) => {
    Alert.alert(
      t('common.delete') + ' ' + t('crops.title'),
      `Are you sure you want to delete ${crop.name}?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            dispatch(deleteCrop(crop.id));
            dispatch(decrementTotalCrops());
            
            dispatch(addNotification({
              id: Date.now().toString(),
              title: '🗑️ Crop Deleted',
              message: `${crop.name} has been removed from your farm.`,
              time: new Date().toISOString(),
              read: false,
              type: 'info',
            }));

            Alert.alert(t('common.success'), `${crop.name} deleted successfully`);
          },
        },
      ]
    );
  };

  const getDaysUntilHarvest = (harvestDate) => {
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diff = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const renderCrop = ({ item }) => {
    const daysUntilHarvest = getDaysUntilHarvest(item.harvestDate);
    
    return (
      <View style={styles.cropCard}>
        <View style={styles.cropHeader}>
          <View style={styles.cropIconContainer}>
            <Text style={styles.cropIcon}>🌾</Text>
          </View>
          <View style={styles.cropInfo}>
            <Text style={styles.cropName}>{item.name}</Text>
            {item.variety && (
              <Text style={styles.cropVariety}>{item.variety}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCrop(item)}
          >
            <MaterialCommunityIcons name="delete-outline" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.cropDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="texture-box" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              {item.area} {t('crops.' + item.areaUnit)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar-check" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              {t('crops.plantedDate')}: {new Date(item.plantedDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar-star" size={16} color={theme.colors.accent} />
            <Text style={[styles.detailText, { color: theme.colors.accent, fontWeight: theme.fontWeights.semibold }]}>
              {t('crops.harvestDate')}: {new Date(item.harvestDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Harvest Countdown */}
        <View style={[
          styles.harvestBanner,
          { backgroundColor: daysUntilHarvest <= 7 ? '#FFF3E0' : theme.colors.background }
        ]}>
          <MaterialCommunityIcons 
            name={daysUntilHarvest <= 7 ? "alert-circle" : "calendar-clock"} 
            size={18} 
            color={daysUntilHarvest <= 7 ? theme.colors.accent : theme.colors.primary} 
          />
          <Text style={[
            styles.harvestText,
            { color: daysUntilHarvest <= 7 ? theme.colors.accent : theme.colors.textPrimary }
          ]}>
            {daysUntilHarvest > 0 
              ? `${daysUntilHarvest} days until harvest`
              : daysUntilHarvest === 0
                ? 'Harvest today!'
                : 'Overdue for harvest'
            }
          </Text>
        </View>

        {/* Health Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[styles.statusText, { color: theme.colors.success }]}>
              {t('crops.health')}: {item.health}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.statusText, { color: theme.colors.primary }]}>
              {t('crops.status')}: {t('crops.' + item.status.toLowerCase())}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🌾</Text>
      <Text style={styles.emptyTitle}>No Crops Yet</Text>
      <Text style={styles.emptyText}>Add your first crop to start tracking!</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCrop')}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.addButtonGradient}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.addButtonText}>{t('crops.addCrop')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t('crops.title')}</Text>
        <Text style={styles.headerSubtitle}>{crops.length} {t('crops.title').toLowerCase()}</Text>
      </LinearGradient>

      <FlatList
        data={crops}
        renderItem={renderCrop}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState}
      />

      {crops.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddCrop')}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.fabGradient}
          >
            <MaterialCommunityIcons name="plus" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  header: { 
    padding: 30, 
    paddingTop: 60, 
    borderBottomLeftRadius: theme.spacing.radiusXLarge,
    borderBottomRightRadius: theme.spacing.radiusXLarge,
  },
  headerTitle: { 
    fontSize: theme.fontSizes.xxl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: { 
    fontSize: theme.fontSizes.md, 
    color: 'rgba(255,255,255,0.9)',
  },
  list: { 
    padding: theme.spacing.screenPadding,
    paddingBottom: 100,
  },
  cropCard: {
    backgroundColor: theme.colors.surfaceWarm,
    borderRadius: theme.spacing.radiusLarge,
    padding: theme.spacing.md,
    marginBottom: 15,
    ...theme.spacing.shadowMedium,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cropIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cropIcon: { fontSize: 28 },
  cropInfo: { flex: 1 },
  cropName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  cropVariety: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  cropDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  harvestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: theme.spacing.radiusMedium,
    marginBottom: 12,
    gap: 8,
  },
  harvestText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.spacing.radiusSmall,
    alignItems: 'center',
  },
  statusText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: 30,
  },
  addButton: {
    borderRadius: theme.spacing.radiusMedium,
    overflow: 'hidden',
    ...theme.spacing.shadowMedium,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  addButtonText: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...theme.spacing.shadowLarge,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
