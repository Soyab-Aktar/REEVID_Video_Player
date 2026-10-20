export const Colors = {
  // Cohesive, modern dark theme palette
  appBarBackground: '#17151D',
  background: '#0F0E13',
  surface: '#1A1822',
  surfaceVariant: '#25222E',
  surfaceHighlight: '#322E3E',
  
  // Brand accents
  primary: '#D0BCFF',
  primaryContainer: 'rgba(208, 188, 255, 0.14)',
  primaryBrand: '#6750A4',
  
  // Text hierarchy
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.78)',
  textTertiary: 'rgba(255, 255, 255, 0.50)',
  textDisabled: 'rgba(255, 255, 255, 0.32)',
  
  // Interactive accents
  accent: '#80CBC4',
  accentDark: 'rgba(255, 255, 255, 0.08)',
  
  // Neutrals & Overlays
  black: '#000000',
  blackTransparent: 'rgba(0, 0, 0, 0.82)',
  blackOverlay: 'rgba(0, 0, 0, 0.65)',
  white: '#FFFFFF',
  whiteTransparent: 'rgba(255, 255, 255, 0.20)',
  whiteControl: 'rgba(255, 255, 255, 0.90)',
  
  // Chrome elements
  searchBarBg: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.09)',
  divider: 'rgba(255, 255, 255, 0.06)',
  
  // Feedback
  error: '#FF6B81',
  errorContainer: 'rgba(255, 107, 129, 0.16)',
  success: '#81C784',
  warning: '#FFB74D',
  
  // Contextual accents
  pinnedGold: '#FBC02D',
  folderIcon: '#C8B6FF',
  folderIconBg: 'rgba(200, 182, 255, 0.10)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const Typography = {
  titleLarge: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    letterSpacing: 0.1,
  },
  bodyMedium: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.whiteControl,
  },
};
