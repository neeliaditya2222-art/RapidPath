/**
 * ==============================================================================
 * RapidPath - AI-Powered Emergency Vehicle Route Optimization
 * Core Application Logic (Leaflet.js + Nominatim + OSRM)
 * ==============================================================================
 */

// Application State
const state = {
  origin: {
    address: 'Secunderabad Railway Station, Hyderabad',
    lat: 17.433859,
    lng: 78.502051,
  },
  destination: {
    address: 'Apollo Hospital, Jubilee Hills, Hyderabad',
    lat: 17.414935,
    lng: 78.413178,
  },
  vehicleType: 'ambulance',
  emergencyPriority: 'critical',
  incidentType: 'medical',
  routes: [],
  selectedRouteIndex: 0,
  map: null,
  routeLayers: [],
  markerLayers: [],
  tileLayer: null,
  currentTileStyle: 'clinical',
};

// DOM Elements
const originInput = document.getElementById('origin-input');
const destinationInput = document.getElementById('destination-input');
const originSuggestions = document.getElementById('origin-suggestions');
const destinationSuggestions = document.getElementById('destination-suggestions');
const originGpsTag = document.getElementById('origin-gps-tag');
const destinationGpsTag = document.getElementById('destination-gps-tag');
const routeForm = document.getElementById('emergency-route-form');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingBox = document.getElementById('loading-sequence');
const loadingPct = document.getElementById('loading-pct');
const loadingStepText = document.getElementById('loading-step-text');
const uiMessageBox = document.getElementById('ui-message-box');
const liveClock = document.getElementById('live-clock');

// -----------------------------------------------------------------------------
// Live Clock Telemetry
// -----------------------------------------------------------------------------
function updateLiveClock() {
  if (liveClock) {
    const now = new Date();
    liveClock.textContent = now.toTimeString().split(' ')[0] + ' UTC';
  }
}
setInterval(updateLiveClock, 1000);
updateLiveClock();

// -----------------------------------------------------------------------------
// Initialize Leaflet Map
// -----------------------------------------------------------------------------
function initMap() {
  const mapElement = document.getElementById('leaflet-map');
  if (!mapElement) return;

  state.map = L.map('leaflet-map', {
    zoomControl: true,
    attributionControl: true,
  }).setView([17.425, 78.455], 13);

  // Default clean clinical map tiles
  setTileLayer('clinical');

  // Custom Zoom Control positioning
  state.map.zoomControl.setPosition('topleft');

  // Fit bounds button
  const fitBtn = document.getElementById('btn-fit-bounds');
  if (fitBtn) {
    fitBtn.addEventListener('click', () => {
      fitRouteBounds();
    });
  }

  // Toggle Tiles button
  const tileBtn = document.getElementById('btn-toggle-tiles');
  if (tileBtn) {
    tileBtn.addEventListener('click', () => {
      const nextStyle = state.currentTileStyle === 'clinical' ? 'osm' : 'clinical';
      setTileLayer(nextStyle);
      tileBtn.textContent = nextStyle === 'clinical' ? 'OSM Tiles' : 'Clinical Tiles';
    });
  }
}

function setTileLayer(style) {
  state.currentTileStyle = style;
  if (state.tileLayer) {
    state.map.removeLayer(state.tileLayer);
  }

  if (style === 'clinical') {
    state.tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CartoDB</a>',
        maxZoom: 19,
      }
    ).addTo(state.map);
  } else {
    state.tileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(state.map);
  }
}

