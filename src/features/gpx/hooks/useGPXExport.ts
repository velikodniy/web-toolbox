import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { BaseBuilder, buildGPX } from 'gpx-builder';
import type { DrawingState } from '../gpx-draw-state.ts';

const { Point, Segment, Track } = BaseBuilder.MODELS;

export function useGPXExport() {
  const buildAndDownloadGPX = useCallback((state: DrawingState) => {
    const gpxBuilder = new BaseBuilder();

    const gpxWaypoints = state.markers.map(
      (wp) => new Point(wp.position.lat, wp.position.lng, { name: wp.name }),
    );
    gpxBuilder.setWayPoints(gpxWaypoints);

    const gpxTracks = state.tracks.map((track) => {
      const segment = new Segment(
        track.points.map((pt) => new Point(pt.lat, pt.lng)),
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
  }, []);

  return buildAndDownloadGPX;
}
