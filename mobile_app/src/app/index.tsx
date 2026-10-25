import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import PersonRow from '../components/PersonRow';
import StateView from '../components/StateView';
import { colors, hairline, radius, shadow, spacing, typography } from '../constants/theme';
import { getErrorMessage, getPersons } from '../services/personService';
import { Person } from '../types/person';

// EKRAN 1 — Kişi Listesi (GET /api/persons)
export default function PersonListScreen() {
  const insets = useSafeAreaInsets();

  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPersons = useCallback(async () => {
    try {
      setError(null);
      const data = await getPersons(); // API cevabı gelene kadar burada beklenir
      setPersons(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Ekran her odaklandığında (ilk açılış + ekleme/düzenleme/silme sonrası geri dönüş)
  // liste API'den yeniden çekilir. Böylece liste hep güncel kalır.
  useFocusEffect(
    useCallback(() => {
      loadPersons();
    }, [loadPersons]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPersons();
  };

  const handleRetry = () => {
    setLoading(true);
    loadPersons();
  };

  // Liste boşken gösterilecek içerik: yükleniyor / hata / gerçekten boş
  const renderEmpty = () => {
    if (loading) {
      return <StateView loading />;
    }
    if (error) {
      return <StateView title="Bağlantı kurulamadı" message={error} actionLabel="Tekrar dene" onAction={handleRetry} />;
    }
    return (
      <StateView
        title="Henüz kimse yok"
        message="Rehberiniz boş. Sağ alttaki + butonuyla ilk kişiyi ekleyebilirsiniz."
      />
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={error ? [] : persons}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PersonRow person={item} onPress={() => router.push(`/person/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.overlineRow}>
              <View style={styles.accent} />
              <Text style={styles.overline}>Rehber</Text>
            </View>
            <Text style={styles.title}>Kişiler</Text>
            <Text style={styles.count}>
              {loading ? 'Yükleniyor…' : error ? 'Sunucuya bağlanılamadı' : `${persons.length} kişi kayıtlı, ada göre sıralı`}
            </Text>
          </View>
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 + insets.bottom }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Sağ altta sabit duran "yeni kişi" butonu (FAB) */}
      <Pressable
        onPress={() => router.push('/form')}
        style={({ pressed }) => [styles.fab, { bottom: insets.bottom + spacing.xl }, pressed && styles.fabPressed]}
        accessibilityRole="button"
        accessibilityLabel="Yeni kişi ekle"
      >
        <Feather name="plus" size={26} color={colors.saffron} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bone,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    marginBottom: spacing.sm,
    borderBottomWidth: hairline,
    borderBottomColor: colors.ash,
  },
  overlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  accent: {
    width: 20,
    height: 2,
    backgroundColor: colors.saffron,
  },
  overline: {
    ...typography.label,
  },
  title: {
    ...typography.hero,
  },
  count: {
    ...typography.note,
    marginTop: spacing.sm,
  },
  separator: {
    height: hairline,
    backgroundColor: colors.ash,
    // Çizgi fotoğrafın değil, metnin hizasından başlar (24 + 52 + 16)
    marginLeft: spacing.xl + 52 + spacing.lg,
    marginRight: spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.aubergine,
    alignItems: 'center',
    justifyContent: 'center',
    // FAB, listede gölgesi olan tek öğe: içeriğin üzerinde durduğunu belli eder.
    boxShadow: shadow.soft,
  },
  fabPressed: {
    opacity: 0.85,
  },
});
