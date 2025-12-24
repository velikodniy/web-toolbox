import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { FaSync } from 'react-icons/fa';

interface ToastMethods {
  success: (message: string) => string;
  error: (message: string) => string;
}

const UUIDGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState<number>(1);
  const [, copy] = useCopyToClipboard();

  const generateUUID = (): string => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${
      hex.slice(16, 20)
    }-${hex.slice(20)}`;
  };

  const handleGenerate = useCallback(() => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids(newUuids);
  }, [count]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCopy = async (text: string) => {
    const success = await copy(text);
    if (success) {
      (toast as unknown as ToastMethods).success('Copied!');
    } else {
      (toast as unknown as ToastMethods).error('Failed to copy');
    }
  };

  const handleCopyAll = async () => {
    const success = await copy(uuids.join('\n'));
    if (success) {
      (toast as unknown as ToastMethods).success('All UUIDs copied!');
    } else {
      (toast as unknown as ToastMethods).error('Failed to copy');
    }
  };

  return (
    <div className='tool-page'>
      <h1>UUID Generator</h1>
      <p className='description'>
        Generate universally unique identifiers (UUID v4) for your applications.
      </p>

      <div className='form-group'>
        <label htmlFor='count'>Number of UUIDs:</label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type='number'
            id='count'
            className='form-input form-input-sm'
            value={count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            min='1'
            max='100'
          />
          <button 
            type='button' 
            className='btn btn-secondary' 
            onClick={handleGenerate}
            title="Regenerate"
          >
            <FaSync /> Regenerate
          </button>
        </div>
      </div>

      {uuids.length > 0 && (
        <div className='result-section'>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <h3>Generated UUID{uuids.length > 1 ? 's' : ''}:</h3>
             {uuids.length > 1 && (
                <button type='button' className='btn btn-secondary' onClick={handleCopyAll} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                  Copy All
                </button>
              )}
          </div>
          
          {uuids.map((uuid, index) => (
            <div key={index} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className='result-output' style={{ flex: 1, margin: 0, padding: '0.75rem' }}>{uuid}</div>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={() => handleCopy(uuid)}
                style={{ padding: '0.75rem' }}
                title="Copy"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UUIDGenerator;
