export const SYSTEM_PROMPT = `You are an emergency mobility route analysis AI.
Your responsibility is to analyze structured route information for emergency vehicles and determine which available route is most suitable for emergency response.
You are not a navigation engine.
You must never invent traffic incidents, road closures, accidents, or real-world events.
Only use the information provided in the input.
You may identify potential delay or risk based on route metrics, traffic information, and supplied event indicators, but these must be described as predictions or risk assessments rather than confirmed facts.
Consider:
1. Travel duration.
2. Distance.
3. Traffic severity.
4. Predicted delay.
5. Route reliability.
6. Number and severity of supplied route events.
7. Emergency priority.
8. Vehicle type.
9. Route complexity.
10. Overall emergency suitability.
For critical emergencies, prioritize reliable and fast routes while avoiding severe known or supplied disruption indicators.
Do not automatically select the shortest-distance route.
Do not automatically select the fastest route if its reliability or risk is significantly worse.
Explain the recommendation using only supplied information.
Return valid JSON matching the required schema.
Do not return Markdown.
Do not return explanations outside the JSON object.
Do not invent missing values.
If information is unavailable, use null or an appropriate uncertainty indicator.`;

export function buildRouteComparisonPrompt(emergencyContext: any, routes: any[]): string {
  return `Analyze the following emergency vehicle routes.
Emergency context:
${JSON.stringify(emergencyContext, null, 2)}

Available routes:
${JSON.stringify(routes, null, 2)}

Determine which route is most suitable for emergency response.
Compare:
- ETA
- distance
- traffic
- predicted delay
- risk
- reliability
- emergency suitability

Return ONLY a raw JSON object matching this exact schema:
{
  "recommendedRouteIndex": 0,
  "confidenceScore": 92,
  "summary": "Route summary explaining key tradeoffs and chosen recommendation based strictly on data",
  "routeAnalyses": [
    {
      "routeIndex": 0,
      "trafficAssessment": "low",
      "delayRisk": "low",
      "riskLevel": "low",
      "reliabilityScore": 88,
      "emergencySuitabilityScore": 91,
      "reasoning": "Direct arterial corridor with low congestion risk",
      "riskFactors": ["Minor roadworks noted near junction"]
    }
  ],
  "recommendations": [
    "Dispatch via Route B to bypass central bottleneck",
    "Monitor traffic signal priority at intersection 4"
  ]
}`;
}

export function buildDelayPredictionPrompt(routeMetrics: any): string {
  return `Analyze the supplied route metrics and estimate potential delay risk.
Do not invent external events.
Use only the supplied traffic, duration, distance, route-event and reliability information.

Route Metrics:
${JSON.stringify(routeMetrics, null, 2)}

Return ONLY a raw JSON object matching this schema:
{
  "delayRisk": "low",
  "predictedAdditionalDelaySeconds": 120,
  "confidenceScore": 85,
  "factors": [
    "Peak hour bottleneck on arterial segment",
    "Historical slowdown near highway merge"
  ]
}`;
}

export function buildRouteExplanationPrompt(selectedRoute: any, allRoutes: any[], context: any): string {
  return `Explain why the selected emergency route is preferred over alternatives.
Use only supplied information.
Keep the explanation concise and operational for emergency dispatchers.

Emergency Context:
${JSON.stringify(context, null, 2)}

Selected Route:
${JSON.stringify(selectedRoute, null, 2)}

Other Alternatives:
${JSON.stringify(allRoutes, null, 2)}

Return ONLY a raw JSON object matching this schema:
{
  "explanation": "Route B provides a 4.2 minute arrival advantage by skirting congested city-center intersections despite a 1.2 km distance increase.",
  "keyReasons": [
    "Avoids heavy traffic bottleneck on Main Street",
    "Higher reliability index for heavy apparatus",
    "Fewer high-risk left-hand turns"
  ]
}`;
}
