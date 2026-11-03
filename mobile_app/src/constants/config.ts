import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Backend adresi şu sırayla belirlenir:
// 1. .env / eas.json içindeki EXPO_PUBLIC_API_URL (APK derlemesi bunu kullanır).
// 2. Expo Go ile çalışırken Metro'nun bağlı olduğu bilgisayar IP'si (ör. 192.168.1.11:8081 → :5080).
//    Telefon da emülatör de Metro'ya bu IP ile bağlandığı için ağ değişse bile ayar gerekmez.
// 3. Platform varsayılanı: Android emülatörü bilgisayara 10.0.2.2 ile, iOS simülatörü ve web localhost ile ulaşır.
const BACKEND_PORT = 5080;

const fallbackUrl =
  Platform.OS === 'android' ? `http://10.0.2.2:${BACKEND_PORT}` : `http://localhost:${BACKEND_PORT}`;

function getDevServerUrl(): string | undefined {
  // Web'de sayfa zaten bilgisayarda açıldığı için localhost yeterli
  if (Platform.OS === 'web') return undefined;

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:${BACKEND_PORT}` : undefined;
}

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDevServerUrl() || fallbackUrl;