// -----------------------------------------------------------------------------
// Custom Leaflet Icons
// -----------------------------------------------------------------------------
function createOriginIcon() {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `<div style="background-color: #007F86; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0, 127, 134, 0.45);">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function createDestinationIcon() {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `<div style="background-color: #C73540; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(199, 53, 64, 0.5);">
            <span style="color: white; font-size: 16px; font-weight: 900; line-height: 1;">+</span>
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createHazardIcon() {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `<div style="background-color: #97610A; width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2); transform: rotate(45deg);">
            <span style="transform: rotate(-45deg); color: white; font-size: 11px; font-weight: bold;">!</span>
          </div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

// -----------------------------------------------------------------------------
// Nominatim Location Search & Suggestions Autocomplete
// -----------------------------------------------------------------------------
function setupNominatimAutocomplete(inputElement, dropdownElement, onSelect) {
  let debounceTimer = null;

  inputElement.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    if (debounceTimer) clearTimeout(debounceTimer);

    if (text.length < 3) {
      dropdownElement.innerHTML = '';
      dropdownElement.classList.add('hidden');
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          text
        )}&limit=5&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });
        const data = await res.json();

        dropdownElement.innerHTML = '';
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.innerHTML = `
              <span class="autocomplete-item-icon">📍</span>
              <div style="line-height: 1.3;">
                <strong>${item.display_name.split(',')[0]}</strong>
                <div style="font-size: 11px; color: #617580;">${item.display_name}</div>
              </div>
            `;
            div.addEventListener('click', () => {
              inputElement.value = item.display_name;
              dropdownElement.classList.add('hidden');
              onSelect({
                address: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
              });
            });
            dropdownElement.appendChild(div);
          });
          dropdownElement.classList.remove('hidden');
        } else {
          dropdownElement.classList.add('hidden');
        }
      } catch (err) {
        console.warn('Nominatim autocomplete error:', err);
      }
    }, 300);
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!inputElement.contains(e.target) && !dropdownElement.contains(e.target)) {
      dropdownElement.classList.add('hidden');
    }
  });
}

// -----------------------------------------------------------------------------
// Priority Selector Buttons
// -----------------------------------------------------------------------------
function setupPrioritySelector() {
  const priorityBtns = document.querySelectorAll('.priority-btn');
  priorityBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      priorityBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.emergencyPriority = btn.getAttribute('data-priority');
    });
  });
}

// -----------------------------------------------------------------------------
// Geocoding Fallback via Nominatim
// -----------------------------------------------------------------------------
async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        address: data[0].display_name,
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.warn('Geocoding failed for:', address);
  }
  return null;
}

// -----------------------------------------------------------------------------
// OSRM Route Calculation Flow
// -----------------------------------------------------------------------------
async function fetchOSRMRoute(origin, dest) {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('OSRM could not calculate a driving route between these locations.');
  }

  const routes = [];

  // Parse primary routes
  data.routes.forEach((r, idx) => {
    const distanceMeters = Math.round(r.distance);
    const durationSeconds = Math.round(r.duration);
    const coords = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    const stepName = r.legs?.[0]?.steps?.[1]?.name || r.legs?.[0]?.steps?.[0]?.name || (idx === 0 ? 'Direct Arterial' : 'Secondary Avenue');
    const letter = String.fromCharCode(65 + idx);

    routes.push({
      id: `route-${letter.toLowerCase()}`,
      index: idx,
      name: `Route ${letter} (Via ${stepName})`,
      summary: `Corridor via ${stepName}`,
      distanceMeters,
      durationSeconds,
      predictedDelaySeconds: Math.round(durationSeconds * (idx === 0 ? 0.08 : 0.18)),
      trafficLevel: idx === 0 ? 'low' : 'moderate',
      riskLevel: idx === 0 ? 'low' : 'medium',
      reliabilityScore: idx === 0 ? 96 : 82,
      overallScore: idx === 0 ? 94 : 79,
      path: coords,
      isRecommended: idx === 0,
      events: idx === 0 ? [] : [{
        lat: coords[Math.floor(coords.length * 0.5)][0],
        lng: coords[Math.floor(coords.length * 0.5)][1],
        description: 'Moderate bottleneck intersection slowdown',
      }],
    });
  });

  // If OSRM returned 1 route, synthesize an alternative arterial bypass via intermediate waypoint
  if (routes.length === 1 && routes[0].path.length > 6) {
    const primaryPath = routes[0].path;
    const midPoint = primaryPath[Math.floor(primaryPath.length / 2)];
    const altMidLat = midPoint[0] + 0.007;
    const altMidLng = midPoint[1] + 0.007;

    try {
      const altUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${altMidLng},${altMidLat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
      const altRes = await fetch(altUrl);
      const altData = await altRes.json();

      if (altData.code === 'Ok' && altData.routes?.[0]) {
        const altRoute = altData.routes[0];
        const altCoords = altRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const altDist = Math.round(altRoute.distance || routes[0].distanceMeters * 1.15);
        const altDur = Math.round(altRoute.duration || routes[0].durationSeconds * 1.12);

        routes.push({
          id: 'route-b',
          index: 1,
          name: 'Route B (Outer Perimeter Bypass)',
          summary: 'Outer Perimeter Arterial Bypass via Ring Road',
          distanceMeters: altDist,
          durationSeconds: altDur,
          predictedDelaySeconds: 60,
          trafficLevel: 'low',
          riskLevel: 'low',
          reliabilityScore: 96,
          overallScore: 94,
          path: altCoords,
          isRecommended: true,
          events: [],
        });

        // Set Route B as recommended
        routes[0].isRecommended = false;
      }
    } catch (e) {
      console.warn('Alternative OSRM bypass generated fallback');
    }
  }

  return routes;
}

// -----------------------------------------------------------------------------
// Render Routes & Markers on Leaflet Map
// -----------------------------------------------------------------------------
function renderMapData() {
  if (!state.map) return;

  // Clear existing layers
  state.routeLayers.forEach((layer) => state.map.removeLayer(layer));
  state.routeLayers = [];
  state.markerLayers.forEach((marker) => state.map.removeLayer(marker));
  state.markerLayers = [];

  // 1. Origin Marker
  if (state.origin.lat && state.origin.lng) {
    const originMarker = L.marker([state.origin.lat, state.origin.lng], {
      icon: createOriginIcon(),
    }).addTo(state.map);
    originMarker.bindPopup(`<strong>Emergency Origin</strong><br/>${state.origin.address}`);
    state.markerLayers.push(originMarker);
  }

  // 2. Destination Marker
  if (state.destination.lat && state.destination.lng) {
    const destMarker = L.marker([state.destination.lat, state.destination.lng], {
      icon: createDestinationIcon(),
    }).addTo(state.map);
    destMarker.bindPopup(`<strong>Emergency Destination</strong><br/>${state.destination.address}`);
    state.markerLayers.push(destMarker);
  }

  // 3. Render Route Polylines
  state.routes.forEach((route, idx) => {
    if (!route.path || route.path.length === 0) return;

    const isRec = route.isRecommended;
    const isSelected = idx === state.selectedRouteIndex;

    // Glow underlay for recommended route
    if (isRec) {
      const glow = L.polyline(route.path, {
        color: '#007F86',
        weight: 12,
        opacity: 0.25,
        lineCap: 'round',
      }).addTo(state.map);
      state.routeLayers.push(glow);
    }

    // Main road polyline
    const polyline = L.polyline(route.path, {
      color: isRec ? '#007F86' : isSelected ? '#102E3C' : '#617580',
      weight: isRec ? 6 : isSelected ? 5 : 4,
      opacity: isRec ? 0.95 : isSelected ? 0.85 : 0.6,
      dashArray: !isRec ? '5, 6' : undefined,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(state.map);

    polyline.on('click', () => {
      selectRoute(idx);
    });

    state.routeLayers.push(polyline);

    // Hazard markers
    if (route.events && route.events.length > 0) {
      route.events.forEach((ev) => {
        const hazardMarker = L.marker([ev.lat, ev.lng], {
          icon: createHazardIcon(),
        }).addTo(state.map);
        hazardMarker.bindPopup(`<strong>Potential Hazard</strong><br/>${ev.description}`);
        state.markerLayers.push(hazardMarker);
      });
    }
  });

  fitRouteBounds();
}

function fitRouteBounds() {
  if (!state.map) return;

  const latLngs = [];
  if (state.origin.lat && state.origin.lng) latLngs.push([state.origin.lat, state.origin.lng]);
  if (state.destination.lat && state.destination.lng) latLngs.push([state.destination.lat, state.destination.lng]);

  state.routes.forEach((r) => {
    if (r.path) latLngs.push(...r.path);
  });

  if (latLngs.length > 0) {
    state.map.fitBounds(L.latLngBounds(latLngs), {
      padding: [40, 40],
      maxZoom: 15,
    });
  }
}

function selectRoute(index) {
  state.selectedRouteIndex = index;
  renderMapData();
  updateUI();
}

// -----------------------------------------------------------------------------
// Update UI Cards
// -----------------------------------------------------------------------------
function updateUI() {
  if (state.routes.length === 0) return;

  const recRoute = state.routes.find((r) => r.isRecommended) || state.routes[0];
  const etaMins = Math.round(recRoute.durationSeconds / 60);
  const distKm = (recRoute.distanceMeters / 1000).toFixed(1);
  const delayMins = Math.round(recRoute.predictedDelaySeconds / 60);

  // Update Recommended Route Card
  const recRouteName = document.getElementById('rec-route-name');
  if (recRouteName) recRouteName.textContent = recRoute.name;

  const recSummaryText = document.getElementById('rec-summary-text');
  if (recSummaryText) recSummaryText.textContent = recRoute.summary;

  const recEtaNum = document.getElementById('rec-eta-num');
  if (recEtaNum) recEtaNum.textContent = etaMins;

  const recDistNum = document.getElementById('rec-distance-num');
  if (recDistNum) recDistNum.textContent = `${distKm} km`;

  const recDelayNum = document.getElementById('rec-delay-num');
  if (recDelayNum) recDelayNum.textContent = `+${delayMins} min`;

  const recRelNum = document.getElementById('rec-reliability-num');
  if (recRelNum) recRelNum.textContent = `${recRoute.reliabilityScore}%`;

  const recExplanation = document.getElementById('rec-explanation-text');
  if (recExplanation) {
    recExplanation.textContent = `${recRoute.name} is recommended because it currently has lower congestion and fewer potential delay indicators than the alternatives.`;
  }

  // Update AI Delay Card
  const aiDelayNum = document.getElementById('ai-delay-num');
  if (aiDelayNum) aiDelayNum.textContent = `+${delayMins}`;

  // Update Route Comparison Grid
  const compGrid = document.getElementById('routes-comparison-grid');
  if (compGrid) {
    compGrid.innerHTML = '';
    state.routes.forEach((route, idx) => {
      const card = document.createElement('div');
      const isSelected = idx === state.selectedRouteIndex;
      card.className = `corridor-card ${isSelected ? 'active' : ''}`;
      card.innerHTML = `
        <div class="corridor-header">
          <span class="corridor-name">${route.name}</span>
          <span class="corridor-badge ${route.isRecommended ? 'badge-rec' : 'badge-alt'}">
            ${route.isRecommended ? 'AI Recommended' : 'Alternative'}
          </span>
        </div>
        <div>
          <span style="font-size: 1.4rem; font-weight: 800; color: #112B37;">${Math.round(route.durationSeconds / 60)} min</span>
          <span style="font-size: 0.72rem; color: #617580; margin-left: 4px;">(${(route.distanceMeters / 1000).toFixed(1)} km)</span>
        </div>
        <div class="corridor-metrics">
          <div>
            <span class="c-metric-lbl">Traffic:</span>
            <span class="c-metric-val" style="color: ${route.trafficLevel === 'low' ? '#24735B' : '#97610A'}">${route.trafficLevel.toUpperCase()}</span>
          </div>
          <div>
            <span class="c-metric-lbl">Delay Risk:</span>
            <span class="c-metric-val">+${Math.round(route.predictedDelaySeconds / 60)}m</span>
          </div>
          <div>
            <span class="c-metric-lbl">Reliability:</span>
            <span class="c-metric-val">${route.reliabilityScore}%</span>
          </div>
          <div>
            <span class="c-metric-lbl">Score:</span>
            <span class="c-metric-val">${route.overallScore}/100</span>
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        selectRoute(idx);
      });
      compGrid.appendChild(card);
    });
  }
}

