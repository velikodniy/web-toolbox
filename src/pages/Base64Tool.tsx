import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';

const Base64Tool: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string>('');
  const [, copy] = useCopyToClipboard();

  const handleEncode = () => {
    try {
      const encoded = btoa(input);
      setOutput(encoded);
      setError('');
    } catch (_err) {
      setError('Failed to encode. Please check your input.');
      setOutput(null);
    }
  };

  const handleDecode = () => {
    try {
      const decoded = atob(input);
      setOutput(decoded);
      setError('');
    } catch (_err) {
      setError('Invalid Base64 string. Please check your input.');
      setOutput(null);
    }
  };

  const handleProcess = () => {
    if (mode === 'encode') {
      handleEncode();
    } else {
      handleDecode();
    }
  };

  const handleCopy = async () => {
    const success = await copy(output);
    if (success) {
      toast.success('Copied to clipboard!');
    } else {
      toast.error('Failed to copy');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput(null);
    setError('');
  };

  return (
    <div className='tool-page'>
      <h1>Base64 Encoder/Decoder</h1>
      <p className='description'>
        Encode text to Base64 or decode Base64 strings back to readable text.
        Base64 encoding is commonly used for data transmission and storage.
      </p>

      <div className='form-group'>
        <label>Mode:</label>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <input
              type='radio'
              value='encode'
              checked={mode === 'encode'}
              onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}
            />
            Encode to Base64
          </label>
          <label
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <input
              type='radio'
              value='decode'
              checked={mode === 'decode'}
              onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}
            />
            Decode from Base64
          </label>
        </div>
      </div>

      <div className='form-group'>
        <label htmlFor='input'>
          {mode === 'encode' ? 'Text to encode:' : 'Base64 string to decode:'}
        </label>
        <textarea
          id='input'
          className='form-textarea'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode'
            ? 'Enter text to encode...'
            : 'Enter Base64 string to decode...'}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type='button'
          className='btn'
          onClick={handleProcess}
          disabled={!input.trim()}
        >
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
        <button type='button' className='btn btn-secondary' onClick={clearAll}>
          Clear
        </button>
      </div>

      {error && (
        <div className='error-message'>
          {error}
        </div>
      )}

      {output && (
        <div className='result-section'>
          <h3>Result:</h3>
          <div className='result-output'>{output}</div>
          <button
            type='button'
            className='btn btn-secondary'
            onClick={handleCopy}
          >
            Copy Result
          </button>
        </div>
      )}
    </div>
  );
};

export default Base64Tool;
