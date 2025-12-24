import React, { useEffect, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce.ts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PostcodeData {
  postcode: string;
  latitude: number;
  longitude: number;
  admin_district: string;
  region: string;
  country: string;
}

interface PostcodeResponse {
  status: number;
  result: PostcodeData;
  error?: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
}

const PostcodeLookup: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PostcodeData | null>(null);
  const debouncedInput = useDebounce(input, 500);

  useEffect(() => {
    const fetchPostcode = async () => {
      const trimmed = debouncedInput.trim().toUpperCase();
      if (trimmed.length < 5) {
        if (trimmed.length > 0) setError('Postcode too short');
        else {
            setError(null);
            setData(null);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}`);
        const json: PostcodeResponse = await response.json();

        if (json.status === 200) {
          setData(json.result);
        } else {
          setError(json.error || 'Postcode not found');
          setData(null);
        }
      } catch (_err) {
        setError('Failed to connect to lookup service');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (debouncedInput) {
      fetchPostcode();
    } else {
      setData(null);
      setError(null);
    }
  }, [debouncedInput]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="tool-page">
      <h1>Postcode Lookup</h1>
      <p className="description">
        Find locations, administrative data, and coordinates for any UK postcode.
      </p>

      <div className="form-group">
        <label htmlFor="postcode-input">Enter UK Postcode</label>
        <div style={{ position: 'relative' }}>
          <input
            id="postcode-input"
            className="form-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. SW1A 1AA"
            maxLength={10}
            style={{ fontSize: '1.2rem', letterSpacing: '0.05em' }}
          />
          {loading && (
            <div style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}>
              Loading...
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span role="img" aria-label="error">⚠️</span> {error}
        </div>
      )}

      {data && (
        <div className="result-section fade-in">
          <div className="split-view">
            <div>
              <h3>Location Details</h3>
              <div className="result-output" style={{ marginBottom: '1.5rem' }}>
                <DetailRow label="Postcode" value={data.postcode} />
                <DetailRow label="Region" value={data.region || 'N/A'} />
                <DetailRow label="District" value={data.admin_district || 'N/A'} />
                <DetailRow label="Country" value={data.country} />
                <DetailRow 
                  label="Coordinates" 
                  value={`${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}`} 
                  copyable 
                  onCopy={() => copyToClipboard(`${data.latitude}, ${data.longitude}`, 'Coordinates')}
                />
              </div>
              
            </div>

            <div className="map-wrapper" style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', zIndex: 0 }}>
              <MapContainer 
                center={[data.latitude, data.longitude]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[data.latitude, data.longitude]}>
                  <Popup>
                    <strong>{data.postcode}</strong><br />
                    {data.admin_district}
                  </Popup>
                </Marker>
                <MapUpdater center={[data.latitude, data.longitude]} />
              </MapContainer>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn"
                style={{ 
                  position: 'absolute', 
                  bottom: '12px', 
                  right: '12px', 
                  zIndex: 1000,
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  padding: '0.5rem 0.75rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
                title="Open in Google Maps"
              >
                <FiExternalLink /> Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ label, value, copyable, onCopy }: { label: string, value: string, copyable?: boolean, onCopy?: () => void }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
    <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
    <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {value}
      {copyable && (
        <button 
          type="button"
          onClick={onCopy} 
          className="theme-toggle"
          style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}
          title="Copy"
        >
          <FiCopy />
        </button>
      )}
    </span>
  </div>
);

export default PostcodeLookup;
