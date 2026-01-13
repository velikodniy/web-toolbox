import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FeatureGroup, MapContainer, TileLayer, useMap } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import { FiDownload, FiMap, FiTrash2 } from 'react-icons/fi';
import L from 'leaflet';
import 'leaflet-draw';
import { buildGPX, BaseBuilder } from 'gpx-builder';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { Point, Segment, Track } = BaseBuilder.MODELS;

type Waypoint = { lat: number; lng: number; name: string };
type TrackData = { name: string; points: Array<{ lat: number; lng: number }> };

type DrawControlProps = {
  featureGroup: L.FeatureGroup;
  onCreated: (e: L.DrawEvents.Created) => void;
  onDeleted: (e: L.DrawEvents.Deleted) => void;
};

function DrawControl({ featureGroup, onCreated, onDeleted }: DrawControlProps) {
  const map = useMap();

  useEffect(() => {
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        rectangle: false,
        circle: false,
        circlemarker: false,
        polygon: false,
        polyline: {
          shapeOptions: {
            color: '#e11d48',
            weight: 5,
          },
          icon: new L.DivIcon({
            iconSize: [8, 8],
            className: 'leaflet-div-icon leaflet-editing-icon',
          }),
        },
        marker: true,
      },
      edit: {
        featureGroup: featureGroup,
        remove: true,
        edit: false,
      },
    });

    map.addControl(drawControl);

    const handleCreated = (e: L.DrawEvents.Created) => {
      featureGroup.addLayer(e.layer);
      onCreated(e);
    };

    const handleDeleted = (e: L.DrawEvents.Deleted) => {
      onDeleted(e);
    };

    map.on(L.Draw.Event.CREATED, handleCreated as L.LeafletEventHandlerFn);
    map.on(L.Draw.Event.DELETED, handleDeleted as L.LeafletEventHandlerFn);

    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED, handleCreated as L.LeafletEventHandlerFn);
      map.off(L.Draw.Event.DELETED, handleDeleted as L.LeafletEventHandlerFn);
    };
  }, [map, featureGroup, onCreated, onDeleted]);

  return null;
}

const GPXDrawTool: React.FC = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [tracks, setTracks] = useState<TrackData[]>([]);
  const [featureGroup, setFeatureGroup] = useState<L.FeatureGroup | null>(null);
  const markerCount = useRef(0);
  const trackCount = useRef(0);

  const handleCreated = useCallback((e: L.DrawEvents.Created) => {
    const layer = e.layer;

    if (e.layerType === 'marker') {
      const marker = layer as L.Marker;
      const latlng = marker.getLatLng();
      markerCount.current += 1;
      const name = `Waypoint ${markerCount.current}`;
      setWaypoints((prev) => [...prev, { lat: latlng.lat, lng: latlng.lng, name }]);
      marker.bindPopup(name).openPopup();
    } else if (e.layerType === 'polyline') {
      const polyline = layer as L.Polyline;
      const latlngs = polyline.getLatLngs() as L.LatLng[];
      trackCount.current += 1;
      const name = `Track ${trackCount.current}`;
      const points = latlngs.map((ll) => ({ lat: ll.lat, lng: ll.lng }));
      setTracks((prev) => [...prev, { name, points }]);
      polyline.bindPopup(`${name} (${points.length} points)`).openPopup();
    }
  }, []);

  const handleDeleted = useCallback((e: L.DrawEvents.Deleted) => {
    const layers = e.layers;
    const deletedMarkerLatLngs: string[] = [];
    const deletedPolylinePoints: string[] = [];

    layers.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const ll = layer.getLatLng();
        deletedMarkerLatLngs.push(`${ll.lat},${ll.lng}`);
      } else if (layer instanceof L.Polyline) {
        const latlngs = layer.getLatLngs() as L.LatLng[];
        if (latlngs.length > 0) {
          deletedPolylinePoints.push(`${latlngs[0].lat},${latlngs[0].lng}`);
        }
      }
    });

    setWaypoints((prev) =>
      prev.filter((wp) => !deletedMarkerLatLngs.includes(`${wp.lat},${wp.lng}`))
    );
    setTracks((prev) =>
      prev.filter((tr) => {
        if (tr.points.length === 0) return true;
        return !deletedPolylinePoints.includes(`${tr.points[0].lat},${tr.points[0].lng}`);
      })
    );
  }, []);

  const clearAll = useCallback(() => {
    if (featureGroup) {
      featureGroup.clearLayers();
    }
    setWaypoints([]);
    setTracks([]);
    markerCount.current = 0;
    trackCount.current = 0;
    toast.success('Cleared all drawings');
  }, [featureGroup]);

  const downloadGPX = useCallback(() => {
    const gpxBuilder = new BaseBuilder();

    const gpxWaypoints = waypoints.map(
      (wp) => new Point(wp.lat, wp.lng, { name: wp.name })
    );
    gpxBuilder.setWayPoints(gpxWaypoints);

    const gpxTracks = tracks.map((track) => {
      const segment = new Segment(
        track.points.map((pt) => new Point(pt.lat, pt.lng))
      );
      return new Track([segment], { name: track.name });
    });
    gpxBuilder.setTracks(gpxTracks);

    const gpxString = buildGPX(gpxBuilder.toObject());
    const blob = new Blob([gpxString], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `drawing-${Date.now()}.gpx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('GPX file downloaded!');
  }, [waypoints, tracks]);

  const hasContent = waypoints.length > 0 || tracks.length > 0;

  return (
    <div className='tool-page'>
      <h1>GPX Draw Tool</h1>
      <p className='description'>
        Draw markers and polylines on the map, then export as a GPX file.
      </p>

      <div className='tool-controls' style={{ marginBottom: '1rem' }}>
        <div className='tool-control-group'>
          <FiMap style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {waypoints.length} waypoint{waypoints.length !== 1 ? 's' : ''},{' '}
            {tracks.length} track{tracks.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className='tool-control-group'>
          <button
            type='button'
            className='btn btn-secondary btn-sm'
            onClick={clearAll}
            disabled={!hasContent}
            style={{
              opacity: hasContent ? 1 : 0.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <FiTrash2 /> Clear All
          </button>
          <button
            type='button'
            className='btn btn-sm'
            onClick={downloadGPX}
            disabled={!hasContent}
            style={{
              opacity: hasContent ? 1 : 0.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <FiDownload /> Download GPX
          </button>
        </div>
      </div>

      <div
        className='map-wrapper'
        style={{
          height: '500px',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          position: 'relative',
          zIndex: 0,
        }}
      >
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <FeatureGroup ref={(ref) => { if (ref) setFeatureGroup(ref); }}>
            {featureGroup && (
              <DrawControl
                featureGroup={featureGroup}
                onCreated={handleCreated}
                onDeleted={handleDeleted}
              />
            )}
          </FeatureGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default GPXDrawTool;
