import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, hairline, spacing, typography } from '../constants/theme';

type Props = {
  label: string;
  value: string;
  onPress?: () => void; // Verilirse satır tıklanabilir olur (e-posta, telefon)
  actionIcon?: 'mail' | 'phone';
};

// Detay ekranındaki tek bilgi satırı: küçük etiket + değer, altında ince çizgi.
export default function InfoRow({ label, value, onPress, actionIcon }: Props) {
  const content = (
    <>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, onPress && styles.link]} selectable={!onPress}>
          {value}
        </Text>
      </View>
      {actionIcon ? (
        <View style={styles.iconBox}>
          <Feather name={actionIcon} size={16} color={colors.aubergine} />
        </View>
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="link"
      accessibilityLabel={`${label}: ${value}`}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: hairline,
    borderBottomColor: colors.ash,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  value: {
    ...typography.body,
    fontSize: 17,
  },
  link: {
    textDecorationLine: 'underline',
    textDecorationColor: colors.saffron,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: hairline,
    borderColor: colors.ash,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
