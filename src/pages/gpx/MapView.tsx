import { Fragment, type MutableRefObject } from 'react';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import '../../lib/leaflet-setup.ts';
import type {
  DrawingMode,
  LatLng,
  MarkerItem,
  TrackItem,
} from '../gpx-draw-state.ts';

type MapClickHandlerProps = {
  mode: DrawingMode;
  onAddMarker: (position: LatLng) => void;
  onAddTrackPoint: (position: LatLng) => void;
};

function MapClickHandler({
  mode,
  onAddMarker,
  onAddTrackPoint,
}: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (mode === 'marker') {
        onAddMarker({ lat, lng });
      }
      if (mode === 'track') {
        onAddTrackPoint({ lat, lng });
      }
    },
  });
  return null;
}

type MapViewProps = {
  mode: DrawingMode;
  markers: MarkerItem[];
  tracks: TrackItem[];
  inProgressTrack: { id: string; points: LatLng[] } | null;
  highlightedMarkerId: string | null;
  highlightedTrackId: string | null;
  mapRef: MutableRefObject<L.Map | null>;
  onAddMarker: (position: LatLng) => void;
  onAddTrackPoint: (position: LatLng) => void;
};

export function MapView({
  mode,
  markers,
  tracks,
  inProgressTrack,
  highlightedMarkerId,
  highlightedTrackId,
  mapRef,
  onAddMarker,
  onAddTrackPoint,
}: MapViewProps) {
  return (
    <div className='map-wrapper gpx-map-wrapper'>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        className={`gpx-map ${mode}-mode`}
        style={{ height: '100%', width: '100%' }}
        ref={(map) => {
          if (map) {
            mapRef.current = map;
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        <MapClickHandler
          mode={mode}
          onAddMarker={onAddMarker}
          onAddTrackPoint={onAddTrackPoint}
        />

        {tracks.map((track) => (
          <Polyline
            key={track.id}
            positions={track.points.map((pt) => [pt.lat, pt.lng])}
            pathOptions={{
              color: track.id === highlightedTrackId ? '#ef4444' : '#2563eb',
              weight: track.id === highlightedTrackId ? 6 : 4,
            }}
          >
            <Popup>
              {track.name} ({track.points.length} pts)
            </Popup>
          </Polyline>
        ))}

        {inProgressTrack && (
          <Polyline
            positions={inProgressTrack.points.map((pt) => [pt.lat, pt.lng])}
            pathOptions={{
              color: '#e11d48',
              weight: 3,
              dashArray: '6 6',
            }}
          />
        )}

        {markers.map((marker) => (
          <Fragment key={marker.id}>
            <Marker position={[marker.position.lat, marker.position.lng]}>
              <Popup>{marker.name}</Popup>
            </Marker>
            {highlightedMarkerId === marker.id && (
              <CircleMarker
                center={[marker.position.lat, marker.position.lng]}
                pathOptions={{ color: '#f97316', weight: 2 }}
                radius={12}
              />
            )}
          </Fragment>
        ))}
      </MapContainer>
    </div>
  );
}
