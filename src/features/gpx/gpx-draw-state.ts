export type DrawingMode = 'pan' | 'marker' | 'track';

export type LatLng = { lat: number; lng: number };

export type MarkerItem = {
  id: string;
  name: string;
  position: LatLng;
};

export type TrackItem = {
  id: string;
  name: string;
  points: LatLng[];
};

type InProgressTrack = {
  id: string;
  points: LatLng[];
};

export type DrawingState = {
  mode: DrawingMode;
  markers: MarkerItem[];
  tracks: TrackItem[];
  inProgressTrack: InProgressTrack | null;
  nextMarkerNumber: number;
  nextTrackNumber: number;
};

const markerName = (index: number) => `Waypoint ${index}`;
const trackName = (index: number) => `Track ${index}`;

export function createInitialState(): DrawingState {
  return {
    mode: 'pan',
    markers: [],
    tracks: [],
    inProgressTrack: null,
    nextMarkerNumber: 1,
    nextTrackNumber: 1,
  };
}

export function setMode(state: DrawingState, mode: DrawingMode): DrawingState {
  if (state.mode === 'track' && mode !== 'track') {
    const finalized = finalizeTrack(state);
    return { ...finalized, mode };
  }
  return { ...state, mode };
}

export function addMarker(
  state: DrawingState,
  position: LatLng,
): DrawingState {
  if (state.mode !== 'marker') return state;

  const id = `marker-${state.nextMarkerNumber}`;
  const marker: MarkerItem = {
    id,
    name: markerName(state.nextMarkerNumber),
    position: { ...position },
  };

  return {
    ...state,
    markers: [...state.markers, marker],
    nextMarkerNumber: state.nextMarkerNumber + 1,
  };
}

export function addTrackPoint(
  state: DrawingState,
  position: LatLng,
): DrawingState {
  if (state.mode !== 'track') return state;

  const id = state.inProgressTrack?.id ?? `track-${state.nextTrackNumber}`;
  const points = [
    ...(state.inProgressTrack?.points ?? []),
    { ...position },
  ];

  return {
    ...state,
    inProgressTrack: { id, points },
  };
}

export function finalizeTrack(state: DrawingState): DrawingState {
  if (!state.inProgressTrack) return state;

  if (state.inProgressTrack.points.length < 2) {
    return { ...state, inProgressTrack: null };
  }

  const nextIndex = state.nextTrackNumber;
  const track: TrackItem = {
    id: `track-${nextIndex}`,
    name: trackName(nextIndex),
    points: state.inProgressTrack.points.map((pt) => ({ ...pt })),
  };

  return {
    ...state,
    tracks: [...state.tracks, track],
    inProgressTrack: null,
    nextTrackNumber: nextIndex + 1,
  };
}

export function renameMarker(
  state: DrawingState,
  markerId: string,
  name: string,
): DrawingState {
  return {
    ...state,
    markers: state.markers.map((marker) =>
      marker.id === markerId ? { ...marker, name } : marker
    ),
  };
}

export function renameTrack(
  state: DrawingState,
  trackId: string,
  name: string,
): DrawingState {
  return {
    ...state,
    tracks: state.tracks.map((track) =>
      track.id === trackId ? { ...track, name } : track
    ),
  };
}

export function deleteMarker(
  state: DrawingState,
  markerId: string,
): DrawingState {
  return {
    ...state,
    markers: state.markers.filter((marker) => marker.id !== markerId),
  };
}

export function deleteTrack(
  state: DrawingState,
  trackId: string,
): DrawingState {
  const removeInProgress = state.inProgressTrack?.id === trackId;
  return {
    ...state,
    tracks: state.tracks.filter((track) => track.id !== trackId),
    inProgressTrack: removeInProgress ? null : state.inProgressTrack,
  };
}
