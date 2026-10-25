import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, shadow, spacing, typography } from '../constants/theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Silme gibi geri alınamaz işlemlerden önce gösterilen onay penceresi.
// Hazır Alert.alert yerine Modal kullanıldı; böylece buton renkleri
// tasarım token'larıyla belirlenebiliyor ve web'de de çalışıyor.
export default function ConfirmDialog({ visible, title, message, confirmLabel, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityRole="alert">
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.button} accessibilityRole="button">
              <Text style={styles.cancelText}>Vazgeç</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={[styles.button, styles.confirmButton]}
              accessibilityRole="button"
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.bone,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    boxShadow: shadow.soft,
  },
  title: {
    ...typography.title,
    fontSize: 24,
    lineHeight: 30,
  },
  message: {
    ...typography.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: colors.danger,
  },
  cancelText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.aubergine,
  },
  confirmText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.white,
  },
});
