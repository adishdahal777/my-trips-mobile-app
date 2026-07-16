import React, { useMemo } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

export interface OsmStop {
  id: string;
  lat: number;
  lng: number;
  color?: string;
  label?: string;
}

interface OsmMapViewProps {
  stops: OsmStop[];
  center?: { lat: number; lng: number };
  strokeColor?: string;
  colorMap?: Record<string, string>;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_COLOR_MAP: Record<string, string> = { green: "#22C55E", blue: "#6366F1", coral: "#FF6B6B" };

function buildHtml(stops: OsmStop[], center: { lat: number; lng: number } | undefined, strokeColor: string, colorMap: Record<string, string>, interactive: boolean) {
  const points = stops.map((s) => [s.lat, s.lng]);
  const markers = stops.map((s) => ({
    lat: s.lat,
    lng: s.lng,
    label: s.label ?? "",
    color: colorMap[s.color ?? ""] ?? colorMap.blue,
  }));

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .stop-marker { width: 28px; height: 28px; border-radius: 14px; border: 2.5px solid #fff; display: flex;
      align-items: center; justify-content: center; color: #fff; font-family: sans-serif; font-weight: 700;
      font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .me-marker { width: 16px; height: 16px; border-radius: 8px; background: #2563EB; border: 3px solid #fff;
      box-shadow: 0 0 0 4px rgba(37,99,235,0.25); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const points = ${JSON.stringify(points)};
    const markers = ${JSON.stringify(markers)};
    const center = ${JSON.stringify(center ?? null)};
    const map = L.map('map', {
      zoomControl: ${interactive},
      dragging: ${interactive},
      scrollWheelZoom: ${interactive},
      doubleClickZoom: ${interactive},
      touchZoom: ${interactive},
      boxZoom: false,
      keyboard: false,
    });
    L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png', { maxZoom: 19 }).addTo(map);

    if (points.length > 0) {
      if (points.length > 1) {
        const straightLine = L.polyline(points, { color: '${strokeColor}', weight: 3, opacity: 0.6, dashArray: '2,8' }).addTo(map);
        map.fitBounds(points, { padding: [30, 30] });

        const coordsStr = points.map((p) => p[1] + ',' + p[0]).join(';');
        fetch('https://router.project-osrm.org/route/v1/driving/' + coordsStr + '?overview=full&geometries=geojson')
          .then((r) => r.json())
          .then((data) => {
            const route = data.routes && data.routes[0];
            if (!route) return;
            const routeCoords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
            map.removeLayer(straightLine);
            L.polyline(routeCoords, { color: '${strokeColor}', weight: 4 }).addTo(map);
            map.fitBounds(routeCoords, { padding: [30, 30] });
          })
          .catch(() => {});
      } else {
        map.setView(points[0], 13);
      }
      markers.forEach((m) => {
        const icon = L.divIcon({
          className: '',
          html: '<div class="stop-marker" style="background:' + m.color + '">' + m.label + '</div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([m.lat, m.lng], { icon }).addTo(map);
      });
    } else if (center) {
      map.setView([center.lat, center.lng], 13);
      L.marker([center.lat, center.lng], {
        icon: L.divIcon({ className: '', html: '<div class="me-marker"></div>', iconSize: [16, 16], iconAnchor: [8, 8] }),
      }).addTo(map);
    } else {
      map.setView([27.7, 85.3], 3);
    }
  </script>
</body>
</html>`;
}

export function OsmMapView({ stops, center, strokeColor = "#6366F1", colorMap, scrollEnabled = true, zoomEnabled = true, style }: OsmMapViewProps) {
  const html = useMemo(
    () => buildHtml(stops, center, strokeColor, { ...DEFAULT_COLOR_MAP, ...colorMap }, scrollEnabled || zoomEnabled),
    [stops, center, strokeColor, colorMap, scrollEnabled, zoomEnabled]
  );

  return (
    <WebView
      style={style}
      source={{ html }}
      scrollEnabled={false}
      overScrollMode="never"
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={["*"]}
    />
  );
}
