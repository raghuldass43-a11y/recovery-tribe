import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const isNativeAndroid = (): boolean => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Initialize Android native system behaviors
 */
export async function initAndroidNativeFeatures(theme: 'light' | 'dark'): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // 1. Hide native splash screen smoothly
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (err) {
    console.debug('SplashScreen hide error (non-fatal):', err);
  }

  try {
    // 2. Configure native status bar
    await StatusBar.setOverlaysWebView({ overlay: false });
    await updateAndroidStatusBar(theme);
  } catch (err) {
    console.debug('StatusBar configuration error (non-fatal):', err);
  }
}

/**
 * Updates status bar color to match light/dark theme
 */
export async function updateAndroidStatusBar(theme: 'light' | 'dark'): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    if (theme === 'dark') {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#09090b' });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#faf7f2' });
    }
  } catch (err) {
    console.debug('StatusBar style update error:', err);
  }
}

/**
 * Trigger light tactile feedback on Android touch
 */
export async function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light'): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    if (type === 'light') {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (type === 'medium') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (type === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (type === 'warning') {
      await Haptics.notification({ type: NotificationType.Warning });
    }
  } catch (err) {
    console.debug('Haptics error:', err);
  }
}

/**
 * Pick image from native Android camera or gallery
 */
export async function pickAndroidPhoto(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;

  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // Prompts user: Camera or Photos/Gallery
      promptLabelHeader: 'Recovery Tribe Media',
      promptLabelPhoto: 'Choose from Gallery',
      promptLabelPicture: 'Take a Photo with Camera',
    });

    return photo.dataUrl || null;
  } catch (err) {
    console.debug('Camera/Gallery selection cancelled or error:', err);
    return null;
  }
}

/**
 * Hook up Android hardware back button handler
 */
export function setupAndroidBackButton(onBackAction: () => boolean): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  const listenerHandle = App.addListener('backButton', () => {
    // If onBackAction returns false, it means we should exit the app
    const handled = onBackAction();
    if (!handled) {
      App.exitApp();
    }
  });

  return () => {
    listenerHandle.then(handle => handle.remove()).catch(() => {});
  };
}
