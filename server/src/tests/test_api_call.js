const http = require('http');

const payload = JSON.stringify({
  origin: {
    address: '742 Market St, San Francisco, CA',
    lat: 37.788,
    lng: -122.405
  },
  destination: {
    address: 'Zuckerberg SF General Hospital, San Francisco, CA',
    lat: 37.755,
    lng: -122.404
  },
  vehicleType: 'ambulance',
  emergencyPriority: 'critical',
  incidentType: 'medical',
  notes: 'Severe trauma patient. Requires immediate ER trauma bay arrival.'
});

const req = http.request(
  {
    hostname: 'localhost',
    port: 5000,
    path: '/api/routes/analyze',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      const parsed = JSON.parse(data);
      console.log('Response Success:', parsed.success);
      console.log('Recommended Route ID:', parsed.recommendedRouteId);
      console.log('Recommended Route Index:', parsed.recommendedRouteIndex);
      console.log('Corridors Returned:', parsed.routes.length);
      console.log('Recommended Route Name:', parsed.routes[parsed.recommendedRouteIndex].name);
      console.log('AI Analysis Summary:', parsed.aiAnalysis?.summary);
      console.log('AI Confidence:', parsed.aiAnalysis?.confidenceScore);
      console.log('Deterministic Score:', parsed.routes[parsed.recommendedRouteIndex].overallScore);
      console.log('Reliability Score:', parsed.routes[parsed.recommendedRouteIndex].reliabilityScore);
      process.exit(0);
    });
  }
);

req.on('error', (e) => {
  console.error('API Error:', e.message);
  process.exit(1);
});

req.write(payload);
req.end();
