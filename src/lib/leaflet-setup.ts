import L from 'leaflet';

// Leaflet's default icon URLs don't work with bundlers.
// This configures proper CDN URLs for the default marker icons.
// Uses a type-safe approach by directly assigning to the prototype's options.
const defaultIconOptions = {
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
};

L.Icon.Default.mergeOptions(defaultIconOptions);

export { L };
