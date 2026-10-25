import { Fraunces_400Regular_Italic, Fraunces_500Medium } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colors, fonts } from '../constants/theme';

// Kök yerleşim: tüm ekranları saran Stack navigasyonu.
// Expo Router, src/app klasöründeki her dosyayı otomatik olarak bir ekran yapar:
//   index.tsx        → "/"            (Kişi listesi)
//   person/[id].tsx  → "/person/5"    (Kişi detayı)
//   form.tsx         → "/form?id=5"   (Ekleme / düzenleme)
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular_Italic,
    Fraunces_500Medium,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Yazı tipleri yüklenene kadar hiçbir şey çizme (yanlış fontla titreme olmasın).
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bone },
          headerShadowVisible: false,
          headerTintColor: colors.aubergine,
          headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 16 },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.bone },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="person/[id]" options={{ title: '' }} />
        <Stack.Screen name="form" options={{ title: '' }} />
      </Stack>
    </>
  );
}
