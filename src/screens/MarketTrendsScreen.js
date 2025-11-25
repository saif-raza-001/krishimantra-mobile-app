import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../theme';

const screenWidth = Dimensions.get('window').width;

// Real Agmarknet-style API endpoint (for demonstration)
// In production, you would use actual Agmarknet API or your backend
const MARKET_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

export default function MarketTrendsScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trends, setTrends] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      // Try to fetch real data
      const realData = await fetchRealMarketData();
      
      if (realData && realData.length > 0) {
        setTrends(realData);
        setChartData(generateChartData(realData[0]));
      } else {
        // Fallback to realistic mock data
        loadRealisticMockData();
      }
    } catch (error) {
      console.error('❌ Market API Error:', error);
      // Load realistic mock data as fallback
      loadRealisticMockData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRealMarketData = async () => {
    try {
      // Simulating real market data fetch
      // In production, replace with actual API call
      
      // For now, return null to use realistic mock data
      // You can integrate with:
      // 1. Agmarknet API: https://agmarknet.gov.in/
      // 2. Your own backend that aggregates market data
      // 3. Government data portals
      
      return null;
      
    } catch (error) {
      console.error('Market data fetch error:', error);
      return null;
    }
  };

  const loadRealisticMockData = () => {
    // Generate realistic market data based on actual Indian market trends
    const now = new Date();
    const baseDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    const mockTrends = [
      { 
        crop: t('market.wheat'), 
        market: 'Delhi', 
        state: 'Delhi', 
        price: generateRealisticPrice(2000, 2200),
        change: generateChange(),
        priceHistory: generatePriceHistory(2000, 2200, 30)
      },
      { 
        crop: t('market.rice'), 
        market: 'Mumbai', 
        state: 'Maharashtra', 
        price: generateRealisticPrice(3000, 3400),
        change: generateChange(),
        priceHistory: generatePriceHistory(3000, 3400, 30)
      },
      { 
        crop: t('market.cotton'), 
        market: 'Ahmedabad', 
        state: 'Gujarat', 
        price: generateRealisticPrice(5500, 6100),
        change: generateChange(),
        priceHistory: generatePriceHistory(5500, 6100, 30)
      },
      { 
        crop: t('market.sugarcane'), 
        market: 'Lucknow', 
        state: 'UP', 
        price: generateRealisticPrice(250, 310),
        change: generateChange(),
        priceHistory: generatePriceHistory(250, 310, 30)
      },
      { 
        crop: t('market.potato'), 
        market: 'Agra', 
        state: 'UP', 
        price: generateRealisticPrice(1100, 1300),
        change: generateChange(),
        priceHistory: generatePriceHistory(1100, 1300, 30)
      },
    ];
    
    setTrends(mockTrends);
    setChartData(generateChartData(mockTrends[0]));
  };

  const generateRealisticPrice = (min, max) => {
    return Math.round(min + Math.random() * (max - min));
  };

  const generateChange = () => {
    return (Math.random() * 20 - 10).toFixed(1); // -10% to +10%
  };

  const generatePriceHistory = (min, max, days) => {
    const history = [];
    let currentPrice = (min + max) / 2;
    
    for (let i = 0; i < days; i++) {
      // Simulate price fluctuation
      const change = (Math.random() - 0.5) * (max - min) * 0.1;
      currentPrice = Math.max(min, Math.min(max, currentPrice + change));
      history.push(Math.round(currentPrice));
    }
    
    return history;
  };

  const generateChartData = (cropData) => {
    if (!cropData || !cropData.priceHistory) return null;

    const history = cropData.priceHistory;
    const weeklyData = [];
    
    // Group into weeks (take every 7th day)
    for (let i = 0; i < 4; i++) {
      const weekIndex = i * 7;
      if (weekIndex < history.length) {
        weeklyData.push(history[weekIndex]);
      }
    }

    return {
      labels: [
        `${t('common.week')} 1`, 
        `${t('common.week')} 2`, 
        `${t('common.week')} 3`, 
        `${t('common.week')} 4`
      ],
      datasets: [{ 
        data: weeklyData.length > 0 ? weeklyData : [2000, 2100, 2050, 2150], 
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, 
        strokeWidth: 3 
      }],
      legend: [`${cropData.crop} (₹${t('market.perQuintal')})`]
    };
  };

  const chartConfig = {
    backgroundColor: theme.colors.surfaceWarm,
    backgroundGradientFrom: theme.colors.surfaceWarm,
    backgroundGradientTo: theme.colors.surfaceWarm,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.textPrimary,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: theme.colors.primary }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMarketData();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('market.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.title}>💰 {t('market.title')}</Text>
        <Text style={styles.subtitle}>{t('market.priceHistory')}</Text>
      </LinearGradient>

      {chartData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 {trends[0]?.crop} {t('market.price')} {t('common.trend')}</Text>
          <View style={styles.chartCard}>
            <LineChart 
              data={chartData} 
              width={screenWidth - 60} 
              height={220} 
              chartConfig={chartConfig} 
              bezier 
              style={styles.chart} 
            />
            <View style={styles.insight}>
              <View style={styles.insightItem}>
                <MaterialCommunityIcons name="chart-line" size={18} color={theme.colors.textSecondary} />
                <Text style={styles.insightText}>
                  {t('market.average')}: ₹{Math.round(chartData.datasets[0].data.reduce((a,b) => a+b, 0) / chartData.datasets[0].data.length)}{t('market.perQuintal')}
                </Text>
              </View>
              <View style={styles.insightItem}>
                <MaterialCommunityIcons 
                  name={trends[0]?.change >= 0 ? "trending-up" : "trending-down"} 
                  size={18} 
                  color={trends[0]?.change >= 0 ? theme.colors.primary : theme.colors.error} 
                />
                <Text style={[
                  styles.insightText, 
                  { color: trends[0]?.change >= 0 ? theme.colors.primary : theme.colors.error }
                ]}>
                  {trends[0]?.change >= 0 ? '+' : ''}{trends[0]?.change}% {t('market.thisMonth')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💵 {t('market.todayPrices')}</Text>
        {trends.map((item, index) => (
          <View key={index} style={styles.priceCard}>
            <View style={styles.cropInfo}>
              <View style={styles.cropIconContainer}>
                <Text style={styles.cropEmoji}>{getCropEmoji(item.crop)}</Text>
              </View>
              <View>
                <Text style={styles.cropName}>{item.crop}</Text>
                <Text style={styles.market}>
                  {item.market}, {item.state}
                </Text>
              </View>
            </View>
            <View style={styles.priceSection}>
              <Text style={styles.price}>₹{item.price}</Text>
              <View style={[
                styles.changeBadge,
                { backgroundColor: item.change >= 0 ? theme.colors.background : '#FFEBEE' }
              ]}>
                <MaterialCommunityIcons 
                  name={item.change >= 0 ? "arrow-up" : "arrow-down"} 
                  size={14} 
                  color={item.change >= 0 ? theme.colors.primary : '#F44336'} 
                />
                <Text style={[
                  styles.change, 
                  { color: item.change >= 0 ? theme.colors.primary : '#F44336' }
                ]}>
                  {Math.abs(item.change)}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={24} color={theme.colors.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>💡 {t('common.note')}</Text>
          <Text style={styles.infoText}>
            {t('market.dataSource')}
          </Text>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const getCropEmoji = (cropName) => {
  const emojiMap = {
    'Wheat': '🌾',
    'गेहूं': '🌾',
    'Rice': '🌾',
    'चावल': '🌾',
    'Cotton': '🌼',
    'कपास': '🌼',
    'Sugarcane': '🎋',
    'गन्ना': '🎋',
    'Potato': '🥔',
    'आलू': '🥔',
  };
  return emojiMap[cropName] || '🌾';
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  loading: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 30,
  },
  loadingText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginTop: 15,
  },
  header: { 
    padding: 30, 
    paddingTop: 60,
    borderBottomLeftRadius: theme.spacing.radiusXLarge,
    borderBottomRightRadius: theme.spacing.radiusXLarge,
  },
  title: { 
    fontSize: theme.fontSizes.xxl, 
    fontWeight: theme.fontWeights.bold, 
    color: '#fff' 
  },
  subtitle: { 
    fontSize: theme.fontSizes.sm, 
    color: 'rgba(255,255,255,0.9)', 
    marginTop: 5 
  },
  section: { 
    paddingHorizontal: 20, 
    marginTop: 20 
  },
  sectionTitle: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    marginBottom: 15, 
    color: theme.colors.textPrimary,
  },
  chartCard: { 
    backgroundColor: theme.colors.surfaceWarm, 
    padding: 15, 
    borderRadius: theme.spacing.radiusLarge, 
    ...theme.spacing.shadowMedium,
  },
  chart: { 
    borderRadius: theme.spacing.radiusMedium,
  },
  insight: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 15, 
    paddingTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.borderLight,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightText: { 
    fontSize: theme.fontSizes.sm, 
    fontWeight: theme.fontWeights.semibold, 
    color: theme.colors.textSecondary,
  },
  priceCard: { 
    backgroundColor: theme.colors.surfaceWarm, 
    padding: 15, 
    borderRadius: theme.spacing.radiusMedium, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    ...theme.spacing.shadowSmall,
  },
  cropInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cropIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropEmoji: {
    fontSize: 24,
  },
  cropName: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary,
  },
  market: { 
    fontSize: theme.fontSizes.xs, 
    color: theme.colors.textSecondary, 
    marginTop: 3 
  },
  priceSection: { 
    alignItems: 'flex-end' 
  },
  price: { 
    fontSize: theme.fontSizes.xl, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.primary,
    marginBottom: 6,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.spacing.radiusSmall,
    gap: 4,
  },
  change: { 
    fontSize: theme.fontSizes.xs, 
    fontWeight: theme.fontWeights.bold,
  },
  infoCard: {
    backgroundColor: theme.colors.surfaceWarm,
    margin: 20,
    padding: 15,
    borderRadius: theme.spacing.radiusMedium,
    flexDirection: 'row',
    gap: 12,
    ...theme.spacing.shadowSmall,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
