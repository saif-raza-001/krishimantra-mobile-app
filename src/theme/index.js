import colors from './colors';
import spacing from './spacing';

export default {
  colors,
  spacing,
  
  // Quick access
  borderRadius: spacing.radiusMedium,
  cardRadius: spacing.radiusLarge,
  buttonRadius: spacing.radiusPill,
  
  // Typography
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
  
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
