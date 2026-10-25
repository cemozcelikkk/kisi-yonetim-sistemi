import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '../components/Avatar';
import Button from '../components/Button';
import FormField from '../components/FormField';
import StateView from '../components/StateView';
import { colors, fonts, hairline, radius, spacing, typography } from '../constants/theme';
import { createPerson, getErrorMessage, getPerson, updatePerson } from '../services/personService';
import { PersonInput } from '../types/person';
import { notify } from '../utils/notify';
import { FormErrors, PersonFormValues, validatePerson } from '../utils/validation';

const EMPTY_FORM: PersonFormValues = {
  fullName: '',
  department: '',
  photoUrl: '',
  birthPlace: '',
  birthDate: '',
  email: '',
  phone: '',
};

// EKRAN 3 — Kişi Ekleme / Düzenleme
// URL'de id varsa (/form?id=5) düzenleme modu → PUT, yoksa ekleme modu → POST.
export default function PersonFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const insets = useSafeAreaInsets();

  const [values, setValues] = useState<PersonFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(isEdit); // Düzenlemede önce mevcut veri yüklenir
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Düzenleme modunda kişinin mevcut bilgilerini forma doldur.
  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const loadPerson = async () => {
      try {
        const person = await getPerson(Number(id));
        setValues({
          fullName: person.fullName,
          department: person.department,
          photoUrl: person.photoUrl ?? '',
          birthPlace: person.birthPlace,
          birthDate: person.birthDate,
          email: person.email,
          phone: person.phone,
        });
      } catch (err) {
        setLoadError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadPerson();
  }, [id, isEdit]);

  // Bir alan değişince değeri güncelle; o alandaki ve formun altındaki eski hatayı temizle.
  const handleChange = (field: keyof PersonFormValues, text: string) => {
    setValues((prev) => ({ ...prev, [field]: text }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    // 1) İstemci tarafı doğrulama
    const validationErrors = validatePerson(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setSubmitError('Lütfen işaretli alanları düzeltin.');
      return;
    }

    // 2) Form değerlerini API'nin beklediği JSON gövdesine çevir
    const payload: PersonInput = {
      fullName: values.fullName.trim(),
      department: values.department.trim(),
      photoUrl: values.photoUrl.trim() || null,
      birthPlace: values.birthPlace.trim(),
      birthDate: values.birthDate.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    };

    // 3) İsteği gönder: düzenlemede PUT, eklemede POST
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isEdit) {
        await updatePerson(Number(id), payload);
        notify('Kaydedildi', 'Değişiklikler başarıyla güncellendi.');
        router.back(); // Detay ekranına dön (detay kendini yeniler)
      } else {
        const created = await createPerson(payload);
        notify('Kişi eklendi', `${created.fullName} rehbere eklendi.`);
        router.replace(`/person/${created.id}`); // Yeni kişinin detayına geç
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <StateView loading />;
  }

  if (loadError) {
    return <StateView title="Kişi yüklenemedi" message={loadError} actionLabel="Geri dön" onAction={() => router.back()} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.overline}>{isEdit ? `Kayıt no. ${String(id).padStart(2, '0')}` : 'Yeni kayıt'}</Text>
          <Text style={styles.title}>{isEdit ? 'Kişiyi düzenle' : 'Yeni kişi'}</Text>
        </View>

        {/* Fotoğraf URL'si yazıldıkça anlık önizleme */}
        <View style={styles.preview}>
          <Avatar uri={values.photoUrl.trim() || null} name={values.fullName} size={72} />
          <Text style={styles.previewText}>
            {values.fullName.trim() || 'Ad soyad'}
            {'\n'}
            <Text style={styles.previewSub}>{values.department.trim() || 'Departman'}</Text>
          </Text>
        </View>

        <View style={styles.fields}>
          <FormField
            label="Ad soyad"
            required
            value={values.fullName}
            onChangeText={(text) => handleChange('fullName', text)}
            error={errors.fullName}
            placeholder="Ahmet Yılmaz"
            autoCapitalize="words"
            autoComplete="name"
          />
          <FormField
            label="Departman"
            required
            value={values.department}
            onChangeText={(text) => handleChange('department', text)}
            error={errors.department}
            placeholder="Yazılım Geliştirme"
          />
          <FormField
            label="Fotoğraf adresi"
            value={values.photoUrl}
            onChangeText={(text) => handleChange('photoUrl', text)}
            error={errors.photoUrl}
            hint="İsteğe bağlı. Boş bırakılırsa baş harfler gösterilir."
            placeholder="https://…"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <FormField
            label="Doğum yeri"
            required
            value={values.birthPlace}
            onChangeText={(text) => handleChange('birthPlace', text)}
            error={errors.birthPlace}
            placeholder="Adana"
            autoCapitalize="words"
          />
          <FormField
            label="Doğum tarihi"
            required
            value={values.birthDate}
            onChangeText={(text) => handleChange('birthDate', text)}
            error={errors.birthDate}
            hint="YYYY-AA-GG biçiminde, ör. 1994-04-12"
            placeholder="1994-04-12"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          <FormField
            label="E-posta"
            required
            value={values.email}
            onChangeText={(text) => handleChange('email', text)}
            error={errors.email}
            placeholder="ad.soyad@sirket.com"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
          />
          <FormField
            label="Telefon"
            required
            value={values.phone}
            onChangeText={(text) => handleChange('phone', text)}
            error={errors.phone}
            placeholder="+905550123456"
            autoComplete="tel"
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {submitError ? (
          <Text style={styles.submitError} accessibilityLiveRegion="assertive">
            {submitError}
          </Text>
        ) : null}
        <Button
          label={isEdit ? 'Değişiklikleri kaydet' : 'Kişiyi kaydet'}
          icon="check"
          loading={submitting}
          onPress={handleSubmit}
        />
      </View>
    </KeyboardAvoidingView>
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
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  overline: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.title,
    fontSize: 34,
    lineHeight: 40,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    borderTopWidth: hairline,
    borderBottomWidth: hairline,
    borderColor: colors.ash,
  },
  previewText: {
    ...typography.name,
    flex: 1,
  },
  previewSub: {
    ...typography.secondary,
  },
  fields: {
    gap: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.bone,
    borderTopWidth: hairline,
    borderTopColor: colors.ash,
  },
  submitError: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
});
