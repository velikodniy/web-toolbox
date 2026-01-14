import { FiTarget } from 'react-icons/fi';
import type { MarkerItem, TrackItem } from '../gpx-draw-state.ts';
import { MarkerListItem } from './MarkerListItem.tsx';
import { TrackListItem } from './TrackListItem.tsx';

type GPXSidebarProps = {
  markers: MarkerItem[];
  tracks: TrackItem[];
  inProgressTrack:
    | { id: string; points: { lat: number; lng: number }[] }
    | null;
  highlightedMarkerId: string | null;
  highlightedTrackId: string | null;
  onFocusMarker: (marker: MarkerItem) => void;
  onFocusTrack: (track: TrackItem) => void;
  onRenameMarker: (markerId: string, name: string) => void;
  onRenameTrack: (trackId: string, name: string) => void;
  onDeleteMarker: (markerId: string) => void;
  onDeleteTrack: (trackId: string) => void;
};

export function GPXSidebar({
  markers,
  tracks,
  inProgressTrack,
  highlightedMarkerId,
  highlightedTrackId,
  onFocusMarker,
  onFocusTrack,
  onRenameMarker,
  onRenameTrack,
  onDeleteMarker,
  onDeleteTrack,
}: GPXSidebarProps) {
  return (
    <aside className='gpx-sidebar'>
      <div className='gpx-sidebar-header'>
        <FiTarget /> Your map elements
      </div>

      <div className='gpx-list'>
        <div className='gpx-list-title'>Markers</div>
        {markers.length === 0 && (
          <div className='gpx-list-empty'>No markers yet</div>
        )}
        {markers.map((marker) => (
          <MarkerListItem
            key={marker.id}
            marker={marker}
            isHighlighted={highlightedMarkerId === marker.id}
            onFocus={onFocusMarker}
            onRename={onRenameMarker}
            onDelete={onDeleteMarker}
          />
        ))}
      </div>

      <div className='gpx-list' style={{ marginTop: '1rem' }}>
        <div className='gpx-list-title'>Tracks</div>
        {tracks.length === 0 && (
          <div className='gpx-list-empty'>No tracks yet</div>
        )}
        {tracks.map((track) => (
          <TrackListItem
            key={track.id}
            track={track}
            isHighlighted={highlightedTrackId === track.id}
            onFocus={onFocusTrack}
            onRename={onRenameTrack}
            onDelete={onDeleteTrack}
          />
        ))}
        {inProgressTrack && (
          <div className='gpx-list-note'>
            Track in progress: {inProgressTrack.points.length} point
            {inProgressTrack.points.length === 1 ? '' : 's'}{' '}
            (finish by switching tools)
          </div>
        )}
      </div>
    </aside>
  );
}
