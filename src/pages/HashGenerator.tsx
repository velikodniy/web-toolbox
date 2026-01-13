import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { useDebounce } from '../hooks/useDebounce.ts';

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [hashes, setHashes] = useState<{
    sha1: string | null;
    sha256: string | null;
  }>({ sha1: null, sha256: null });
  const [, copy] = useCopyToClipboard();

  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    const generate = async () => {
      if (!debouncedInput.trim()) {
        setHashes({ sha1: null, sha256: null });
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(debouncedInput);

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

        setHashes({ sha1, sha256 });
      } catch (error) {
        console.error('Error generating hashes:', error);
      }
    };

    generate();
  }, [debouncedInput]);

  const handleCopy = async (text: string, type: string) => {
    if (!text) return;
    const success = await copy(text);
    if (success) {
      toast.success(`${type} hash copied!`);
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className='tool-page'>
      <h1>Hash Generator</h1>
      <p className='description'>
        Real-time SHA-1 and SHA-256 hash generation.
      </p>

      <div className='form-group'>
        <div
          className='tool-control-group'
          style={{ marginBottom: '0.5rem', justifyContent: 'space-between' }}
        >
          <label htmlFor='input' style={{ marginBottom: 0 }}>
            Text to hash
          </label>
        </div>
        <textarea
          id='input'
          className='form-textarea'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Enter text to generate hashes...'
        />
      </div>

      {(hashes.sha1 || hashes.sha256) && (
        <div className='result-section'>
          <h3>Generated Hashes:</h3>

          {hashes.sha1 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                className='tool-control-group'
                style={{
                  marginBottom: '0.5rem',
                  justifyContent: 'space-between',
                }}
              >
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>SHA-1:</h4>
                <button
                  type='button'
                  className='btn btn-secondary'
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  onClick={() => handleCopy(hashes.sha1!, 'SHA-1')}
                >
                  Copy
                </button>
              </div>
              <div className='result-output'>{hashes.sha1}</div>
            </div>
          )}

          {hashes.sha256 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                className='tool-control-group'
                style={{
                  marginBottom: '0.5rem',
                  justifyContent: 'space-between',
                }}
              >
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>
                  SHA-256:
                </h4>
                <button
                  type='button'
                  className='btn btn-secondary'
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  onClick={() => handleCopy(hashes.sha256!, 'SHA-256')}
                >
                  Copy
                </button>
              </div>
              <div className='result-output'>{hashes.sha256}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HashGenerator;
