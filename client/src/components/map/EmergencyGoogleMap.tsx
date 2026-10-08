import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps } from '../../utils/googleMapsLoader';
import { NormalizedRoute, LocationPoint, NearbyHospital } from '../../types';
import { decodePolyline } from '../../utils/polylineDecoder';
import { Navigation2 } from 'lucide-react';

interface EmergencyGoogleMapProps {
  currentGps: { lat: number; lng: number } | null;
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  routes: NormalizedRoute[];
  nearbyHospitals?: NearbyHospital[];
  selectedRouteIndex: number;
  onSelectRoute: (index: number) => void;
  onSelectHospital?: (hospital: NearbyHospital) => void;
  className?: string;
}

export const EmergencyGoogleMap: React.FC<EmergencyGoogleMapProps> = ({
  currentGps,
  origin,
  destination,
  routes,
  nearbyHospitals = [],
  selectedRouteIndex,
  onSelectRoute,
  onSelectHospital,
  className = 'h-[520px] w-full rounded-xl overflow-hidden',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const vehicleMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const hospitalMarkersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const hazardMarkersRef = useRef<google.maps.Marker[]>([]);

  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Initialize Google Maps
  useEffect(() => {
    let isMounted = true;
    if (!mapContainerRef.current) return;

    loadGoogleMaps()
      .then(() => {
        if (!isMounted || !mapContainerRef.current || !window.google?.maps) return;

        const defaultLat = currentGps?.lat || origin?.lat || 17.4399;
        const defaultLng = currentGps?.lng || origin?.lng || 78.4983;

        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: { lat: defaultLat, lng: defaultLng },
          zoom: 14,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
          },
          styles: [
            {
              featureType: 'administrative',
              elementType: 'geometry',
              stylers: [{ visibility: 'simplified' }],
            },
            {
              featureType: 'poi.medical',
              elementType: 'geometry',
              stylers: [{ color: '#fbe9e7' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#f5d6a8' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#cde2e4' }],
            },
          ],
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);
      })
      .catch((err: any) => {
        console.warn('Google Maps loader error:', err?.message || err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Vehicle Marker (🚑) when GPS position changes
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.google?.maps) return;
    const map = mapInstanceRef.current;
    const pos = currentGps || (origin ? { lat: origin.lat, lng: origin.lng } : null);

    if (!pos || !pos.lat || !pos.lng) return;

    const vehicleLatLng = new window.google.maps.LatLng(pos.lat, pos.lng);

    if (!vehicleMarkerRef.current) {
      // Create dedicated emergency vehicle marker (Requirement 3)
      const vehicleSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#102E3C" stroke="#ffffff" stroke-width="3" />
          <circle cx="20" cy="20" r="12" fill="#007F86" />
          <text x="20" y="24" font-size="14" text-anchor="middle" fill="#ffffff" font-family="sans-serif">🚑</text>
        </svg>
      `;

      vehicleMarkerRef.current = new window.google.maps.Marker({
        position: vehicleLatLng,
        map,
        title: 'Emergency Vehicle (GPS Live)',
        zIndex: 100,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(vehicleSvg)}`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
      });
    } else {
      // Smoothly update position without recreation
      vehicleMarkerRef.current.setPosition(vehicleLatLng);
    }
  }, [isMapReady, currentGps, origin]);

  // Update Destination Marker (📍 with white '+')
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.google?.maps) return;
    const map = mapInstanceRef.current;

    if (!destination || !destination.lat || !destination.lng) {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setMap(null);
        destinationMarkerRef.current = null;
      }
      return;
    }

    const destLatLng = new window.google.maps.LatLng(destination.lat, destination.lng);

    const destinationSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#C73540" stroke="#ffffff" stroke-width="3" />
        <path d="M18 10h4v20h-4zM10 18h20v4H10z" fill="#ffffff" />
      </svg>
    `;

    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new window.google.maps.Marker({
        position: destLatLng,
        map,
        title: destination.address || 'Emergency Destination',
        zIndex: 90,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(destinationSvg)}`,
          scaledSize: new window.google.maps.Size(38, 38),
          anchor: new window.google.maps.Point(19, 19),
        },
      });
    } else {
      destinationMarkerRef.current.setPosition(destLatLng);
      destinationMarkerRef.current.setTitle(destination.address);
    }
  }, [isMapReady, destination]);

  // Render Top 5 Nearby Hospital Markers (🏥)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.google?.maps) return;
    const map = mapInstanceRef.current;

    // Clear previous hospital markers
    hospitalMarkersRef.current.forEach((m) => m.setMap(null));
    hospitalMarkersRef.current = [];

    const topHospitals = nearbyHospitals.slice(0, 5);

    const hospitalSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#ffffff" stroke="#007F86" stroke-width="2.5" />
        <path d="M14 8h4v16h-4zM8 14h16v4H8z" fill="#007F86" />
      </svg>
    `;

    topHospitals.forEach((hosp) => {
      if (!hosp.latitude || !hosp.longitude) return;

      const marker = new window.google.maps.Marker({
        position: { lat: hosp.latitude, lng: hosp.longitude },
        map,
        title: `${hosp.name} (${(hosp.distanceMeters / 1000).toFixed(1)} km)`,
        zIndex: 50,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(hospitalSvg)}`,
          scaledSize: new window.google.maps.Size(30, 30),
          anchor: new window.google.maps.Point(15, 15),
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: inherit; padding: 6px; max-width: 220px;">
            <p style="font-weight: 700; color: #102E3C; font-size: 13px; margin: 0 0 4px 0;">🏥 ${hosp.name}</p>
            <p style="color: #617580; font-size: 11px; margin: 0 0 6px 0;">${hosp.address}</p>
            <p style="color: #007F86; font-size: 11px; font-weight: 600; margin: 0 0 8px 0;">
              ${(hosp.distanceMeters / 1000).toFixed(1)} km • ~${hosp.estimatedDurationMinutes} min ETA
            </p>
            <button id="btn-select-hosp-${hosp.placeId}" style="background: #007F86; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; font-weight: 600; cursor: pointer; width: 100%;">
              Select Destination
            </button>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setTimeout(() => {
          const btn = document.getElementById(`btn-select-hosp-${hosp.placeId}`);
          if (btn && onSelectHospital) {
            btn.onclick = () => {
              onSelectHospital(hosp);
              infoWindow.close();
            };
          }
        }, 100);
      });

      hospitalMarkersRef.current.push(marker);
    });
  }, [isMapReady, nearbyHospitals, onSelectHospital]);

  // Render Route Polylines & Hazards
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.google?.maps) return;
    const map = mapInstanceRef.current;

    // Clear previous polylines and hazard markers
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    hazardMarkersRef.current.forEach((h) => h.setMap(null));
    hazardMarkersRef.current = [];

    if (!routes || routes.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    if (currentGps?.lat && currentGps?.lng) {
      bounds.extend(new window.google.maps.LatLng(currentGps.lat, currentGps.lng));
    }
    if (destination?.lat && destination?.lng) {
      bounds.extend(new window.google.maps.LatLng(destination.lat, destination.lng));
    }

    routes.forEach((route, idx) => {
      const rawPoints: [number, number][] =
        route.path && route.path.length > 0 ? route.path : decodePolyline(route.encodedPolyline);

      if (rawPoints.length === 0) return;

      const pathLatLngs = rawPoints.map(([lat, lng]) => {
        const latLng = new window.google.maps.LatLng(lat, lng);
        bounds.extend(latLng);
        return latLng;
      });

      const isRec = route.isRecommended;
      const isSelected = idx === selectedRouteIndex;

      // Outer glow polyline for recommended route
      if (isRec) {
        const glowPolyline = new window.google.maps.Polyline({
          path: pathLatLngs,
          map,
          strokeColor: '#007F86',
          strokeOpacity: 0.25,
          strokeWeight: 12,
          zIndex: 10,
        });
        polylinesRef.current.push(glowPolyline);
      }

      // Main polyline
      const mainPolyline = new window.google.maps.Polyline({
        path: pathLatLngs,
        map,
        strokeColor: isRec ? '#007F86' : isSelected ? '#102E3C' : '#617580',
        strokeOpacity: isRec ? 0.95 : isSelected ? 0.85 : 0.6,
        strokeWeight: isRec ? 6 : isSelected ? 5 : 4,
        zIndex: isRec ? 20 : isSelected ? 15 : 10,
      });

      mainPolyline.addListener('click', () => {
        onSelectRoute(idx);
      });

      polylinesRef.current.push(mainPolyline);

      // Hazard Markers
      if (route.events && route.events.length > 0) {
        route.events.forEach((ev) => {
          const hazardSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="3" transform="rotate(45 12 12)" fill="#97610A" stroke="#ffffff" stroke-width="2" />
              <text x="12" y="16" font-size="12" font-weight="bold" text-anchor="middle" fill="#ffffff" font-family="sans-serif">!</text>
            </svg>
          `;

          const hMarker = new window.google.maps.Marker({
            position: { lat: ev.lat, lng: ev.lng },
            map,
            title: ev.description,
            zIndex: 40,
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(hazardSvg)}`,
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12),
            },
          });

          hazardMarkersRef.current.push(hMarker);
        });
      }
    });

    // Auto fit bounds
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  }, [isMapReady, routes, selectedRouteIndex, currentGps, destination, onSelectRoute]);

  const recenterMap = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const pos = currentGps || origin;
    if (pos && pos.lat && pos.lng) {
      mapInstanceRef.current.panTo({ lat: pos.lat, lng: pos.lng });
      mapInstanceRef.current.setZoom(15);
    }
  }, [currentGps, origin]);

  return (
    <div className={`relative border border-[#DCE5E9] shadow-sm bg-[#EDF1F0] ${className}`}>
      {/* Recenter Control Button */}
      <div className="absolute top-4 right-4 z-[10] flex items-center gap-2">
        <button
          type="button"
          onClick={recenterMap}
          className="px-3 py-1.5 bg-white/95 border border-[#DCE5E9] backdrop-blur-sm rounded-lg text-xs font-semibold text-[#102E3C] shadow-sm hover:bg-[#F2F5F6] flex items-center gap-1.5 transition-all"
        >
          <Navigation2 className="w-3.5 h-3.5 text-[#007F86]" />
          <span>Center Vehicle</span>
        </button>
      </div>

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-[10] bg-white/95 border border-[#DCE5E9] backdrop-blur-sm px-3.5 py-2.5 rounded-lg text-xs shadow-sm flex flex-col gap-1.5 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 bg-[#007F86] rounded-full" />
          <span className="text-[#112B37] font-semibold">AI Recommended Corridor</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 bg-[#617580] rounded-full" />
          <span className="text-[#617580]">Alternative Routes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">🏥</span>
          <span className="text-[#617580]">Nearby Hospitals</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#C73540] rounded-full" />
          <span className="text-[#617580]">Emergency Destination</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#97610A] rounded-sm rotate-45" />
          <span className="text-[#617580]">Potential Hazard</span>
        </div>
      </div>

      {/* Google Map Container */}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};
