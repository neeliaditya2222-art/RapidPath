import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline as LeafletPolyline, Marker as LeafletMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { NormalizedRoute, LocationPoint, NearbyHospital } from '../../types';
import { decodePolyline } from '../../utils/polylineDecoder';

interface EmergencyMapProps {
  currentGps?: { lat: number; lng: number } | null;
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  routes: NormalizedRoute[];
  nearbyHospitals?: NearbyHospital[];
  selectedRouteIndex: number;
  onSelectRoute: (index: number) => void;
  onSelectHospital?: (hospital: NearbyHospital) => void;
  className?: string;
}

// Leaflet Custom HTML Icons
const createAmbulanceIcon = () =>
  L.divIcon({
    className: 'custom-ambulance-icon',
    html: `<div style="background-color: #102E3C; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 3px 10px rgba(16, 46, 60, 0.45);">
            <span style="font-size: 17px; line-height: 1;">🚑</span>
          </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const createDestinationIcon = () =>
  L.divIcon({
    className: 'custom-destination-icon',
    html: `<div style="background-color: #C73540; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 3px 10px rgba(199, 53, 64, 0.45);">
            <span style="color: white; font-size: 16px; font-weight: bold; line-height: 1;">+</span>
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const createHospitalIcon = () =>
  L.divIcon({
    className: 'custom-hospital-icon',
    html: `<div style="background-color: #ffffff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #007F86; box-shadow: 0 2px 8px rgba(0, 127, 134, 0.3);">
            <span style="font-size: 13px; line-height: 1;">🏥</span>
          </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const createHazardIcon = (severity: string) => {
  const color = severity === 'high' ? '#C73540' : '#97610A';
  return L.divIcon({
    className: 'custom-hazard-icon',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 3px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2); transform: rotate(45deg);">
            <span style="transform: rotate(-45deg); color: white; font-size: 11px; font-weight: bold;">!</span>
          </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// Leaflet bounds auto-fitter
const LeafletFitBounds: React.FC<{
  currentGps: { lat: number; lng: number } | null;
  destination: LocationPoint | null;
  routes: NormalizedRoute[];
}> = ({ currentGps, destination, routes }) => {
  const map = useMap();

  useEffect(() => {
    const latLngs: [number, number][] = [];
    if (currentGps && currentGps.lat && currentGps.lng) latLngs.push([currentGps.lat, currentGps.lng]);
    if (destination && destination.lat && destination.lng) latLngs.push([destination.lat, destination.lng]);

    routes.forEach((r) => {
      const p = r.path && r.path.length > 0 ? r.path : decodePolyline(r.encodedPolyline);
      if (p && p.length > 0) {
        latLngs.push(...p);
      }
    });

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, currentGps, destination, routes]);

  return null;
};

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  currentGps = null,
  origin,
  destination,
  routes,
  nearbyHospitals = [],
  selectedRouteIndex,
  onSelectRoute,
  onSelectHospital,
  className = 'h-[520px] w-full rounded-xl overflow-hidden',
}) => {
  const defaultCenter: [number, number] = currentGps
    ? [currentGps.lat, currentGps.lng]
    : origin && origin.lat && origin.lng
    ? [origin.lat, origin.lng]
    : [17.42109, 78.34766];

  return (
    <div className={`relative border border-[#DCE5E9] shadow-sm bg-[#EDF1F0] ${className}`}>
      {/* Floating Map Legend (Desktop: Full, Mobile: Compact pill) */}
      <div className="hidden sm:flex absolute bottom-4 left-4 z-[1000] bg-white/95 border border-[#DCE5E9] backdrop-blur-sm px-3.5 py-2.5 rounded-lg text-xs shadow-sm flex-col gap-1.5 font-medium pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 bg-[#007F86] rounded-full" />
          <span className="text-[#112B37] font-bold">AI Recommended Corridor</span>
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

      {/* Mobile-Friendly Compact Badge */}
      <div className="sm:hidden absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-[#DCE5E9] shadow-xs text-[#112B37] flex items-center gap-2">
        <span className="inline-block w-2.5 h-1 bg-[#007F86] rounded-full" />
        <span>AI Corridor Active</span>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        attributionControl={false}
        className="h-full w-full z-0"
        style={{ background: '#EDF1F0' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <LeafletFitBounds currentGps={currentGps} destination={destination} routes={routes} />

        {/* Emergency Vehicle Marker (🚑) at live GPS */}
        {(currentGps || origin) && (
          <LeafletMarker
            position={[
              currentGps?.lat || origin?.lat || 17.42109,
              currentGps?.lng || origin?.lng || 78.34766,
            ]}
            icon={createAmbulanceIcon()}
          >
            <Popup className="clinical-popup">
              <div className="p-1 text-xs">
                <p className="font-bold text-[#102E3C]">EMERGENCY VEHICLE</p>
                <p className="text-[#007F86] font-semibold mt-0.5">● GPS LIVE ACTIVE</p>
                <p className="text-[#617580] mt-0.5">{origin?.address || 'Current Position'}</p>
              </div>
            </Popup>
          </LeafletMarker>
        )}

        {/* Destination Marker (📍 with '+') */}
        {destination && destination.lat && destination.lng && (
          <LeafletMarker position={[destination.lat, destination.lng]} icon={createDestinationIcon()}>
            <Popup className="clinical-popup">
              <div className="p-1 text-xs">
                <p className="font-bold text-[#C73540]">EMERGENCY DESTINATION</p>
                <p className="text-[#112B37] mt-0.5 font-medium">{destination.address}</p>
              </div>
            </Popup>
          </LeafletMarker>
        )}

        {/* Top 5 Nearby Hospitals */}
        {nearbyHospitals.slice(0, 5).map((hosp) => (
          <LeafletMarker
            key={hosp.placeId}
            position={[hosp.latitude, hosp.longitude]}
            icon={createHospitalIcon()}
          >
            <Popup className="clinical-popup">
              <div className="p-1 text-xs max-w-[200px]">
                <p className="font-bold text-[#102E3C]">🏥 {hosp.name}</p>
                <p className="text-[#617580] mt-0.5">{hosp.address}</p>
                <p className="text-[#007F86] font-semibold mt-1">
                  {(hosp.distanceMeters / 1000).toFixed(1)} km • ~{hosp.estimatedDurationMinutes} min ETA
                </p>
                {onSelectHospital && (
                  <button
                    type="button"
                    onClick={() => onSelectHospital(hosp)}
                    className="mt-2 w-full py-1 bg-[#007F86] text-white text-[11px] font-bold rounded hover:bg-[#00666C] transition-all"
                  >
                    Select Destination
                  </button>
                )}
              </div>
            </Popup>
          </LeafletMarker>
        ))}

        {/* Route Polylines */}
        {routes.map((route, idx) => {
          const rawPoints = route.path && route.path.length > 0 ? route.path : decodePolyline(route.encodedPolyline);
          if (rawPoints.length === 0) return null;

          const isRec = route.isRecommended;
          const isSelected = idx === selectedRouteIndex;
          const color = isRec ? '#007F86' : isSelected ? '#102E3C' : '#617580';

          return (
            <React.Fragment key={route.id || idx}>
              {isRec && (
                <LeafletPolyline
                  positions={rawPoints}
                  pathOptions={{
                    color: '#007F86',
                    weight: 12,
                    opacity: 0.25,
                    lineCap: 'round',
                  }}
                />
              )}

              <LeafletPolyline
                positions={rawPoints}
                eventHandlers={{
                  click: () => onSelectRoute(idx),
                }}
                pathOptions={{
                  color,
                  weight: isRec ? 6 : isSelected ? 5 : 4,
                  opacity: isRec ? 0.95 : isSelected ? 0.85 : 0.6,
                  dashArray: !isRec ? '6, 6' : undefined,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />

              {route.events &&
                route.events.map((ev) => (
                  <LeafletMarker key={ev.id} position={[ev.lat, ev.lng]} icon={createHazardIcon(ev.severity)}>
                    <Popup className="clinical-popup">
                      <div className="p-1 text-xs">
                        <p className="font-bold text-[#97610A] uppercase">{ev.eventType.replace('_', ' ')}</p>
                        <p className="text-[#112B37] mt-0.5">{ev.description}</p>
                      </div>
                    </Popup>
                  </LeafletMarker>
                ))}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
