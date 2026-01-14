import { FiActivity, FiMapPin, FiTarget, FiTrash2 } from 'react-icons/fi';
import type { MarkerItem, TrackItem } from '../gpx-draw-state.ts';

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
  const items = [
    ...markers.map((marker) => ({
      kind: 'marker' as const,
      id: marker.id,
      name: marker.name,
      marker,
    })),
    ...tracks.map((track) => ({
      kind: 'track' as const,
      id: track.id,
      name: track.name,
      track,
    })),
  ];

  return (
    <aside className='gpx-sidebar'>
      <div className='gpx-list'>
        <div className='gpx-list-title'>Markers & tracks</div>
        {items.length === 0 && (
          <div className='gpx-list-empty'>No items yet</div>
        )}
        {items.map((item) => {
          const isMarker = item.kind === 'marker';
          const isHighlighted = isMarker
            ? highlightedMarkerId === item.id
            : highlightedTrackId === item.id;
          return (
            <div
              key={item.id}
              className={`gpx-list-item ${isHighlighted ? 'is-active' : ''}`}
            >
              <button
                type='button'
                className='gpx-icon-button'
                onClick={() =>
                  isMarker
                    ? onFocusMarker(item.marker)
                    : onFocusTrack(item.track)
                }
                title='Highlight on map'
              >
                {isMarker ? <FiMapPin /> : <FiActivity />}
              </button>
              <input
                aria-label={`Rename ${item.name}`}
                value={item.name}
                onChange={(e) =>
                  isMarker
                    ? onRenameMarker(item.id, e.target.value)
                    : onRenameTrack(item.id, e.target.value)
                }
                className='gpx-name-input'
              />
              <div className='gpx-item-actions'>
                <button
                  type='button'
                  className='gpx-delete'
                  onClick={() =>
                    isMarker ? onDeleteMarker(item.id) : onDeleteTrack(item.id)
                  }
                  aria-label={`Delete ${item.name}`}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          );
        })}
        {inProgressTrack && (
          <div className='gpx-list-note'>
            Track in progress: {inProgressTrack.points.length} point
            {inProgressTrack.points.length === 1 ? '' : 's'}
          </div>
        )}
      </div>
    </aside>
  );
}
