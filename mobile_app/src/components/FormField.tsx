import { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, fonts, radius, spacing, typography } from '../constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

// Etiketli metin kutusu. Odaklanınca çerçeve koyulaşır, hata varsa altında mesaj çıkar.
// TextInput'un tüm özellikleri (value, onChangeText, keyboardType...) aynen aktarılır.
export default function FormField({ label, error, hint, required, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        {...inputProps}
        onFocus={(event) => {
          setFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          inputProps.onBlur?.(event);
        }}
        placeholderTextColor={colors.plum}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        style={[styles.input, focused && styles.inputFocused, error ? styles.inputError : null]}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
  },
  required: {
    color: colors.saffron,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ash,
    borderRadius: radius.sm,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  inputFocused: {
    borderColor: colors.aubergine,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.danger,
  },
  hint: {
    ...typography.secondary,
    fontSize: 13,
  },
});
