/**
 * Encodes and Decodes Google Polyline format into [lat, lng] coordinate arrays
 */

export function decodePolyline(encoded: string): [number, number][] {
  if (!encoded) return [];
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export function encodePolyline(points: [number, number][]): string {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  const encodeSigned = (num: number): string => {
    let sgn_num = num << 1;
    if (num < 0) {
      sgn_num = ~sgn_num;
    }
    let str = '';
    while (sgn_num >= 0x20) {
      str += String.fromCharCode((0x20 | (sgn_num & 0x1f)) + 63);
      sgn_num >>= 5;
    }
    str += String.fromCharCode(sgn_num + 63);
    return str;
  };

  for (const [lat, lng] of points) {
    const late5 = Math.round(lat * 1e5);
    const lnge5 = Math.round(lng * 1e5);
    encoded += encodeSigned(late5 - prevLat);
    encoded += encodeSigned(lnge5 - prevLng);
    prevLat = late5;
    prevLng = lnge5;
  }

  return encoded;
}
