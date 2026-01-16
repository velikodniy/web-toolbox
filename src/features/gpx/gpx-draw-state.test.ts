/// <reference lib="deno.ns" />
import { expect } from 'npm:expect@30.2.0';

import {
  addMarker,
  addTrackPoint,
  createInitialState,
  deleteMarker,
  deleteTrack,
  renameMarker,
  renameTrack,
  setMode,
} from './gpx-draw-state.ts';

const test = Deno.test;

test('adds markers only in marker mode with incremental names', () => {
  const initial = createInitialState();
  const stillPan = addMarker(initial, { lat: 1, lng: 2 });

  expect(stillPan.markers).toHaveLength(0);

  const markerMode = setMode(initial, 'marker');
  const withFirst = addMarker(markerMode, { lat: 1, lng: 2 });
  const withSecond = addMarker(withFirst, { lat: 3, lng: 4 });

  expect(withSecond.markers).toHaveLength(2);
  expect(withSecond.markers[0]).toMatchObject({
    id: 'marker-1',
    name: 'Waypoint 1',
    position: { lat: 1, lng: 2 },
  });
  expect(withSecond.markers[1]).toMatchObject({
    id: 'marker-2',
    name: 'Waypoint 2',
    position: { lat: 3, lng: 4 },
  });
});

test('finalizes tracks automatically when leaving track mode', () => {
  const initial = setMode(createInitialState(), 'track');
  const withPoints = addTrackPoint(
    addTrackPoint(initial, { lat: 1, lng: 1 }),
    { lat: 2, lng: 2 },
  );

  expect(withPoints.inProgressTrack?.points).toHaveLength(2);

  const finalized = setMode(withPoints, 'pan');

  expect(finalized.mode).toBe('pan');
  expect(finalized.inProgressTrack).toBeNull();
  expect(finalized.tracks).toHaveLength(1);
  expect(finalized.tracks[0]).toMatchObject({
    id: 'track-1',
    name: 'Track 1',
    points: [
      { lat: 1, lng: 1 },
      { lat: 2, lng: 2 },
    ],
  });
});

test('drops incomplete tracks when switching mode', () => {
  const initial = setMode(createInitialState(), 'track');
  const withSingle = addTrackPoint(initial, { lat: 1, lng: 1 });

  const afterSwitch = setMode(withSingle, 'marker');

  expect(afterSwitch.tracks).toHaveLength(0);
  expect(afterSwitch.inProgressTrack).toBeNull();
  expect(afterSwitch.mode).toBe('marker');
});

test('renames and deletes markers and tracks immutably', () => {
  const markerMode = setMode(createInitialState(), 'marker');
  const markersAdded = addMarker(markerMode, { lat: 1, lng: 1 });
  const renamedMarker = renameMarker(
    markersAdded,
    'marker-1',
    'Home',
  );

  expect(renamedMarker.markers[0].name).toBe('Home');

  const trackMode = setMode(renamedMarker, 'track');
  const withTrack = setMode(
    addTrackPoint(
      addTrackPoint(trackMode, { lat: 0, lng: 0 }),
      { lat: 1, lng: 1 },
    ),
    'pan',
  );

  const renamedTrack = renameTrack(withTrack, 'track-1', 'Morning Loop');
  expect(renamedTrack.tracks[0].name).toBe('Morning Loop');

  const afterMarkerDelete = deleteMarker(renamedTrack, 'marker-1');
  expect(afterMarkerDelete.markers).toHaveLength(0);

  const afterTrackDelete = deleteTrack(afterMarkerDelete, 'track-1');
  expect(afterTrackDelete.tracks).toHaveLength(0);

  // ensure immutability: previous states unchanged
  expect(withTrack.tracks).toHaveLength(1);
  expect(renamedTrack.markers).toHaveLength(1);
});
