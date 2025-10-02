import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';

const UUIDGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState<number>(1);
  const [, copy] = useCopyToClipboard();

  const generateUUID = (): string => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Set version (4) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${
      hex.slice(16, 20)
    }-${hex.slice(20)}`;
  };

  const handleGenerate = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids(newUuids);
  };

  const handleCopy = async (text: string) => {
    const success = await copy(text);
    if (success) {
      toast.success('Copied to clipboard!');
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleCopyAll = async () => {
    const success = await copy(uuids.join('\n'));
    if (success) {
      toast.success('All UUIDs copied to clipboard!');
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className='tool-page'>
      <h1>UUID Generator</h1>
      <p className='description'>
        Generate universally unique identifiers (UUID v4) for your applications.
        These are random 128-bit identifiers that are practically guaranteed to
        be unique.
      </p>

      <div className='form-group'>
        <label htmlFor='count'>Number of UUIDs to generate:</label>
        <input
          type='number'
          id='count'
          className='form-input'
          value={count}
          onChange={(e) =>
            setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
          min='1'
          max='100'
        />
      </div>

      <button type='button' className='btn' onClick={handleGenerate}>
        Generate UUID{count > 1 ? 's' : ''}
      </button>

      {uuids.length > 0 && (
        <div className='result-section'>
          <h3>Generated UUID{uuids.length > 1 ? 's' : ''}:</h3>
          {uuids.map((uuid, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <div className='result-output'>{uuid}</div>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={() =>
                  handleCopy(uuid)}
                style={{ marginTop: '0.5rem' }}
              >
                Copy
              </button>
            </div>
          ))}

          {uuids.length > 1 && (
            <button type='button' className='btn' onClick={handleCopyAll}>
              Copy All UUIDs
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UUIDGenerator;
