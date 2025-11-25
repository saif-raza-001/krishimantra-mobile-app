import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import theme from '../theme';

// Your OpenWeatherMap API Key
const WEATHER_API_KEY = 'd50542fda857a67c2d97eef12c042e1e';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

export default function WeatherScreen() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('📍 Location permission denied, using demo data');
        loadDemoWeather('Delhi');
        return;
      }

      // Get user location
      const userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;
      
      // Get city name
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const cityName = address.city || address.district || 'Your Location';
      
      setLocation(cityName);
      
      // Try to fetch real weather data
      await fetchWeatherData(latitude, longitude, cityName);
      
    } catch (error) {
      console.error('❌ Error loading weather:', error);
      // Fallback to demo data
      loadDemoWeather('Delhi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWeatherData = async (lat, lon, cityName) => {
    try {
      console.log(`🌤️ Fetching weather for: ${cityName} (${lat}, ${lon})`);
      
      // Fetch current weather
      const currentUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
      const currentResponse = await fetch(currentUrl);
      const currentData = await currentResponse.json();

      console.log('📡 Weather API Response:', currentData.cod);

      // Check if API returned error
      if (currentData.cod && currentData.cod !== 200) {
        console.log('⚠️ Weather API error:', currentData.message);
        throw new Error('API Error');
      }

      // Validate response structure
      if (!currentData.main || !currentData.weather || !currentData.weather[0]) {
        console.log('⚠️ Invalid weather data structure');
        throw new Error('Invalid data');
      }

      // Fetch 5-day forecast
      const forecastUrl = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();

      // Process data
      const weatherData = {
        location: cityName,
        current: {
          temp: Math.round(currentData.main.temp),
          condition: currentData.weather[0].main,
          description: currentData.weather[0].description,
          icon: getWeatherEmoji(currentData.weather[0].main),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6),
          rainfall: currentData.rain?.['1h'] || 0,
        },
        forecast: forecastData.list ? processForecast(forecastData.list) : getDemoForecast(),
      };

      setWeather(weatherData);
      setLocation(cityName);
      console.log('✅ Real weather data loaded successfully');
      
    } catch (error) {
      console.error('❌ Weather API Error:', error.message);
      throw error;
    }
  };

  const loadDemoWeather = (cityName) => {
    console.log('📊 Loading demo weather data for:', cityName);
    
    const demoWeather = {
      location: cityName,
      current: {
        temp: 28,
        condition: 'Clear',
        description: 'clear sky',
        icon: '☀️',
        humidity: 65,
        windSpeed: 12,
        rainfall: 0,
      },
      forecast: getDemoForecast(),
    };

    setWeather(demoWeather);
    setLocation(cityName);
  };

  const getDemoForecast = () => {
    return [
      { day: 'Today', temp: 28, condition: 'Clear', icon: '☀️', rain: 10 },
      { day: 'Tomorrow', temp: 30, condition: 'Clear', icon: '☀️', rain: 5 },
      { day: 'Friday', temp: 27, condition: 'Rain', icon: '🌧️', rain: 80 },
      { day: 'Saturday', temp: 26, condition: 'Clouds', icon: '☁️', rain: 40 },
      { day: 'Sunday', temp: 29, condition: 'Clear', icon: '☀️', rain: 5 },
    ];
  };

  const processForecast = (forecastList) => {
    const days = {};
    const dayNames = ['Today', 'Tomorrow'];
    
    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();
      
      if (!days[dayKey]) {
        days[dayKey] = {
          date: date,
          temps: [],
          conditions: [],
          rain: 0,
        };
      }
      
      days[dayKey].temps.push(item.main.temp);
      days[dayKey].conditions.push(item.weather[0].main);
      days[dayKey].rain += (item.pop || 0) * 100;
    });

    return Object.values(days).slice(0, 5).map((day, index) => {
      const avgTemp = Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length);
      const mainCondition = day.conditions[0];
      const dayName = index < 2 ? dayNames[index] : day.date.toLocaleDateString('en-US', { weekday: 'long' });
      
      return {
        day: dayName,
        temp: avgTemp,
        condition: mainCondition,
        icon: getWeatherEmoji(mainCondition),
        rain: Math.round(day.rain / day.conditions.length),
      };
    });
  };

  const getWeatherEmoji = (condition) => {
    const emojiMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Smoke': '🌫️',
      'Haze': '🌫️',
      'Dust': '🌫️',
      'Fog': '🌫️',
    };
    return emojiMap[condition] || '⛅';
  };

  const translateCondition = (condition) => {
    const conditionMap = {
      'Clear': t('weather.sunny'),
      'Clouds': t('weather.cloudy'),
      'Rain': t('weather.rainy'),
      'Partly Cloudy': t('weather.partlyCloudy'),
    };
    return conditionMap[condition] || condition;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWeather();
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('weather.loading')}</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.loading}>
        <MaterialCommunityIcons name="weather-cloudy-alert" size={80} color={theme.colors.textSecondary} />
        <Text style={styles.errorText}>{t('weather.errorLoading')}</Text>
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
        <Text style={styles.title}>🌤️ {t('weather.title')}</Text>
        <Text style={styles.subtitle}>{location || t('weather.yourLocation')}</Text>
      </LinearGradient>

      <View style={styles.currentWeather}>
        <Text style={styles.weatherIcon}>{weather.current.icon}</Text>
        <Text style={styles.temperature}>{weather.current.temp}°C</Text>
        <Text style={styles.condition}>{translateCondition(weather.current.condition)}</Text>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>💧 {t('weather.humidity')}</Text>
            <Text style={styles.detailValue}>{weather.current.humidity}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>💨 {t('weather.wind')}</Text>
            <Text style={styles.detailValue}>{weather.current.windSpeed} km/h</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>🌧️ {t('weather.rainfall')}</Text>
            <Text style={styles.detailValue}>{weather.current.rainfall} mm</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('weather.forecast')}</Text>
        {weather.forecast.map((day, index) => (
          <View key={index} style={styles.forecastCard}>
            <Text style={styles.forecastDay}>
              {day.day === 'Today' ? t('weather.today') : day.day === 'Tomorrow' ? t('weather.tomorrow') : day.day}
            </Text>
            <Text style={styles.forecastIcon}>{day.icon}</Text>
            <Text style={styles.forecastTemp}>{day.temp}°C</Text>
            <Text style={styles.forecastCondition}>{translateCondition(day.condition)}</Text>
            <View style={styles.rainChance}>
              <Text style={styles.rainText}>💧 {day.rain}%</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌾 {t('weather.recommendations')}</Text>
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationItem}>
            <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.recommendationText}>{t('weather.goodForIrrigation')}</Text>
          </View>
          <View style={styles.recommendationItem}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.accent} />
            <Text style={styles.recommendationText}>
              {t('weather.rainExpected', { day: weather.forecast[2]?.day || 'Friday' })}
            </Text>
          </View>
          <View style={styles.recommendationItem}>
            <MaterialCommunityIcons name="weather-sunny" size={20} color={theme.colors.primary} />
            <Text style={styles.recommendationText}>{t('weather.sunnyWeekend')}</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

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
  errorText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeights.bold,
    marginTop: 20,
    textAlign: 'center',
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
  currentWeather: { 
    backgroundColor: theme.colors.surfaceWarm, 
    margin: 20, 
    padding: 30, 
    borderRadius: theme.spacing.radiusLarge, 
    alignItems: 'center', 
    ...theme.spacing.shadowMedium,
  },
  weatherIcon: { fontSize: 80 },
  temperature: { 
    fontSize: 48, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    marginTop: 10 
  },
  condition: { 
    fontSize: theme.fontSizes.lg, 
    color: theme.colors.textSecondary, 
    marginTop: 5 
  },
  detailsRow: { 
    flexDirection: 'row', 
    marginTop: 20, 
    width: '100%', 
    justifyContent: 'space-around' 
  },
  detailItem: { alignItems: 'center' },
  detailLabel: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary,
  },
  detailValue: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    marginTop: 5 
  },
  section: { 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    marginBottom: 15, 
    color: theme.colors.textPrimary,
  },
  forecastCard: { 
    backgroundColor: theme.colors.surfaceWarm, 
    padding: 15, 
    borderRadius: theme.spacing.radiusMedium, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    ...theme.spacing.shadowSmall,
  },
  forecastDay: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    width: 80 
  },
  forecastIcon: { fontSize: 32 },
  forecastTemp: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: theme.fontWeights.bold, 
    color: theme.colors.textPrimary, 
    width: 50 
  },
  forecastCondition: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary, 
    flex: 1 
  },
  rainChance: { 
    backgroundColor: '#E3F2FD', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: theme.spacing.radiusSmall,
  },
  rainText: { 
    fontSize: theme.fontSizes.xs, 
    color: theme.colors.accentBlue, 
    fontWeight: theme.fontWeights.bold,
  },
  recommendationCard: { 
    backgroundColor: theme.colors.surfaceWarm, 
    padding: 20, 
    borderRadius: theme.spacing.radiusMedium, 
    ...theme.spacing.shadowSmall,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  recommendationText: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textPrimary, 
    lineHeight: 20,
    flex: 1,
  },
});
