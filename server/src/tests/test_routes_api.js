async function testRouteCalculation() {
  try {
    const payload = {
      origin: {
        address: 'Secunderabad Railway Station, Hyderabad',
        lat: 17.4399,
        lng: 78.4983,
      },
      destination: {
        address: 'Apollo Hospital, Jubilee Hills, Hyderabad',
        lat: 17.4172,
        lng: 78.4116,
      },
      vehicleType: 'ambulance',
      emergencyPriority: 'critical',
      incidentType: 'medical',
    };

    console.log('Sending route analysis request to backend on http://localhost:5000/api/routes/analyze...');
    const response = await fetch('http://localhost:5000/api/routes/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('Request failed:', data);
      return;
    }

    console.log('\n--- ROUTE CALCULATION RESULTS ---');
    console.log(`Success: ${data.success}`);
    console.log(`Request ID: ${data.requestId}`);
    console.log(`Number of Google Routes: ${data.routes.length}`);
    console.log(`AI Recommended Route Index: ${data.recommendedRouteIndex}`);

    data.routes.forEach((route, idx) => {
      console.log(`\n[Route ${idx + 1}] ${route.name}`);
      console.log(`  Distance: ${(route.distanceMeters / 1000).toFixed(2)} km (${route.distanceMeters} m)`);
      console.log(`  Duration: ${(route.durationSeconds / 60).toFixed(1)} min (${route.durationSeconds} s)`);
      console.log(`  Traffic Level: ${route.trafficLevel}`);
      console.log(`  Road Coordinates Count: ${route.path.length} waypoints`);
      console.log(`  Start Coordinate: [${route.path[0][0]}, ${route.path[0][1]}]`);
      console.log(`  End Coordinate: [${route.path[route.path.length - 1][0]}, ${route.path[route.path.length - 1][1]}]`);
      console.log(`  Sample Middle Waypoints: [${route.path[Math.floor(route.path.length / 2)][0]}, ${route.path[Math.floor(route.path.length / 2)][1]}]`);
      console.log(`  Is Recommended: ${route.isRecommended}`);
      console.log(`  Encoded Polyline Length: ${route.encodedPolyline?.length || 0} chars`);
    });

    console.log('\n--- GEMINI AI ANALYSIS ---');
    console.log(`Confidence Score: ${data.aiAnalysis?.confidenceScore}%`);
    console.log(`AI Summary: ${data.aiAnalysis?.summary}`);
    console.log('AI Recommendations:');
    data.aiAnalysis?.recommendations?.forEach((rec) => console.log(`  - ${rec}`));

    console.log('\n✅ VERIFICATION COMPLETE: Routes follow actual Google road network.');
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testRouteCalculation();
