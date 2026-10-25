import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, radius, spacing } from '../constants/theme';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
};

// Uygulamadaki tüm butonlar. variant ile görünüm seçilir:
// primary  → Aubergine zemin, beyaz yazı (Kaydet, Düzenle)
// secondary→ çerçeveli, Aubergine yazı (Tekrar dene, Vazgeç)
// danger   → çerçeveli, kırmızımsı yazı (Sil)
export default function Button({ label, onPress, variant = 'primary', icon, loading, disabled }: Props) {
  const isPrimary = variant === 'primary';
  const textColor = isPrimary ? colors.white : variant === 'danger' ? colors.danger : colors.aubergine;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={18} color={textColor} /> : null}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.aubergine,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.aubergine,
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.ash,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
