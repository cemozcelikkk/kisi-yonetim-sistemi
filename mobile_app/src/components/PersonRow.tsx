import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../constants/theme';
import { Person } from '../types/person';
import Avatar from './Avatar';

type Props = {
  person: Person;
  onPress: () => void;
};

// Listedeki tek bir kişi satırı: solda fotoğraf, yanında ad-soyad ve departman.
export default function PersonRow({ person, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      android_ripple={{ color: colors.porcelain }}
      accessibilityRole="button"
      accessibilityLabel={`${person.fullName}, ${person.department}`}
    >
      <Avatar uri={person.photoUrl} name={person.fullName} size={52} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {person.fullName}
        </Text>
        <Text style={styles.department} numberOfLines={1}>
          {person.department}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.plum} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  pressed: {
    backgroundColor: colors.porcelain,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.name,
  },
  department: {
    ...typography.secondary,
  },
});
