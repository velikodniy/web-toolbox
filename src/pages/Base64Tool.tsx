import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { useDebounce } from '../hooks/useDebounce.ts';

const Base64Tool: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [base64, setBase64] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<'text' | 'base64'>('text');
  const [error, setError] = useState<string>('');
  const [, copy] = useCopyToClipboard();

  const debouncedText = useDebounce(text, 300);
  const debouncedBase64 = useDebounce(base64, 300);

  useEffect(() => {
    if (lastEdited === 'text') {
      try {
        const encoded = btoa(debouncedText);
        setBase64(encoded);
        setError('');
      } catch (_err) {
        setError('Failed to encode.');
      }
    }
  }, [debouncedText, lastEdited]);

  useEffect(() => {
    if (lastEdited === 'base64') {
      if (!debouncedBase64.trim()) {
        setText('');
        setError('');
        return;
      }
      try {
        const decoded = atob(debouncedBase64);
        setText(decoded);
        setError('');
      } catch (_err) {
        setError('Invalid Base64 string.');
      }
    }
  }, [debouncedBase64, lastEdited]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLastEdited('text');
    setText(e.target.value);
  };

  const handleBase64Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLastEdited('base64');
    setBase64(e.target.value);
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
      <h1>Base64 Encoder/Decoder</h1>
      <p className='description'>
        Real-time bidirectional Base64 conversion. Type in either box to convert.
      </p>

      <div className="split-view">
        <div className='form-group'>
          <div className="tool-control-group" style={{ marginBottom: '0.5rem', justifyContent: 'space-between' }}>
            <label htmlFor='text-input' style={{ marginBottom: 0 }}>Text / Raw</label>
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              onClick={() => handleCopy(text)}
            >
              Copy
            </button>
          </div>
          <textarea
            id='text-input'
            className='form-textarea'
            value={text}
            onChange={handleTextChange}
            placeholder='Type text here...'
          />
        </div>

        <div className='form-group'>
          <div className="tool-control-group" style={{ marginBottom: '0.5rem', justifyContent: 'space-between' }}>
            <label htmlFor='base64-input' style={{ marginBottom: 0 }}>Base64</label>
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              onClick={() => handleCopy(base64)}
            >
              Copy
            </button>
          </div>
          <textarea
            id='base64-input'
            className='form-textarea'
            value={base64}
            onChange={handleBase64Change}
            placeholder='Type Base64 here...'
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

export default Base64Tool;
