import { Alert, Platform } from 'react-native';

// Kullanıcıya kısa bir bilgi/başarı/hata mesajı gösterir.
// Alert.alert web'de çalışmadığı için orada tarayıcının alert'i kullanılır.
export function notify(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
