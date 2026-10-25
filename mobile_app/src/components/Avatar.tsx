import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../constants/theme';
import { getInitials } from '../utils/format';

type Props = {
  uri: string | null;
  name: string;
  size: number;
};

// Dairesel profil fotoğrafı. Fotoğraf yoksa veya yüklenemezse baş harfleri gösterir.
export default function Avatar({ uri, name, size }: Props) {
  // Yüklenemeyen adresi saklıyoruz. Adres değişirse (ör. formda yeni URL yazılınca)
  // eşleşme bozulur ve yeni fotoğraf tekrar denenir.
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const failed = uri !== null && uri === failedUri;

  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (!uri || failed) {
    return (
      <View style={[styles.fallback, circle]}>
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{getInitials(name) || '?'}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, circle]}
      onError={() => setFailedUri(uri)}
      accessibilityLabel={`${name} profil fotoğrafı`}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.porcelain,
  },
  fallback: {
    backgroundColor: colors.porcelain,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.display,
    color: colors.aubergine,
  },
});
