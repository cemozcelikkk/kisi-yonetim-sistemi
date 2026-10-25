import { Platform } from 'react-native';

// Backend adresi .env dosyasındaki EXPO_PUBLIC_API_URL değişkeninden okunur.
// Tanımlı değilse platforma göre varsayılan kullanılır:
// - Android emülatörü bilgisayarın localhost'una 10.0.2.2 üzerinden ulaşır.
// - iOS simülatörü ve web, bilgisayarla aynı makinede olduğu için localhost kullanır.
// Fiziksel telefonda bilgisayarın yerel IP adresi .env'ye yazılmalıdır (bkz. README).
const defaultUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5080' : 'http://localhost:5080';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || defaultUrl;
