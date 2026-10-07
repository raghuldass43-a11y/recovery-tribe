// Android App & Backend API Configuration

export const PROD_BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://ais-pre-dlppt4ghknngie2nndxo7n-758830628121.asia-southeast1.run.app";

export const APP_NAME = "Recovery Tribe";
export const APP_ID = "com.recoverytribe.app";
export const APP_VERSION = "1.0.0";

/**
 * Returns the appropriate API base URL.
 * When running inside a native Android APK (Capacitor/WebView), routes to the live production server.
 * When running in standard web development, uses relative paths.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Native Capacitor Android webview uses capacitor://localhost or http://localhost without port 3000
    if (
      origin.includes('capacitor://') ||
      origin.includes('ionic://') ||
      window.location.protocol === 'file:' ||
      (origin.includes('localhost') && !origin.includes(':3000'))
    ) {
      return PROD_BACKEND_URL;
    }
    // Web environment
    if (origin.includes(':3000') || origin.includes('run.app')) {
      return '';
    }
  }
  return PROD_BACKEND_URL;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText}`);
  }
  return res.json() as Promise<T>;
}
