import { FiTarget, FiTrash2 } from 'react-icons/fi';
import type { TrackItem } from '../gpx-draw-state.ts';

type TrackListItemProps = {
  track: TrackItem;
  isHighlighted: boolean;
  onFocus: (track: TrackItem) => void;
  onRename: (trackId: string, name: string) => void;
  onDelete: (trackId: string) => void;
};

export function TrackListItem({
  track,
  isHighlighted,
  onFocus,
  onRename,
  onDelete,
}: TrackListItemProps) {
  return (
    <div
      className={`gpx-list-item ${isHighlighted ? 'is-active' : ''}`}
    >
      <button
        type='button'
        className='gpx-focus'
        onClick={() => onFocus(track)}
        title='Focus on map'
      >
        <FiTarget />
      </button>
      <input
        aria-label={`Rename ${track.name}`}
        value={track.name}
        onChange={(e) => onRename(track.id, e.target.value)}
        className='gpx-name-input'
      />
      <div className='gpx-item-actions'>
        <span className='gpx-coords'>{track.points.length} pts</span>
        <button
          type='button'
          className='gpx-delete'
          onClick={() => onDelete(track.id)}
          aria-label={`Delete ${track.name}`}
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
