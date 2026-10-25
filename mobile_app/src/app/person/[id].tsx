import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import InfoRow from '../../components/InfoRow';
import StateView from '../../components/StateView';
import { colors, fonts, hairline, radius, spacing, typography } from '../../constants/theme';
import { deletePerson, getErrorMessage, getPerson } from '../../services/personService';
import { Person } from '../../types/person';
import { formatDate, formatPhone } from '../../utils/format';
import { notify } from '../../utils/notify';

// EKRAN 2 — Kişi Detayı (GET /api/persons/{id} ve DELETE /api/persons/{id})
export default function PersonDetailScreen() {
  // URL'deki [id] parçası: /person/5 → id = "5"
  const { id } = useLocalSearchParams<{ id: string }>();
  const personId = Number(id);
  const insets = useSafeAreaInsets();

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadPerson = useCallback(async () => {
    try {
      setError(null);
      const data = await getPerson(personId);
      setPerson(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [personId]);

  // Düzenleme ekranından geri dönüldüğünde güncel veriyi göstermek için
  // ekran her odaklandığında yeniden yüklenir.
  useFocusEffect(
    useCallback(() => {
      loadPerson();
    }, [loadPerson]),
  );

  // mailto: ve tel: adresleri cihazın e-posta ve telefon uygulamalarını açar.
  const openUrl = async (url: string, failMessage: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      notify('Açılamadı', failMessage);
    }
  };

  const handleDelete = async () => {
    setConfirmVisible(false);
    setDeleting(true);
    try {
      await deletePerson(personId);
      // Başarılıysa listeye dön; liste odaklanınca kendini yeniler.
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (err) {
      setDeleting(false);
      notify('Silinemedi', getErrorMessage(err));
    }
  };

  if (loading) {
    return <StateView loading />;
  }

  if (error || !person) {
    return (
      <StateView
        title="Kişi yüklenemedi"
        message={error ?? 'Kayıt bulunamadı.'}
        actionLabel="Tekrar dene"
        onAction={() => {
          setLoading(true);
          loadPerson();
        }}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Üst bölüm: porselen görsel alan, ona taşan büyük fotoğraf, ad-soyad ve departman */}
        <View style={styles.hero}>
          <View style={styles.visual}>
            <Text style={styles.recordNo}>Kayıt no. {String(person.id).padStart(2, '0')}</Text>
          </View>
          <View style={styles.photoRing}>
            <Avatar uri={person.photoUrl} name={person.fullName} size={148} />
          </View>
          <Text style={styles.name}>{person.fullName}</Text>
          <View style={styles.departmentRow}>
            <View style={styles.accent} />
            <Text style={styles.department}>{person.department}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Kişisel bilgiler</Text>
        <InfoRow label="Doğum yeri" value={person.birthPlace} />
        <InfoRow label="Doğum tarihi" value={formatDate(person.birthDate)} />

        <Text style={styles.sectionTitle}>İletişim</Text>
        <InfoRow
          label="E-posta"
          value={person.email}
          actionIcon="mail"
          onPress={() => openUrl(`mailto:${person.email}`, 'Cihazda e-posta uygulaması bulunamadı.')}
        />
        <InfoRow
          label="Telefon"
          value={formatPhone(person.phone)}
          actionIcon="phone"
          onPress={() => openUrl(`tel:${person.phone}`, 'Bu cihaz arama yapamıyor.')}
        />
      </ScrollView>

      {/* Altta sabit aksiyon çubuğu */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.deleteButton}>
          <Button label="Sil" icon="trash-2" variant="danger" loading={deleting} onPress={() => setConfirmVisible(true)} />
        </View>
        <View style={styles.editButton}>
          <Button
            label="Düzenle"
            icon="edit-2"
            disabled={deleting}
            onPress={() => router.push({ pathname: '/form', params: { id: String(person.id) } })}
          />
        </View>
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        title="Kişi silinsin mi?"
        message={`${person.fullName} kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        confirmLabel="Sil"
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bone,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  hero: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    borderBottomWidth: hairline,
    borderBottomColor: colors.ash,
  },
  // Fotoğrafın arkasındaki sıcak tonlu alan
  visual: {
    height: 152,
    borderRadius: radius.lg,
    backgroundColor: colors.porcelain,
    alignItems: 'flex-end',
    padding: spacing.lg,
  },
  // Fotoğraf alanın alt kenarına taşar; zemin renginde halka onu alandan ayırır
  photoRing: {
    alignSelf: 'flex-start',
    marginTop: -84,
    marginLeft: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 999,
    borderWidth: 5,
    borderColor: colors.bone,
  },
  recordNo: {
    ...typography.label,
  },
  name: {
    ...typography.title,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.8,
  },
  departmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  accent: {
    width: 16,
    height: 2,
    backgroundColor: colors.saffron,
  },
  department: {
    ...typography.note,
    fontSize: 18,
  },
  sectionTitle: {
    fontFamily: fonts.displayItalic,
    fontSize: 18,
    color: colors.plum,
    marginTop: spacing.xxl,
    marginBottom: spacing.xs,
  },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.bone,
    borderTopWidth: hairline,
    borderTopColor: colors.ash,
  },
  deleteButton: {
    flex: 1,
  },
  editButton: {
    flex: 2,
  },
});
