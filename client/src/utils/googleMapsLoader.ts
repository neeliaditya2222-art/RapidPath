declare global {
  interface Window {
    google?: any;
    gm_authFailure?: () => void;
    __googleMapsAuthFailed?: boolean;
  }
}

let loadPromise: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window !== 'undefined' && window.google?.maps?.Map && !window.__googleMapsAuthFailed) {
    return Promise.resolve(window.google.maps);
  }

  if (loadPromise) {
    return loadPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_API_KEY || '';

  if (!apiKey) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_BROWSER_API_KEY is not defined'));
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if script is already present in DOM
    const existingScript = document.getElementById('google-maps-platform-script') as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google?.maps?.Map) {
        return resolve(window.google.maps);
      }
      existingScript.addEventListener('load', () => resolve(window.google.maps));
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    // Google Maps auth error hook
    window.gm_authFailure = () => {
      console.warn('Google Maps authentication failed (billing, quota, or key restriction). Falling back.');
      window.__googleMapsAuthFailed = true;
    };

    const script = document.createElement('script');
    script.id = 'google-maps-platform-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Small timeout to allow auth error listener to fire if key is rejected
      setTimeout(() => {
        if (window.__googleMapsAuthFailed) {
          reject(new Error('Google Maps authentication failure'));
        } else if (window.google?.maps?.Map) {
          resolve(window.google.maps);
        } else {
          resolve(window.google?.maps);
        }
      }, 100);
    };

    script.onerror = (err) => {
      console.warn('Google Maps script tag load error:', err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
