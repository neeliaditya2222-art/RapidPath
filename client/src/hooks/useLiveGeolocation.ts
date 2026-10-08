import { useState, useEffect, useRef, useCallback } from 'react';
import { GeolocationState, GPSStatus, NearbyHospital } from '../types';
import { locationApi, hospitalApi } from '../api/locationApi';

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function useLiveGeolocation(
  onSignificantMovement?: (coords: { lat: number; lng: number }, distanceMovedMeters: number) => void,
  minMovementMeters = 100
) {
  const [geoState, setGeoState] = useState<GeolocationState>({
    coords: null,
    address: 'Getting your current location...',
    status: 'requesting',
    statusMessage: 'Getting your current location...',
    lastUpdated: null,
    accuracy: null,
    error: null,
  });

  const [nearbyHospitals, setNearbyHospitals] = useState<NearbyHospital[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);
  const lastGeocodedCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastRecalculatedCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const isRequestingRef = useRef<boolean>(false);

  // Reverse geocode and fetch hospitals for coords
  const processCoordinates = useCallback(async (lat: number, lng: number, force = false) => {
    // Check if moved enough to re-geocode (> 150m)
    if (
      !force &&
      lastGeocodedCoordsRef.current &&
      haversineDistanceMeters(lastGeocodedCoordsRef.current.lat, lastGeocodedCoordsRef.current.lng, lat, lng) < 150
    ) {
      return;
    }

    lastGeocodedCoordsRef.current = { lat, lng };

    try {
      const geoRes = await locationApi.reverseGeocode(lat, lng);
      if (geoRes?.data?.address) {
        setGeoState((prev) => ({
          ...prev,
          address: geoRes.data.address,
        }));
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e);
    }

    // Auto fetch nearby hospitals
    setIsLoadingHospitals(true);
    try {
      const hospRes = await hospitalApi.getNearbyHospitals(lat, lng);
      if (hospRes?.hospitals) {
        setNearbyHospitals(hospRes.hospitals);
      }
    } catch (e) {
      console.warn('Nearby hospitals fetch error:', e);
    } finally {
      setIsLoadingHospitals(false);
    }
  }, []);

  const handlePositionSuccess = useCallback(
    (position: GeolocationPosition) => {
      const { latitude: lat, longitude: lng, accuracy } = position.coords;
      const now = new Date();

      setGeoState((prev) => {
        const isFirst = !prev.coords;
        return {
          coords: { lat, lng },
          address: prev.address === 'Getting your current location...' ? `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})` : prev.address,
          status: 'live',
          statusMessage: 'GPS Live • Updated just now',
          lastUpdated: now,
          accuracy,
          error: null,
        };
      });

      // Process address and hospitals
      processCoordinates(lat, lng);

      // Check if vehicle moved significantly for route recalculation
      if (lastRecalculatedCoordsRef.current) {
        const moved = haversineDistanceMeters(
          lastRecalculatedCoordsRef.current.lat,
          lastRecalculatedCoordsRef.current.lng,
          lat,
          lng
        );
        if (moved >= minMovementMeters && onSignificantMovement) {
          lastRecalculatedCoordsRef.current = { lat, lng };
          onSignificantMovement({ lat, lng }, moved);
        }
      } else {
        lastRecalculatedCoordsRef.current = { lat, lng };
      }
    },
    [processCoordinates, minMovementMeters, onSignificantMovement]
  );

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    console.warn('Geolocation error:', err.message, 'Code:', err.code);

    let status: GPSStatus = 'error';
    let statusMessage = 'Unable to determine your current location';
    let errorMessage = err.message;

    switch (err.code) {
      case err.PERMISSION_DENIED:
        status = 'permission_denied';
        statusMessage = 'Location access required';
        errorMessage = 'Location permission was denied. Enable location access to use live emergency routing.';
        break;
      case err.POSITION_UNAVAILABLE:
        status = 'unavailable';
        statusMessage = 'GPS unavailable';
        errorMessage = 'Your current location could not be determined. Retrying...';
        break;
      case err.TIMEOUT:
        status = 'stale';
        statusMessage = 'GPS request timed out';
        errorMessage = 'GPS location request timed out. Retrying...';
        break;
      default:
        status = 'error';
        statusMessage = 'Location error';
        errorMessage = err.message || 'Unknown GPS error';
        break;
    }

    setGeoState((prev) => ({
      ...prev,
      status,
      statusMessage,
      error: errorMessage,
    }));
  }, []);

  const enableLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState((prev) => ({
        ...prev,
        status: 'unavailable',
        statusMessage: 'Geolocation not supported',
        error: 'Your browser does not support Geolocation.',
      }));
      return;
    }

    setGeoState((prev) => ({
      ...prev,
      status: 'requesting',
      statusMessage: 'Getting your current location...',
      error: null,
    }));

    // Single initial fetch
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    // Clear existing watch if any
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Set up continuous watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }, [handlePositionSuccess, handlePositionError]);

  useEffect(() => {
    enableLocation();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enableLocation]);

  return {
    geoState,
    nearbyHospitals,
    isLoadingHospitals,
    enableLocation,
    refreshHospitals: () => {
      if (geoState.coords) {
        processCoordinates(geoState.coords.lat, geoState.coords.lng, true);
      }
    },
  };
}
