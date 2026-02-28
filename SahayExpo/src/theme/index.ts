import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from './colors';
export { Colors } from './colors';
export { FontFamily, FontSize, LineHeight } from './typography';
export { Spacing, BorderRadius } from './spacing';

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
