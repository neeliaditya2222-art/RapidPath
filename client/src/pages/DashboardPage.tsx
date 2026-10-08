import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EmergencyRouteForm } from '../components/dashboard/EmergencyRouteForm';
import { EmergencyMap } from '../components/map/EmergencyMap';
import { RecommendedRouteCard } from '../components/dashboard/RecommendedRouteCard';
import { RouteComparisonPanel } from '../components/dashboard/RouteComparisonPanel';
import { GetDirectionsCard } from '../components/dashboard/GetDirectionsCard';
import { ActiveEmergencyBanner } from '../components/dashboard/ActiveEmergencyBanner';
import { RouteScoreCard } from '../components/dashboard/RouteScoreCard';
import { TrafficStatusCard } from '../components/dashboard/TrafficStatusCard';
import { AIDelayPredictionCard, HazardAlert } from '../components/dashboard/AIDelayPredictionCard';
import { routeApi } from '../api/routeApi';
import { useLiveGeolocation } from '../hooks/useLiveGeolocation';
import {
  RouteAnalysisResult,
  NormalizedRoute,
  VehicleType,
  EmergencyPriority,
  NearbyHospital,
} from '../types';
import { RoutePlannerFormValues } from '../schemas/routeSchema';
import { RefreshCw, Radio, Compass, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/authService';

const ROUTE_REFRESH_INTERVAL_MS = 30000;
const MIN_ROUTE_UPDATE_DISTANCE_METERS = 100;

export const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Restore persisted route result if returning from Route Analysis
  const [result, setResult] = useState<RouteAnalysisResult | null>(() => {
    try {
      const stored = sessionStorage.getItem('rapidpath_latest_route_result');
      if (stored) {
        return JSON.parse(stored) as RouteAnalysisResult;
      }
    } catch (e) {
      console.warn('Failed to restore route result:', e);
    }
    return null;
  });

  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem('rapidpath_latest_route_result');
      if (stored) {
        const parsed = JSON.parse(stored) as RouteAnalysisResult;
        return parsed.recommendedRouteIndex ?? 0;
      }
    } catch (e) {}
    return 0;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Form state tracking for active emergency banner
  const [currentOrigin, setCurrentOrigin] = useState<string>(() => {
    try {
      const stored = sessionStorage.getItem('rapidpath_latest_route_result');
      if (stored) {
        const parsed = JSON.parse(stored) as RouteAnalysisResult;
        return parsed.origin?.address || '';
      }
    } catch (e) {}
    return '';
  });

  const [currentDestination, setCurrentDestination] = useState<string>(() => {
    try {
      const stored = sessionStorage.getItem('rapidpath_latest_route_result');
      if (stored) {
        const parsed = JSON.parse(stored) as RouteAnalysisResult;
        return parsed.destination?.address || '';
      }
    } catch (e) {}
    return '';
  });

  const [currentVehicle, setCurrentVehicle] = useState<VehicleType>(() => {
    try {
      const stored = sessionStorage.getItem('rapidpath_latest_route_result');
      if (stored) {
        const parsed = JSON.parse(stored) as RouteAnalysisResult;
        return parsed.vehicleType || 'ambulance';
      }
    } catch (e) {}
    return 'ambulance';
  });

  const [currentPriority, setCurrentPriority] = useState<EmergencyPriority>(() => {
    try {
      const stored = sessionStorage.getItem('rapidpath_latest_route_result');
      if (stored) {
        const parsed = JSON.parse(stored) as RouteAnalysisResult;
        return parsed.emergencyPriority || 'critical';
      }
    } catch (e) {}
    return 'critical';
  });

  // Keep latest destination in ref for movement recalculation
  const activeDestinationRef = useRef<{ address: string; lat: number; lng: number } | null>(null);

  // Initialize activeDestinationRef on mount if stored result exists
  useEffect(() => {
    if (result && result.destination && result.destination.lat) {
      activeDestinationRef.current = {
        address: result.destination.address,
        lat: result.destination.lat,
        lng: result.destination.lng,
      };
    }
  }, [result]);

  const activeVehicleRef = useRef<VehicleType>('ambulance');
  const activePriorityRef = useRef<EmergencyPriority>('critical');

  // Callback triggered when GPS moves > 100m
  const handleSignificantMovement = useCallback(
    async (coords: { lat: number; lng: number }, distanceMovedMeters: number) => {
      console.log(`🚑 Vehicle moved ${distanceMovedMeters}m to (${coords.lat}, ${coords.lng}). Recalculating route...`);

      if (!activeDestinationRef.current || !activeDestinationRef.current.lat) {
        return;
      }

      try {
        const freshResponse = await routeApi.analyzeRoute({
          origin: {
            address: 'Current GPS Location',
            lat: coords.lat,
            lng: coords.lng,
          },
          destination: activeDestinationRef.current,
          vehicleType: activeVehicleRef.current,
          emergencyPriority: activePriorityRef.current,
        });

        setResult(freshResponse);
        try {
          sessionStorage.setItem('rapidpath_latest_route_result', JSON.stringify(freshResponse));
        } catch (e) {
          // ignore
        }
        setLastRefreshTime(new Date());
      } catch (err) {
        console.warn('Live route update failed:', err);
      }
    },
    []
  );

  // Live Geolocation Hook
  const {
    geoState,
    nearbyHospitals,
    isLoadingHospitals,
    enableLocation,
    refreshHospitals,
  } = useLiveGeolocation(handleSignificantMovement, MIN_ROUTE_UPDATE_DISTANCE_METERS);

  // Sync initial address into origin banner when GPS first resolves
  useEffect(() => {
    if (geoState.address && !currentOrigin) {
      setCurrentOrigin(geoState.address);
    }
  }, [geoState.address, currentOrigin]);

  // Main Route Planning Execution
  const handlePlanRoute = async (values: RoutePlannerFormValues) => {
    if (!values.destinationAddress && !values.destinationLat) {
      return;
    }

    setIsLoading(true);
    setCurrentOrigin(values.originAddress);
    setCurrentDestination(values.destinationAddress);
    setCurrentVehicle(values.vehicleType);
    setCurrentPriority(values.emergencyPriority);

    activeDestinationRef.current = {
      address: values.destinationAddress,
      lat: values.destinationLat,
      lng: values.destinationLng,
    };
    activeVehicleRef.current = values.vehicleType;
    activePriorityRef.current = values.emergencyPriority;

    const originLat = values.originLat || geoState.coords?.lat || 17.4399;
    const originLng = values.originLng || geoState.coords?.lng || 78.4983;

    try {
      const response = await routeApi.analyzeRoute({
        origin: {
          address: values.originAddress || geoState.address,
          lat: originLat,
          lng: originLng,
        },
        destination: {
          address: values.destinationAddress,
          lat: values.destinationLat,
          lng: values.destinationLng,
        },
        vehicleType: values.vehicleType,
        emergencyPriority: values.emergencyPriority,
        incidentType: values.incidentType,
        notes: values.notes,
      });

      setResult(response);
      try {
        sessionStorage.setItem('rapidpath_latest_route_result', JSON.stringify(response));
      } catch (e) {
        // ignore
      }
      setSelectedRouteIndex(response.recommendedRouteIndex ?? 0);
      setLastRefreshTime(new Date());
    } catch (err: any) {
      console.warn('Route analysis API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Select hospital from list or map
  const handleHospitalSelect = (hospital: NearbyHospital) => {
    const originLat = geoState.coords?.lat || 17.4399;
    const originLng = geoState.coords?.lng || 78.4983;

    handlePlanRoute({
      originAddress: geoState.address,
      originLat,
      originLng,
      destinationAddress: `${hospital.name}, ${hospital.address}`,
      destinationLat: hospital.latitude,
      destinationLng: hospital.longitude,
      vehicleType: currentVehicle,
      emergencyPriority: currentPriority,
      incidentType: 'medical',
      notes: 'Direct Hospital Trauma Route',
    });
  };

  // Periodic route refresh (every 30 seconds if destination is active)
  useEffect(() => {
    if (!activeDestinationRef.current || !activeDestinationRef.current.lat) return;

    const interval = setInterval(() => {
      const originLat = geoState.coords?.lat || 17.4399;
      const originLng = geoState.coords?.lng || 78.4983;

      routeApi
        .analyzeRoute({
          origin: {
            address: geoState.address,
            lat: originLat,
            lng: originLng,
          },
          destination: activeDestinationRef.current!,
          vehicleType: activeVehicleRef.current,
          emergencyPriority: activePriorityRef.current,
        })
        .then((res) => {
          setResult(res);
          try {
            sessionStorage.setItem('rapidpath_latest_route_result', JSON.stringify(res));
          } catch (e) {
            // ignore
          }
          setLastRefreshTime(new Date());
        })
        .catch((e) => console.warn('Periodic route refresh error:', e));
    }, ROUTE_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [geoState.coords, geoState.address]);

  const routes: NormalizedRoute[] = result?.routes || [];
  const recommendedRoute = routes.find((r) => r.isRecommended) || routes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title & Live Status Area (Requirement 27) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DCE5E9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#112B37] tracking-tight">
              Emergency Route Planner
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#24735B] bg-[#E8F5ED] px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#24735B] animate-pulse" />
              GPS LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#617580] mt-0.5">
            Real-time GPS vehicle tracking, Google Routes API, and Gemini AI emergency corridor analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {lastRefreshTime && (
            <span className="text-[11px] text-[#617580] font-medium hidden sm:inline">
              Updated {lastRefreshTime.toLocaleTimeString()}
            </span>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (activeDestinationRef.current) {
                const originLat = geoState.coords?.lat || 17.4399;
                const originLng = geoState.coords?.lng || 78.4983;
                handlePlanRoute({
                  originAddress: geoState.address,
                  originLat,
                  originLng,
                  destinationAddress: activeDestinationRef.current.address,
                  destinationLat: activeDestinationRef.current.lat,
                  destinationLng: activeDestinationRef.current.lng,
                  vehicleType: currentVehicle,
                  emergencyPriority: currentPriority,
                });
              }
            }}
            disabled={!activeDestinationRef.current || isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Refresh Route & Traffic
          </Button>
        </div>
      </div>

      {/* Active Emergency Banner */}
      <ActiveEmergencyBanner
        vehicleType={currentVehicle}
        priority={currentPriority}
        originText={currentOrigin || geoState.address || 'Locating vehicle...'}
        destinationText={currentDestination || 'Select emergency hospital or destination'}
        statusText={
          isLoading
            ? 'Analyzing Google road corridors...'
            : routes.length > 0
            ? 'Live GPS Dispatch Active'
            : 'Awaiting Destination Selection'
        }
      />

      {/* Main Two-Column Layout (40% Left Controls / 60% Right Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 of 12 cols): Emergency Request Panel & Insights */}
        <div className="lg:col-span-5 space-y-5">
          {/* Emergency Request Panel */}
          <EmergencyRouteForm
            geoState={geoState}
            nearbyHospitals={nearbyHospitals}
            isLoadingHospitals={isLoadingHospitals}
            initialDestination={result?.destination || null}
            onEnableLocation={enableLocation}
            onRefreshHospitals={refreshHospitals}
            onSubmit={handlePlanRoute}
            onHospitalSelect={handleHospitalSelect}
            isLoading={isLoading}
          />

          {/* Potential Delay Hazard Alert */}
          <HazardAlert />

          {/* Route Score Indicator */}
          <RouteScoreCard score={recommendedRoute?.overallScore || 94} />

          {/* Traffic Conditions Card */}
          <TrafficStatusCard />

          {/* AI Delay Prediction Card */}
          <AIDelayPredictionCard />
        </div>

        {/* Right Column (7 of 12 cols): Main Map & Route Analysis Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Map */}
          <EmergencyMap
            currentGps={geoState.coords}
            origin={
              result?.origin ||
              (geoState.coords
                ? { address: geoState.address, lat: geoState.coords.lat, lng: geoState.coords.lng }
                : null)
            }
            destination={result?.destination || null}
            routes={routes}
            nearbyHospitals={nearbyHospitals}
            selectedRouteIndex={selectedRouteIndex}
            onSelectRoute={(idx) => setSelectedRouteIndex(idx)}
            onSelectHospital={handleHospitalSelect}
            className="h-[460px] w-full rounded-xl"
          />

          {/* NEW FEATURE: Get Directions (Open Selected Route in Google Maps) */}
          <GetDirectionsCard
            origin={
              result?.origin ||
              (geoState.coords
                ? { address: geoState.address, lat: geoState.coords.lat, lng: geoState.coords.lng }
                : null)
            }
            destination={
              result?.destination ||
              (activeDestinationRef.current
                ? {
                    address: activeDestinationRef.current.address,
                    lat: activeDestinationRef.current.lat,
                    lng: activeDestinationRef.current.lng,
                  }
                : null)
            }
            selectedRoute={routes[selectedRouteIndex] || recommendedRoute || null}
          />

          {/* AI Recommended Route Card */}
          {recommendedRoute && (
            <RecommendedRouteCard
              route={recommendedRoute}
              aiAnalysis={result?.aiAnalysis || null}
              isAiFallback={result?.isAiFallback || false}
              result={result}
            />
          )}

          {/* Compare Corridors: Route A, Route B, Route C (Only shown when destination selected) */}
          {routes.length > 0 && (
            <RouteComparisonPanel
              routes={routes}
              selectedRouteIndex={selectedRouteIndex}
              onSelectRoute={(idx) => setSelectedRouteIndex(idx)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
