import { logger } from '../../utils/logger';
import { LocationPoint, NormalizedRoute, RouteSegment, VehicleType, EmergencyPriority } from '../../types';
import { DeterministicScoringEngine } from '../scoring/deterministicScoring';
import { encodePolyline } from '../../utils/polyline';
import { v4 as uuidv4 } from 'uuid';

export class OSRMRoutingService {
  private userAgent = 'RapidPath-Emergency-Route-Optimizer/1.0';

  /**
   * Geocodes an address string to lat/lng coordinates using OpenStreetMap Nominatim
   */
  public async geocodeAddress(address: string): Promise<LocationPoint> {
    if (!address || address.trim().length === 0) {
      return { address: 'Secunderabad, Hyderabad', lat: 17.4399, lng: 78.4983 };
    }

    try {
      logger.info(`Geocoding address via OpenStreetMap Nominatim: "${address}"`);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim HTTP ${response.status}`);
      }

      const data: any = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        return {
          address: item.display_name || address,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          placeId: String(item.place_id || item.osm_id || ''),
        };
      }

      logger.warn(`No Nominatim geocoding result for "${address}". Using Hyderabad fallback.`);
      return { address, lat: 17.3850, lng: 78.4867 };
    } catch (error: any) {
      logger.error(`Nominatim geocoding error: ${error?.message || error}`);
      return { address, lat: 17.3850, lng: 78.4867 };
    }
  }

  /**
   * Fetches road-accurate driving routes using Open Source Routing Machine (OSRM)
   */
  public async getRoutes(
    origin: LocationPoint,
    destination: LocationPoint,
    vehicleType: VehicleType,
    emergencyPriority: EmergencyPriority,
    incidentType?: string
  ): Promise<NormalizedRoute[]> {
    try {
      logger.info(
        `Requesting OSRM driving routes from [${origin.lat}, ${origin.lng}] to [${destination.lat}, ${destination.lng}]`
      );

      // Primary OSRM Route Query
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;

      const response = await fetch(osrmUrl, {
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      const data: any = await response.json();

      if (!response.ok || data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(`OSRM routing failed: ${data.message || data.code || 'No route found'}`);
      }

      const osrmRoutes: any[] = data.routes;
      logger.info(`OSRM returned ${osrmRoutes.length} route(s)`);

      const normalizedRoutes: NormalizedRoute[] = [];

      // Process primary OSRM routes
      osrmRoutes.forEach((oRoute: any, idx: number) => {
        const distanceMeters = Math.round(oRoute.distance || 0);
        const durationSeconds = Math.round(oRoute.duration || 0);
        const trafficDurationSeconds = Math.round(durationSeconds * (idx === 0 ? 1.08 : 1.15));

        // GeoJSON coordinates in OSRM are [lng, lat], convert to [lat, lng] for Leaflet
        const coordinates: [number, number][] = (oRoute.geometry?.coordinates || []).map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

        const leg = oRoute.legs?.[0] || {};
        const steps = leg.steps || [];
        const corridorName = steps[1]?.name || steps[0]?.name || (idx === 0 ? 'Direct Arterial' : `Secondary Corridor ${idx + 1}`);

        const segments: RouteSegment[] = steps.map((step: any, stepIdx: number) => {
          const stepDist = Math.round(step.distance || 0);
          const stepDur = Math.round(step.duration || 0);
          const segStart = step.maneuver?.location
            ? { lat: step.maneuver.location[1], lng: step.maneuver.location[0] }
            : { lat: origin.lat, lng: origin.lng };

          const instruction = step.maneuver?.type
            ? `${step.maneuver.type} ${step.name ? 'onto ' + step.name : ''}`
            : `Proceed along ${step.name || 'corridor'}`;

          return {
            start: segStart,
            end: segStart,
            distanceMeters: stepDist,
            durationSeconds: stepDur,
            trafficLevel: 'low' as const,
            roadName: step.name || corridorName,
            instruction,
          };
        });

        const scoreResult = DeterministicScoringEngine.calculateScores({
          routeIndex: idx,
          distanceMeters,
          durationSeconds,
          trafficDurationSeconds,
          vehicleType,
          emergencyPriority,
          events: [],
          segments,
        });

        const routeLetter = String.fromCharCode(65 + idx);
        const name = `Route ${routeLetter} (Via ${corridorName})`;
        const summary = `${corridorName} Emergency Corridor`;

        normalizedRoutes.push({
          id: uuidv4(),
          routeIndex: idx,
          name,
          summary,
          distanceMeters,
          durationSeconds,
          trafficDurationSeconds,
          trafficLevel: scoreResult.trafficLevel,
          predictedDelaySeconds: scoreResult.predictedDelaySeconds,
          riskLevel: scoreResult.riskLevel,
          reliabilityScore: scoreResult.reliabilityScore,
          emergencyScore: scoreResult.emergencyScore,
          overallScore: scoreResult.overallScore,
          encodedPolyline: encodePolyline(coordinates),
          path: coordinates,
          segments,
          events: [],
          warnings: scoreResult.warnings,
          isRecommended: false,
        });
      });

      // If OSRM returned only 1 route, synthesize an alternative arterial bypass via intermediate waypoint
      if (normalizedRoutes.length === 1) {
        const primaryPath = normalizedRoutes[0].path;
        if (primaryPath.length > 4) {
          const midPoint = primaryPath[Math.floor(primaryPath.length / 2)];
          const altMidLat = midPoint[0] + 0.008;
          const altMidLng = midPoint[1] + 0.008;

          try {
            const altOsrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${altMidLng},${altMidLat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
            const altRes = await fetch(altOsrmUrl, { headers: { 'User-Agent': this.userAgent } });
            const altData: any = await altRes.json();

            if (altData.code === 'Ok' && altData.routes?.[0]) {
              const altRoute = altData.routes[0];
              const altCoords: [number, number][] = (altRoute.geometry?.coordinates || []).map(
                ([lng, lat]: [number, number]) => [lat, lng]
              );
              const altDist = Math.round(altRoute.distance || normalizedRoutes[0].distanceMeters * 1.15);
              const altDur = Math.round(altRoute.duration || normalizedRoutes[0].durationSeconds * 1.12);

              const altScore = DeterministicScoringEngine.calculateScores({
                routeIndex: 1,
                distanceMeters: altDist,
                durationSeconds: altDur,
                trafficDurationSeconds: Math.round(altDur * 1.05),
                vehicleType,
                emergencyPriority,
                events: [],
                segments: [],
              });

              normalizedRoutes.push({
                id: uuidv4(),
                routeIndex: 1,
                name: 'Route B (Outer Perimeter Bypass)',
                summary: 'Circumferential bypass with high corridor reliability',
                distanceMeters: altDist,
                durationSeconds: altDur,
                trafficDurationSeconds: Math.round(altDur * 1.05),
                trafficLevel: altScore.trafficLevel,
                predictedDelaySeconds: altScore.predictedDelaySeconds,
                riskLevel: altScore.riskLevel,
                reliabilityScore: Math.min(98, altScore.reliabilityScore + 4),
                emergencyScore: altScore.emergencyScore,
                overallScore: altScore.overallScore + 2,
                encodedPolyline: encodePolyline(altCoords),
                path: altCoords,
                segments: [],
                events: [],
                warnings: [],
                isRecommended: false,
              });
            }
          } catch (altErr) {
            logger.warn('Alternative OSRM corridor fetch skipped');
          }
        }
      }

      // Mark the highest scored route as recommended
      let bestIdx = 0;
      let maxScore = -1;
      normalizedRoutes.forEach((r, i) => {
        if (r.overallScore > maxScore) {
          maxScore = r.overallScore;
          bestIdx = i;
        }
      });
      normalizedRoutes.forEach((r, i) => {
        r.isRecommended = i === bestIdx;
      });

      return normalizedRoutes;
    } catch (error: any) {
      logger.error(`OSRM route calculation error: ${error?.message || error}`);
      throw error;
    }
  }
}

export const osrmRoutingService = new OSRMRoutingService();
