import { PersonInput } from '../types/person';

// Formdaki her alan TextInput'tan geldiği için string tutulur.
export type PersonFormValues = { [K in keyof PersonInput]: string };

// Hangi alanda hangi hata var: { email: "Geçerli bir e-posta giriniz." }
export type FormErrors = Partial<Record<keyof PersonFormValues, string>>;

// ad.soyad@alan.com: @ öncesi harf/rakam ve . _ % + -, alan adı parçaları noktayla ayrılır,
// uzantı en az 2 harf. Türkçe karakter (ş, ç...) ve "a@b.c" gibi adresler reddedilir.
// Backend'deki Person.cs içinde aynı ifade kullanılır.
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s()-]{7,20}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Backend'deki doğrulama kurallarının istemci tarafındaki karşılığı.
// Kullanıcı hatayı sunucuya gitmeden, anında görür.
export function validatePerson(values: PersonFormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Ad soyad en az 2 karakter olmalıdır.';
  }

  if (!values.department.trim()) {
    errors.department = 'Departman zorunludur.';
  }

  if (values.photoUrl.trim() && !/^https?:\/\/\S+$/.test(values.photoUrl.trim())) {
    errors.photoUrl = 'Adres http:// veya https:// ile başlamalıdır.';
  }

  if (!values.birthPlace.trim()) {
    errors.birthPlace = 'Doğum yeri zorunludur.';
  }

  const dateError = validateBirthDate(values.birthDate.trim());
  if (dateError) {
    errors.birthDate = dateError;
  }

  if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Geçerli bir e-posta adresi giriniz.';
  }

  if (!PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = 'Geçerli bir telefon numarası giriniz.';
  }

  return errors;
}

function validateBirthDate(value: string): string | undefined {
  if (!DATE_REGEX.test(value)) {
    return 'Tarihi YYYY-AA-GG biçiminde giriniz (ör. 1994-04-12).';
  }

  // "2023-02-30" gibi takvimde olmayan tarihleri yakalamak için:
  // Date nesnesi 30 Şubat'ı 2 Mart'a çevirir, parçalar artık eşleşmez.
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return 'Geçerli bir tarih giriniz.';
  }
  if (date > new Date()) {
    return 'Doğum tarihi gelecekte olamaz.';
  }
  return undefined;
}
