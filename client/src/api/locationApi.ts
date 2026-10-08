import { apiClient } from './client';
import { NearbyHospital } from '../types';

export const locationApi = {
  reverseGeocode: (lat: number, lng: number) => {
    return apiClient<{
      success: boolean;
      data: {
        address: string;
        formattedAddress: string;
        isIndia: boolean;
        city?: string;
      };
    }>(`/location/reverse-geocode?lat=${lat}&lng=${lng}`);
  },

  geocodeAddress: (address: string) => {
    return apiClient<{
      success: boolean;
      data: {
        lat: number;
        lng: number;
        formattedAddress: string;
        isIndia: boolean;
      };
    }>('/location/geocode', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  },
};

export const hospitalApi = {
  getNearbyHospitals: (lat: number, lng: number, radius = 15000) => {
    return apiClient<{
      success: boolean;
      count: number;
      hospitals: NearbyHospital[];
    }>(`/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  },
};
