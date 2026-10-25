// Tasarım token'ları: uygulamadaki tüm renk, boşluk, köşe ve yazı tipi değerleri
// tek bir yerden gelir. Bir rengi burada değiştirmek bütün ekranlara yansır.

export const colors = {
  bone: '#F3EEE7', // Soft Bone — ana arka plan
  porcelain: '#E8E0D6', // Warm Porcelain — ikincil yüzeyler (fotoğraf alanı, basılı satır)
  surface: '#FBF8F4', // Form alanlarının zemini (Bone'un bir ton açığı)
  aubergine: '#2B1830', // Deep Aubergine — başlıklar, ana aksiyonlar
  plum: '#5A465A', // Smoky Plum — ikincil metinler
  saffron: '#D98A1E', // Burnt Marigold / Saffron — küçük vurgular, aktif durumlar
  ash: '#CFC8C2', // Soft Ash — kenarlıklar ve ayırıcı çizgiler
  ink: '#1A1618', // Charcoal Ink — yüksek kontrastlı metin (form girdileri)
  white: '#FFFFFF', // Koyu zemin üzerindeki yazılar
  danger: '#9E3B36', // Hata mesajları ve silme aksiyonu
  dangerSoft: '#F2E2DD', // Hata kutusu zemini
  overlay: 'rgba(43, 24, 48, 0.42)', // Onay penceresinin arka perdesi
} as const;

// 4'ün katlarından oluşan boşluk ölçeği
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
} as const;

// Fraunces: karakterli editoryal serif (başlıklar, italik notlar)
// Inter: yüksek okunabilirlikli sans-serif (gövde metni)
export const fonts = {
  display: 'Fraunces_500Medium',
  displayItalic: 'Fraunces_400Regular_Italic',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const typography = {
  hero: { fontFamily: fonts.display, fontSize: 48, lineHeight: 52, letterSpacing: -1.2, color: colors.aubergine },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: colors.aubergine },
  // Başlıkların yanındaki italik, sakin açıklama satırları
  note: { fontFamily: fonts.displayItalic, fontSize: 17, lineHeight: 24, color: colors.plum },
  name: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.aubergine },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, color: colors.ink },
  secondary: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.plum },
  label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, color: colors.plum },
} as const;

// Yalnızca FAB ve onay penceresi gibi "üstte duran" öğelerde kullanılan hafif gölge
export const shadow = {
  soft: '0px 8px 24px rgba(43, 24, 48, 0.18)',
} as const;

// İnce ayırıcı çizgi kalınlığı
export const hairline = 1;
