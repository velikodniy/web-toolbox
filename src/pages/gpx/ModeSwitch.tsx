import { FiActivity, FiMapPin, FiMove } from 'react-icons/fi';
import type { DrawingMode } from '../gpx-draw-state.ts';

type ModeSwitchProps = {
  mode: DrawingMode;
  onChange: (mode: DrawingMode) => void;
};

export function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  return (
    <div className='tool-control-group gpx-mode-switch'>
      <button
        type='button'
        className={`btn btn-secondary btn-sm ${mode === 'pan' ? 'active' : ''}`}
        onClick={() => onChange('pan')}
      >
        <FiMove /> Pan
      </button>
      <button
        type='button'
        className={`btn btn-secondary btn-sm ${
          mode === 'marker' ? 'active' : ''
        }`}
        onClick={() => onChange('marker')}
      >
        <FiMapPin /> Marker
      </button>
      <button
        type='button'
        className={`btn btn-secondary btn-sm ${
          mode === 'track' ? 'active' : ''
        }`}
        onClick={() => onChange('track')}
      >
        <FiActivity /> Track
      </button>
    </div>
  );
}
