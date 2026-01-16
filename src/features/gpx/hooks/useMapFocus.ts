import { useCallback, useRef } from 'react';
import L from 'leaflet';
import type { MarkerItem, TrackItem } from '../gpx-draw-state.ts';

export function useMapFocus() {
  const mapRef = useRef<L.Map | null>(null);

  const focusMarker = useCallback((marker: MarkerItem) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo(
      [marker.position.lat, marker.position.lng],
      Math.max(
        map.getZoom(),
        15,
      ),
      { duration: 0.35 },
    );
  }, []);

  const focusTrack = useCallback((track: TrackItem) => {
    const map = mapRef.current;
    if (!map || track.points.length === 0) return;
    const bounds = L.latLngBounds(track.points.map((pt) => [pt.lat, pt.lng]));
    if (track.points.length === 1) {
      const [only] = track.points;
      map.flyTo([only.lat, only.lng], Math.max(map.getZoom(), 15), {
        duration: 0.35,
      });
      return;
    }
    map.fitBounds(bounds, { padding: [32, 32] });
  }, []);

  return { mapRef, focusMarker, focusTrack };
}
