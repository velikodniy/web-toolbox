import React, { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiDownload, FiMap, FiTrash2 } from 'react-icons/fi';
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
    setState((prev) => setMode(prev, mode));
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
        Switch between pan, markers, and tracks; auto-finish tracks when you
        leave the track tool, manage items in the sidebar, and export as GPX.
      </p>

      <div className='tool-controls gpx-controls'>
        <ModeSwitch mode={state.mode} onChange={changeMode} />

        <div className='tool-control-group gpx-stats'>
          <FiMap
            style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {state.markers.length}{' '}
            waypoint{state.markers.length === 1 ? '' : 's'},{' '}
            {state.tracks.length} track{state.tracks.length === 1 ? '' : 's'}
          </span>
        </div>

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
