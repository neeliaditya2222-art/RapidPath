import React, { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { routePlannerFormSchema, RoutePlannerFormValues } from '../../schemas/routeSchema';
import { PrioritySelector, IncidentSelector } from './PrioritySelector';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { GooglePlacesIndiaInput } from '../common/GooglePlacesIndiaInput';
import {
  MapPin,
  Navigation,
  Sparkles,
  AlertCircle,
  Building2,
  Activity,
  LocateFixed,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { VehicleType, EmergencyPriority, IncidentType, GeolocationState, NearbyHospital } from '../../types';

interface EmergencyRouteFormProps {
  geoState: GeolocationState;
  nearbyHospitals: NearbyHospital[];
  isLoadingHospitals: boolean;
  initialDestination?: { address: string; lat: number; lng: number } | null;
  onEnableLocation: () => void;
  onRefreshHospitals: () => void;
  onSubmit: (values: RoutePlannerFormValues) => void;
  onHospitalSelect: (hospital: NearbyHospital) => void;
  isLoading: boolean;
}

const LOADING_STEPS = [
  'Connecting to Google Routes API',
  'Analyzing real-time road corridors and traffic delays',
  'Evaluating multi-route risk & suitability metrics',
  'Querying Gemini AI for emergency corridor recommendation',
  'Dispatch route synchronized',
];

export const EmergencyRouteForm: React.FC<EmergencyRouteFormProps> = ({
  geoState,
  nearbyHospitals,
  isLoadingHospitals,
  initialDestination,
  onEnableLocation,
  onRefreshHospitals,
  onSubmit,
  onHospitalSelect,
  isLoading,
}) => {
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [useManualOrigin, setUseManualOrigin] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  const getSavedDestination = () => {
    if (initialDestination && initialDestination.address) {
      return initialDestination;
    }
    try {
      const stored = sessionStorage.getItem('rapidpath_latest_route_result');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.destination) {
          return parsed.destination;
        }
      }
    } catch (e) {}
    return { address: '', lat: 0, lng: 0 };
  };

  const initialDest = getSavedDestination();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RoutePlannerFormValues>({
    resolver: zodResolver(routePlannerFormSchema),
    defaultValues: {
      originAddress: geoState.address || 'Locating emergency vehicle...',
      originLat: geoState.coords?.lat || 17.4399,
      originLng: geoState.coords?.lng || 78.4983,
      destinationAddress: initialDest.address || '',
      destinationLat: initialDest.lat || 0,
      destinationLng: initialDest.lng || 0,
      vehicleType: 'ambulance' as VehicleType,
      emergencyPriority: 'critical' as EmergencyPriority,
      incidentType: 'medical' as IncidentType,
      notes: 'Code 3 Trauma Dispatch',
    },
  });

  const destinationAddress = useWatch({ control, name: 'destinationAddress' });
  const destinationLat = useWatch({ control, name: 'destinationLat' });

  // Sync GPS location into form origin automatically
  useEffect(() => {
    if (!useManualOrigin && geoState.coords) {
      setValue('originAddress', geoState.address, { shouldValidate: true });
      setValue('originLat', geoState.coords.lat);
      setValue('originLng', geoState.coords.lng);
    }
  }, [geoState.coords, geoState.address, useManualOrigin, setValue]);

  // Sync initialDestination if updated from parent
  useEffect(() => {
    if (initialDestination && initialDestination.address) {
      setValue('destinationAddress', initialDestination.address, { shouldValidate: true });
      setValue('destinationLat', initialDestination.lat);
      setValue('destinationLng', initialDestination.lng);

      // Check if matches a nearby hospital
      const matched = nearbyHospitals.find(
        (h) =>
          h.address.toLowerCase().includes(initialDestination.address.toLowerCase()) ||
          initialDestination.address.toLowerCase().includes(h.name.toLowerCase())
      );
      if (matched) {
        setSelectedHospitalId(matched.placeId);
      }
    }
  }, [initialDestination, nearbyHospitals, setValue]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleHospitalCardClick = (hospital: NearbyHospital) => {
    setSelectedHospitalId(hospital.placeId);
    setValue('destinationAddress', `${hospital.name}, ${hospital.address}`, { shouldValidate: true });
    setValue('destinationLat', hospital.latitude);
    setValue('destinationLng', hospital.longitude);
    onHospitalSelect(hospital);
  };

  return (
    <Card className="p-5 sm:p-6 bg-white border border-[#DCE5E9] shadow-sm">
      {/* Header */}
      <div className="pb-4 border-b border-[#DCE5E9] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#112B37]">
            Emergency Dispatch & Routing
          </h2>
          <p className="text-xs text-[#617580] mt-0.5">
            Google Routes API + Gemini AI real-time corridor intelligence
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#007F86] animate-pulse" />
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E8F5ED] text-[#24735B]">
            ● GPS Active
          </span>
        </div>
      </div>

      {/* GPS Location Denied Banner */}
      {geoState.status === 'permission_denied' && (
        <div className="mt-4 p-3.5 bg-[#FFF2F2] border border-[#C73540]/30 rounded-lg text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#C73540] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#C73540]">LOCATION ACCESS REQUIRED</p>
                <p className="text-[#617580] mt-0.5">
                  Allow browser location access to use live emergency vehicle routing.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onEnableLocation}
              className="text-xs border-[#C73540] text-[#C73540] hover:bg-[#C73540] hover:text-white"
            >
              Enable Location
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
        {/* STARTING LOCATION (Current GPS by default) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#617580] flex items-center gap-1.5">
              <span>Emergency Origin</span>
            </label>

            <button
              type="button"
              onClick={() => setUseManualOrigin(!useManualOrigin)}
              className="text-[11px] text-[#007F86] hover:underline font-medium"
            >
              {useManualOrigin ? 'Use Live GPS Location' : 'Use different starting point'}
            </button>
          </div>

          {!useManualOrigin ? (
            /* Live GPS Location Box (Requirements 1, 4, 5, 27) */
            <div className="p-3.5 bg-[#F8FAFB] border border-[#DCE5E9] rounded-lg relative overflow-hidden">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#007F86]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <LocateFixed className="w-4 h-4 text-[#007F86]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#007F86] uppercase tracking-wide">
                        Current GPS Location
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#24735B] bg-[#E8F5ED] px-1.5 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#24735B] animate-pulse" />
                        GPS LIVE
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#112B37] mt-1 line-clamp-1">
                      📍 {geoState.address}
                    </p>
                    {geoState.coords && (
                      <p className="text-[10px] text-[#617580] mt-0.5 font-mono">
                        {geoState.coords.lat.toFixed(5)}, {geoState.coords.lng.toFixed(5)}
                        {geoState.accuracy && ` (±${Math.round(geoState.accuracy)}m)`}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onEnableLocation}
                  title="Refresh GPS position"
                  className="p-1.5 rounded hover:bg-[#DCE5E9]/50 text-[#617580] hover:text-[#112B37] transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Manual Origin Search */
            <Controller
              name="originAddress"
              control={control}
              render={({ field }) => (
                <GooglePlacesIndiaInput
                  id="manual-origin-input"
                  value={field.value}
                  placeholder="Search starting address in India..."
                  onPlaceSelect={(place) => {
                    setValue('originAddress', place.address, { shouldValidate: true });
                    setValue('originLat', place.lat);
                    setValue('originLng', place.lng);
                  }}
                  error={errors.originAddress?.message}
                />
              )}
            />
          )}
        </div>

        {/* EMERGENCY DESTINATION (India-only restriction) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#617580] flex items-center gap-1.5">
              <span>Emergency Destination</span>
              <span className="text-[#C73540]">*</span>
            </label>
            <span className="text-[10px] text-[#617580] bg-[#F2F5F6] px-1.5 py-0.5 rounded font-medium">
              India Only
            </span>
          </div>

          <Controller
            name="destinationAddress"
            control={control}
            render={({ field }) => (
              <GooglePlacesIndiaInput
                id="destination-address-input"
                value={field.value}
                placeholder="Search hospital, address, or location in India..."
                nearbyHospitals={nearbyHospitals}
                currentCoords={geoState.coords}
                onPlaceSelect={(place) => {
                  const matchedHosp = nearbyHospitals.find(
                    (h) => h.placeId === place.placeId || (h.latitude === place.lat && h.longitude === place.lng)
                  );
                  setSelectedHospitalId(matchedHosp ? matchedHosp.placeId : null);
                  setValue('destinationAddress', place.address, { shouldValidate: true });
                  setValue('destinationLat', place.lat);
                  setValue('destinationLng', place.lng);
                }}
                error={errors.destinationAddress?.message}
              />
            )}
          />
        </div>

        {/* NEAREST HOSPITALS SECTION (Requirements 8, 9, 10, 19) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#112B37] uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#007F86]" />
              <span>Nearest Hospitals</span>
            </div>
            <button
              type="button"
              onClick={onRefreshHospitals}
              className="text-[11px] text-[#007F86] hover:underline flex items-center gap-1 font-medium"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingHospitals ? 'animate-spin' : ''}`} />
              <span>Scan Nearby</span>
            </button>
          </div>

          {isLoadingHospitals ? (
            <div className="p-3 bg-[#F8FAFB] border border-[#DCE5E9] rounded-lg text-center text-xs text-[#617580]">
              <Activity className="w-4 h-4 animate-spin mx-auto mb-1 text-[#007F86]" />
              <span>Discovering hospitals around your GPS location...</span>
            </div>
          ) : nearbyHospitals.length > 0 ? (
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {nearbyHospitals.slice(0, 4).map((hosp) => {
                const isSelected = selectedHospitalId === hosp.placeId;

                return (
                  <button
                    key={hosp.placeId}
                    type="button"
                    onClick={() => handleHospitalCardClick(hosp)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'border-[#007F86] bg-[#E1F2F1]/50 ring-1 ring-[#007F86]'
                        : 'border-[#DCE5E9] bg-white hover:bg-[#F2F5F6] hover:border-[#617580]/40'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🏥</span>
                        <span className="text-xs font-bold text-[#112B37] truncate">
                          {hosp.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#007F86] flex-shrink-0 ml-auto" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#617580] truncate mt-0.5 pl-4">
                        {hosp.address}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 pl-1">
                      <span className="text-xs font-bold text-[#007F86]">
                        {(hosp.distanceMeters / 1000).toFixed(1)} km
                      </span>
                      <p className="text-[10px] text-[#617580] flex items-center justify-end gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>~{hosp.estimatedDurationMinutes}m</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 bg-[#F8FAFB] border border-[#DCE5E9] rounded-lg text-center text-xs text-[#617580]">
              <span>Acquiring GPS to discover nearest emergency hospitals...</span>
            </div>
          )}
        </div>

        {/* Vehicle Class Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580] mb-1.5">
            Vehicle Class
          </label>
          <Select
            {...register('vehicleType')}
            options={[
              { value: 'ambulance', label: 'Ambulance (Code 3 Siren Priority)' },
              { value: 'fire_engine', label: 'Fire Engine (Heavy Apparatus)' },
              { value: 'police', label: 'Police Interceptor' },
              { value: 'rescue', label: 'Rescue Unit' },
              { value: 'other', label: 'Other Emergency Vehicle' },
            ]}
          />
        </div>

        {/* Emergency Priority */}
        <Controller
          name="emergencyPriority"
          control={control}
          render={({ field }) => (
            <PrioritySelector value={field.value} onChange={field.onChange} />
          )}
        />

        {/* Incident Type */}
        <Controller
          name="incidentType"
          control={control}
          render={({ field }) => (
            <IncidentSelector value={field.value} onChange={field.onChange} />
          )}
        />

        {/* Progress sequence during loading */}
        {isLoading && (
          <div className="bg-[#E1F2F1] border border-[#007F86]/20 rounded-xl p-3.5 space-y-2 text-xs text-[#112B37]">
            <div className="flex items-center justify-between font-semibold text-[#007F86]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Calculating Live Corridors...</span>
              </span>
              <span>{Math.round(((loadingStepIndex + 1) / LOADING_STEPS.length) * 100)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#007F86] animate-ping" />
              <span className="font-medium">{LOADING_STEPS[loadingStepIndex]}</span>
            </div>
          </div>
        )}

        {/* Primary CTA Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-base font-bold shadow-sm"
          >
            {isLoading ? 'Analyzing Emergency Routes...' : 'Analyze Routes'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