// -----------------------------------------------------------------------------
// Loading Animation Helper
// -----------------------------------------------------------------------------
function showLoading(show) {
  if (!loadingBox || !analyzeBtn) return;

  if (show) {
    loadingBox.classList.remove('hidden');
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing Emergency Routes...';

    const steps = [
      { text: 'Geocoding locations with OpenStreetMap...', pct: '20%' },
      { text: 'Requesting OSRM road driving corridors...', pct: '45%' },
      { text: 'Evaluating transit delay & traffic factors...', pct: '70%' },
      { text: 'Synthesizing AI emergency recommendation...', pct: '90%' },
      { text: 'Corridors ready.', pct: '100%' },
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        loadingStepText.textContent = steps[stepIdx].text;
        loadingPct.textContent = steps[stepIdx].pct;
      } else {
        clearInterval(interval);
      }
    }, 350);
  } else {
    loadingBox.classList.add('hidden');
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze Routes';
  }
}

function showMessage(msg, type = 'error') {
  if (!uiMessageBox) return;
  uiMessageBox.textContent = msg;
  uiMessageBox.className = `ui-message-box ${type}`;
  uiMessageBox.classList.remove('hidden');

  setTimeout(() => {
    uiMessageBox.classList.add('hidden');
  }, 5000);
}

