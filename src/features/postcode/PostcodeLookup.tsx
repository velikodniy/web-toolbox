import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { FiExternalLink, FiShare2 } from 'react-icons/fi';
import {
  CopyButton,
  ErrorMessage,
  SplitView,
  ToolPageLayout,
} from '../../components/ui/index.ts';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.ts';
import { useDebounce } from '../../hooks/useDebounce.ts';
import '../../lib/leaflet-setup.ts';

type PostcodeData = {
  postcode: string;
  latitude: number;
  longitude: number;
  admin_district: string;
  region: string;
  country: string;
};

type PostcodeResponse = {
  status: number;
  result: PostcodeData;
  error?: string;
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
}

type DetailRowProps = {
  label: string;
  value: string;
  copyValue?: string;
};

const DetailRow = ({ label, value, copyValue }: DetailRowProps) => (
  <div className='flex-between mb-half'>
    <span style={{ color: 'var(--text-muted)' }}>{label}:</span>
    <span className='flex-center' style={{ fontWeight: 500 }}>
      {value}
      {copyValue && (
        <CopyButton
          text={copyValue}
          label='Copy'
          successMessage={`${label} copied!`}
          iconOnly
        />
      )}
    </span>
  </div>
);

const PostcodeLookup: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PostcodeData | null>(null);
  const [, copy] = useCopyToClipboard();
  const debouncedInput = useDebounce(input, 500);

  useEffect(() => {
    const search = globalThis.location?.search ?? '';
    const params = new URLSearchParams(search);
    const initialPostcode = params.get('postcode');
    if (initialPostcode) {
      setInput(initialPostcode.trim());
    }
  }, []);

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
        const response = await fetch(
          `https://api.postcodes.io/postcodes/${encodeURIComponent(trimmed)}`,
        );
        const json: PostcodeResponse = await response.json();

        if (json.status === 200) {
          setData(json.result);
        } else {
          setError(json.error || 'Postcode not found');
          setData(null);
        }
      } catch {
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

  const shareLink = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const origin = globalThis.location?.origin ?? '';
    const pathname = globalThis.location?.pathname ?? '';
    const url = `${origin}${pathname}?postcode=${encodeURIComponent(trimmed)}`;
    const success = await copy(url);
    if (success) {
      toast.success('Link copied!');
    } else {
      toast.error('Failed to copy');
    }
  };

  const leftPane = data && (
    <div className='result-output' style={{ marginBottom: '1.5rem' }}>
      <DetailRow label='Postcode' value={data.postcode} />
      <DetailRow label='Region' value={data.region || 'N/A'} />
      <DetailRow label='District' value={data.admin_district || 'N/A'} />
      <DetailRow label='Country' value={data.country} />
      <DetailRow
        label='Coordinates'
        value={`${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}`}
        copyValue={`${data.latitude}, ${data.longitude}`}
      />
    </div>
  );

  const rightPane = data && (
    <div
      className='map-wrapper'
      style={{
        height: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        position: 'relative',
        zIndex: 0,
      }}
    >
      <MapContainer
        center={[data.latitude, data.longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={[data.latitude, data.longitude]}>
          <Popup>
            <strong>{data.postcode}</strong>
            <br />
            {data.admin_district}
          </Popup>
        </Marker>
        <MapUpdater center={[data.latitude, data.longitude]} />
      </MapContainer>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`}
        target='_blank'
        rel='noopener noreferrer'
        className='map-cta'
        title='Open in Google Maps'
      >
        <FiExternalLink /> Google Maps
      </a>
    </div>
  );

  return (
    <ToolPageLayout
      title='Postcode Lookup'
      description='Find locations, administrative data, and coordinates for any UK postcode.'
    >
      <div className='form-group'>
        <label htmlFor='postcode-input'>Enter UK Postcode</label>
        <div className='flex-center'>
          <div style={{ position: 'relative', maxWidth: '200px' }}>
            <input
              id='postcode-input'
              className='form-input'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g. SW1A 1AA'
              maxLength={10}
              style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}
            />
            {loading && (
              <div
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                }}
              >
                ...
              </div>
            )}
          </div>
          <button
            type='button'
            className='theme-toggle'
            onClick={shareLink}
            disabled={!input.trim()}
            title='Copy link to this postcode'
            style={{ opacity: input.trim() ? 1 : 0.4 }}
          >
            <FiShare2 />
          </button>
        </div>
      </div>

      <ErrorMessage error={error} />

      {data && (
        <div className='result-section fade-in'>
          <SplitView left={leftPane} right={rightPane} />
        </div>
      )}
    </ToolPageLayout>
  );
};

export default PostcodeLookup;
