import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [hashes, setHashes] = useState<{
    md5: string | null;
    sha1: string | null;
    sha256: string | null;
  }>({ md5: null, sha1: null, sha256: null });
  const [, copy] = useCopyToClipboard();

  const generateHashes = async () => {
    if (!input.trim()) return;

    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    try {
      // Generate SHA-1
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
      const sha1 = Array.from(new Uint8Array(sha1Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Generate SHA-256
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
      const sha256 = Array.from(new Uint8Array(sha256Buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      setHashes({ md5: null, sha1, sha256 });
    } catch (error) {
      console.error('Error generating hashes:', error);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    const success = await copy(text);
    if (success) {
      toast.success(`${type} hash copied to clipboard!`);
    } else {
      toast.error('Failed to copy');
    }
  };

  const clearAll = () => {
    setInput('');
    setHashes({ md5: null, sha1: null, sha256: null });
  };

  return (
    <div className='tool-page'>
      <h1>Hash Generator</h1>
      <p className='description'>
        Generate SHA-1 and SHA-256 hashes from your input text. Useful for data
        integrity verification and checksums.
      </p>

      <div className='form-group'>
        <label htmlFor='input'>Text to hash:</label>
        <textarea
          id='input'
          className='form-textarea'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Enter text to generate hashes...'
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type='button'
          className='btn'
          onClick={generateHashes}
          disabled={!input.trim()}
        >
          Generate Hashes
        </button>
        <button type='button' className='btn btn-secondary' onClick={clearAll}>
          Clear
        </button>
      </div>

      {(hashes.sha1 || hashes.sha256) && (
        <div className='result-section'>
          <h3>Generated Hashes:</h3>

          {hashes.sha1 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>
                SHA-1:
              </h4>
              <div className='result-output'>{hashes.sha1}</div>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={() => handleCopy(hashes.sha1, 'SHA-1')}
                style={{ marginTop: '0.5rem' }}
              >
                Copy SHA-1
              </button>
            </div>
          )}

          {hashes.sha256 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>
                SHA-256:
              </h4>
              <div className='result-output'>{hashes.sha256}</div>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={() => handleCopy(hashes.sha256, 'SHA-256')}
                style={{ marginTop: '0.5rem' }}
              >
                Copy SHA-256
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HashGenerator;