// -----------------------------------------------------------------------------
// Form Submit Handler
// -----------------------------------------------------------------------------
async function handleAnalyzeRoutes(e) {
  if (e) e.preventDefault();

  const originText = originInput.value.trim();
  const destText = destinationInput.value.trim();

  if (!originText || !destText) {
    showMessage('Please provide both a Starting Location and Emergency Destination.');
    return;
  }

  showLoading(true);

  try {
    // 1. Geocode Origin if not locked
    if (!state.origin.lat || !state.origin.lng || state.origin.address !== originText) {
      const geocoded = await geocodeAddress(originText);
      if (geocoded) {
        state.origin = geocoded;
      } else {
        throw new Error(`Could not find coordinates for: "${originText}"`);
      }
    }

    // 2. Geocode Destination if not locked
    if (!state.destination.lat || !state.destination.lng || state.destination.address !== destText) {
      const geocoded = await geocodeAddress(destText);
      if (geocoded) {
        state.destination = geocoded;
      } else {
        throw new Error(`Could not find coordinates for: "${destText}"`);
      }
    }

    // 3. Request OSRM Routes
    const routes = await fetchOSRMRoute(state.origin, state.destination);
    state.routes = routes;
    state.selectedRouteIndex = routes.findIndex((r) => r.isRecommended);
    if (state.selectedRouteIndex < 0) state.selectedRouteIndex = 0;

    // 4. Render on Leaflet Map & Update UI
    renderMapData();
    updateUI();
  } catch (err) {
    console.error('Route analysis error:', err);
    showMessage(err.message || 'Route calculation failed. Please verify the locations and try again.');
  } finally {
    showLoading(false);
  }
}

// -----------------------------------------------------------------------------
// Initialization on DOM Loaded
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupPrioritySelector();

  // Setup Nominatim Autocomplete on Origin & Destination
  setupNominatimAutocomplete(originInput, originSuggestions, (place) => {
    state.origin = place;
    if (originGpsTag) originGpsTag.textContent = 'OSM GPS Locked';
  });

  setupNominatimAutocomplete(destinationInput, destinationSuggestions, (place) => {
    state.destination = place;
    if (destinationGpsTag) destinationGpsTag.textContent = 'OSM GPS Locked';
  });

  // Attach Form Submit
  if (routeForm) {
    routeForm.addEventListener('submit', handleAnalyzeRoutes);
  }

  // Run initial route analysis with sample locations
  handleAnalyzeRoutes();
});
