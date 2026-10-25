import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../constants/theme';
import Button from './Button';

type Props = {
  loading?: boolean;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

// Yükleniyor, hata ve boş liste durumları için ortak ekran parçası.
export default function StateView({ loading, title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.aubergine} />
      ) : (
        <>
          <View style={styles.accent} />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {actionLabel && onAction ? (
            <View style={styles.action}>
              <Button label={actionLabel} onPress={onAction} variant="secondary" />
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  accent: {
    width: 28,
    height: 3,
    backgroundColor: colors.saffron,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    fontSize: 26,
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  action: {
    marginTop: spacing.xl,
    alignSelf: 'flex-start',
  },
});
