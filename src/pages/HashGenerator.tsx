import React, { useEffect, useState } from 'react';
import { CopyButton, ToolPageLayout } from '../components/ui/index.ts';
import { useDebounce } from '../hooks/useDebounce.ts';

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [hashes, setHashes] = useState<{
    sha1: string | null;
    sha256: string | null;
  }>({ sha1: null, sha256: null });

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
        const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
        const sha1 = Array.from(new Uint8Array(sha1Buffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

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

  return (
    <ToolPageLayout
      title='Hash Generator'
      description='Real-time SHA-1 and SHA-256 hash generation.'
    >
      <div className='form-group'>
        <div className='flex-between mb-half'>
          <label htmlFor='input' className='mb-0'>
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
              <div className='flex-between mb-half'>
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>SHA-1:</h4>
                <CopyButton text={hashes.sha1} successMessage='SHA-1 hash copied!' compact />
              </div>
              <div className='result-output'>{hashes.sha1}</div>
            </div>
          )}

          {hashes.sha256 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div className='flex-between mb-half'>
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>SHA-256:</h4>
                <CopyButton text={hashes.sha256} successMessage='SHA-256 hash copied!' compact />
              </div>
              <div className='result-output'>{hashes.sha256}</div>
            </div>
          )}
        </div>
      )}
    </ToolPageLayout>
  );
};

export default HashGenerator;
