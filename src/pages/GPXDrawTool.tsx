import React, { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiDownload, FiTrash2 } from 'react-icons/fi';
import {
  addMarker,
  addTrackPoint,
  createInitialState,
  deleteMarker,
  deleteTrack,
  type DrawingState,
  finalizeTrack,
  renameMarker,
  renameTrack,
  setMode,
} from './gpx-draw-state.ts';
import { useGPXExport } from '../hooks/useGPXExport.ts';
import { useMapFocus } from '../hooks/useMapFocus.ts';
import { ModeSwitch } from './gpx/ModeSwitch.tsx';
import { MapView } from './gpx/MapView.tsx';
import { GPXSidebar } from './gpx/GPXSidebar.tsx';

const GPXDrawTool: React.FC = () => {
  const [state, setState] = useState<DrawingState>(createInitialState);
  const [highlightedMarkerId, setHighlightedMarkerId] = useState<string | null>(
    null,
  );
  const [highlightedTrackId, setHighlightedTrackId] = useState<string | null>(
    null,
  );

  const { mapRef, focusMarker, focusTrack } = useMapFocus();
  const buildAndDownloadGPX = useGPXExport();

  const hasContent = state.markers.length > 0 ||
    state.tracks.length > 0 ||
    (state.inProgressTrack?.points.length ?? 0) >= 2;

  const changeMode = useCallback((mode: typeof state.mode) => {
    setState((prev) => {
      const leavingTrack = prev.mode === 'track' && mode !== 'track';
      const hadCompletableTrack = leavingTrack &&
        !!prev.inProgressTrack &&
        prev.inProgressTrack.points.length >= 2;
      const next = setMode(prev, mode);
      const trackAdded = next.tracks.length > prev.tracks.length;
      if (leavingTrack && hadCompletableTrack && trackAdded) {
        toast.success('Track finished');
      }
      return next;
    });
  }, []);

  const handleAddMarker = useCallback(
    (position: { lat: number; lng: number }) => {
      setState((prev) => addMarker(prev, position));
    },
    [],
  );

  const handleAddTrackPoint = useCallback(
    (position: { lat: number; lng: number }) => {
      setState((prev) => addTrackPoint(prev, position));
    },
    [],
  );

  const handleFocusMarker = useCallback((marker: typeof state.markers[0]) => {
    setHighlightedMarkerId(marker.id);
    setHighlightedTrackId(null);
    focusMarker(marker);
  }, [focusMarker]);

  const handleFocusTrack = useCallback((track: typeof state.tracks[0]) => {
    setHighlightedTrackId(track.id);
    setHighlightedMarkerId(null);
    focusTrack(track);
  }, [focusTrack]);

  const handleFinishTrack = useCallback(() => {
    setState((prev) => {
      if (!prev.inProgressTrack) {
        toast.error('Add points to finish a track');
        return prev;
      }
      if (prev.inProgressTrack.points.length < 2) {
        toast.error('Add at least two points to finish a track');
        return prev;
      }
      const next = finalizeTrack(prev);
      const trackAdded = next.tracks.length > prev.tracks.length;
      if (trackAdded) {
        toast.success('Track finished');
      }
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setState(createInitialState());
    setHighlightedMarkerId(null);
    setHighlightedTrackId(null);
    toast.success('Cleared all drawings');
  }, []);

  const handleDownload = useCallback(() => {
    setState((prev) => {
      const finalized = finalizeTrack(prev);
      if (
        finalized.markers.length === 0 &&
        finalized.tracks.length === 0
      ) {
        toast.error('Add markers or tracks before exporting');
        return finalized;
      }
      buildAndDownloadGPX(finalized);
      return finalized;
    });
  }, [buildAndDownloadGPX]);

  const handleRenameMarker = useCallback((markerId: string, name: string) => {
    setState((prev) => renameMarker(prev, markerId, name));
  }, []);

  const handleRenameTrack = useCallback((trackId: string, name: string) => {
    setState((prev) => renameTrack(prev, trackId, name));
  }, []);

  const handleDeleteMarker = useCallback((markerId: string) => {
    setState((prev) => deleteMarker(prev, markerId));
    if (highlightedMarkerId === markerId) {
      setHighlightedMarkerId(null);
    }
  }, [highlightedMarkerId]);

  const handleDeleteTrack = useCallback((trackId: string) => {
    setState((prev) => deleteTrack(prev, trackId));
    if (highlightedTrackId === trackId) {
      setHighlightedTrackId(null);
    }
  }, [highlightedTrackId]);

  return (
    <div className='tool-page'>
      <h1>GPX Draw Tool</h1>
      <p className='description'>
        Draw GPX markers and tracks on the map, then export as GPX.
      </p>

      <div className='tool-controls gpx-controls'>
        <ModeSwitch mode={state.mode} onChange={changeMode} />

        <div className='tool-control-group gpx-actions'>
          <button
            type='button'
            className='btn btn-secondary btn-sm'
            onClick={handleClear}
            disabled={!hasContent}
            aria-disabled={!hasContent}
          >
            <FiTrash2 /> Clear All
          </button>
          <button
            type='button'
            className='btn btn-sm'
            onClick={handleDownload}
            disabled={!hasContent}
            aria-disabled={!hasContent}
          >
            <FiDownload /> Download GPX
          </button>
        </div>
      </div>

      <div className='gpx-layout'>
        <MapView
          mode={state.mode}
          markers={state.markers}
          tracks={state.tracks}
          inProgressTrack={state.inProgressTrack}
          highlightedMarkerId={highlightedMarkerId}
          highlightedTrackId={highlightedTrackId}
          mapRef={mapRef}
          onAddMarker={handleAddMarker}
          onAddTrackPoint={handleAddTrackPoint}
          onFinishTrack={handleFinishTrack}
        />

        <GPXSidebar
          markers={state.markers}
          tracks={state.tracks}
          inProgressTrack={state.inProgressTrack}
          highlightedMarkerId={highlightedMarkerId}
          highlightedTrackId={highlightedTrackId}
          onFocusMarker={handleFocusMarker}
          onFocusTrack={handleFocusTrack}
          onRenameMarker={handleRenameMarker}
          onRenameTrack={handleRenameTrack}
          onDeleteMarker={handleDeleteMarker}
          onDeleteTrack={handleDeleteTrack}
        />
      </div>
    </div>
  );
};

export default GPXDrawTool;
