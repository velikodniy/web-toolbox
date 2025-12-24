import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { useDebounce } from '../hooks/useDebounce.ts';

const URLEncoder: React.FC = () => {
  const [decoded, setDecoded] = useState<string>('');
  const [encoded, setEncoded] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<'decoded' | 'encoded'>('decoded');
  const [error, setError] = useState<string>('');
  const [, copy] = useCopyToClipboard();

  const debouncedDecoded = useDebounce(decoded, 300);
  const debouncedEncoded = useDebounce(encoded, 300);

  useEffect(() => {
    if (lastEdited === 'decoded') {
      try {
        const result = encodeURIComponent(debouncedDecoded);
        setEncoded(result);
        setError('');
      } catch (_err) {
        setError('Failed to encode.');
      }
    }
  }, [debouncedDecoded, lastEdited]);

  useEffect(() => {
    if (lastEdited === 'encoded') {
      if (!debouncedEncoded.trim()) {
        setDecoded('');
        setError('');
        return;
      }
      try {
        const result = decodeURIComponent(debouncedEncoded);
        setDecoded(result);
        setError('');
      } catch (_err) {
        setError('Invalid URL encoding.');
      }
    }
  }, [debouncedEncoded, lastEdited]);

  const handleDecodedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLastEdited('decoded');
    setDecoded(e.target.value);
  };

  const handleEncodedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLastEdited('encoded');
    setEncoded(e.target.value);
  };

  const handleCopy = async (content: string) => {
    if (!content) return;
    const success = await copy(content);
    if (success) {
      toast.success('Copied!');
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className='tool-page'>
      <h1>URL Encoder/Decoder</h1>
      <p className='description'>
        Real-time bidirectional URL encoding/decoding.
      </p>

      <div className="split-view">
        <div className='form-group'>
          <div className="tool-control-group" style={{ marginBottom: '0.5rem', justifyContent: 'space-between' }}>
            <label htmlFor='decoded-input' style={{ marginBottom: 0 }}>Decoded URL</label>
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              onClick={() => handleCopy(decoded)}
            >
              Copy
            </button>
          </div>
          <textarea
            id='decoded-input'
            className='form-textarea'
            value={decoded}
            onChange={handleDecodedChange}
            placeholder='Type decoded URL here... (e.g., https://example.com/foo bar)'
          />
        </div>

        <div className='form-group'>
          <div className="tool-control-group" style={{ marginBottom: '0.5rem', justifyContent: 'space-between' }}>
            <label htmlFor='encoded-input' style={{ marginBottom: 0 }}>Encoded URL</label>
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              onClick={() => handleCopy(encoded)}
            >
              Copy
            </button>
          </div>
          <textarea
            id='encoded-input'
            className='form-textarea'
            value={encoded}
            onChange={handleEncodedChange}
            placeholder='Type encoded URL here... (e.g., https%3A%2F%2Fexample.com%2Ffoo%20bar)'
          />
        </div>
      </div>

      {error && (
        <div className='error-message'>
          {error}
        </div>
      )}
    </div>
  );
};

export default URLEncoder;
