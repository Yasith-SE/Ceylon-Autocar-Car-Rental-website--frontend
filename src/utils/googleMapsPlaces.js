import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let googleMapsPlacesPromise;
let didSetLoaderOptions = false;

export const loadGoogleMapsPlacesApi = (apiKey) => {
  const normalizedKey = apiKey?.trim();

  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only load in the browser.'));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  if (!normalizedKey || normalizedKey === 'your_google_maps_javascript_api_key_here') {
    return Promise.reject(
      new Error('Missing VITE_GOOGLE_MAPS_API_KEY. Add it to your Vite environment.'),
    );
  }

  if (googleMapsPlacesPromise) {
    return googleMapsPlacesPromise;
  }

  if (!didSetLoaderOptions) {
    setOptions({
      key: normalizedKey,
      v: 'weekly',
      language: 'en',
      region: 'LK',
    });
    didSetLoaderOptions = true;
  }

  googleMapsPlacesPromise = Promise.all([
    importLibrary('maps'),
    importLibrary('places'),
    importLibrary('routes'),
  ])
    .then(() => {
      if (window.google?.maps?.places) {
        return window.google;
      }

      throw new Error('Google Maps loaded without the required libraries.');
    })
    .catch((error) => {
      googleMapsPlacesPromise = null;
      throw error;
    });

  return googleMapsPlacesPromise;
};
