import { FiMapPin, FiTrash2 } from 'react-icons/fi';
import type { MarkerItem } from '../gpx-draw-state.ts';

type MarkerListItemProps = {
  marker: MarkerItem;
  isHighlighted: boolean;
  onFocus: (marker: MarkerItem) => void;
  onRename: (markerId: string, name: string) => void;
  onDelete: (markerId: string) => void;
};

export function MarkerListItem({
  marker,
  isHighlighted,
  onFocus,
  onRename,
  onDelete,
}: MarkerListItemProps) {
  return (
    <div
      className={`gpx-list-item ${isHighlighted ? 'is-active' : ''}`}
    >
      <button
        type='button'
        className='gpx-focus'
        onClick={() => onFocus(marker)}
        title='Focus on map'
      >
        <FiMapPin />
      </button>
      <input
        aria-label={`Rename ${marker.name}`}
        value={marker.name}
        onChange={(e) => onRename(marker.id, e.target.value)}
        className='gpx-name-input'
      />
      <div className='gpx-item-actions'>
        <span className='gpx-coords'>
          {marker.position.lat.toFixed(5)}, {marker.position.lng.toFixed(5)}
        </span>
        <button
          type='button'
          className='gpx-delete'
          onClick={() => onDelete(marker.id)}
          aria-label={`Delete ${marker.name}`}
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
