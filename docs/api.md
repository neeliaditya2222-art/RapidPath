# RapidPath API Reference

Base URL: `/api`

All endpoints return structured JSON with uniform error handling.

---

## 1. Health & Status

### `GET /api/health`
Returns live subsystem status for Render health checks and monitoring.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-10-08T10:30:00.000Z",
  "services": {
    "database": "connected",
    "geminiAI": "configured",
    "googleMaps": "configured"
  },
  "uptimeSeconds": 142.5
}
```

---

## 2. Route Planning & Optimization

### `POST /api/routes/analyze`
Analyzes multiple candidate corridors between origin and destination with traffic models, vehicle profiles, and Gemini AI reasoning.

**Request Payload:**
```json
{
  "origin": {
    "address": "742 Market St, San Francisco, CA",
    "lat": 37.788,
    "lng": -122.405
  },
  "destination": {
    "address": "Zuckerberg SF General Hospital, San Francisco, CA",
    "lat": 37.755,
    "lng": -122.404
  },
  "vehicleType": "ambulance",
  "emergencyPriority": "critical",
  "incidentType": "medical",
  "notes": "Severe trauma dispatch"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "requestId": "660c1d2e...",
  "recommendedRouteId": "route-uuid-1",
  "recommendedRouteIndex": 0,
  "routes": [
    {
      "id": "route-uuid-1",
      "routeIndex": 0,
      "name": "Express Arterial Corridor",
      "summary": "Direct primary arterial",
      "distanceMeters": 6200,
      "durationSeconds": 516,
      "trafficDurationSeconds": 590,
      "trafficLevel": "low",
      "predictedDelaySeconds": 74,
      "riskLevel": "low",
      "reliabilityScore": 92,
      "emergencyScore": 95,
      "overallScore": 94.2,
      "encodedPolyline": "...",
      "path": [[37.788, -122.405], [37.755, -122.404]],
      "isRecommended": true
    }
  ],
  "aiAnalysis": {
    "recommendedRouteIndex": 0,
    "confidenceScore": 92,
    "summary": "Express Arterial Corridor is prioritized for ambulance response...",
    "recommendations": [
      "Dispatch AMBULANCE along Express Arterial Corridor"
    ]
  },
  "isAiFallback": false,
  "createdAt": "2026-10-08T10:30:00.000Z"
}
```

---

### `POST /api/routes/:requestId/refresh`
Performs controlled live refresh of telemetry without aggressive polling.

---

### `GET /api/routes/history`
Query previous dispatch decisions with pagination and filters.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `vehicleType` (`ambulance` | `fire_engine` | `police` | `rescue` | `other`)
- `emergencyPriority` (`critical` | `high` | `medium` | `low`)
- `search` (string)

---

### `DELETE /api/routes/:requestId`
Deletes a specific dispatch log record with verified operator authorization.

---

## 3. Settings

### `GET /api/settings`
Retrieves operator preferences.

### `PATCH /api/settings`
Updates telemetry refresh interval, default vehicle, sound alerts, and map themes.
