import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';

const URLEncoder: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string>('');
  const [, copy] = useCopyToClipboard();

  const handleEncode = () => {
    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
      setError('');
    } catch (_err) {
      setError('Failed to encode URL.');
      setOutput(null);
    }
  };

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
      setError('');
    } catch (_err) {
      setError('Invalid URL encoding. Please check your input.');
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
      <h1>URL Encoder/Decoder</h1>
      <p className='description'>
        Encode URLs to make them safe for transmission or decode URL-encoded
        strings back to readable format. Useful for handling special characters
        in URLs and query parameters.
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
            Encode URL
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
            Decode URL
          </label>
        </div>
      </div>

      <div className='form-group'>
        <label htmlFor='input'>
          {mode === 'encode'
            ? 'Text/URL to encode:'
            : 'URL-encoded string to decode:'}
        </label>
        <textarea
          id='input'
          className='form-textarea'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode'
            ? 'Enter text or URL to encode... e.g., Hello World! or https://example.com/search?q=hello world'
            : 'Enter URL-encoded string to decode... e.g., Hello%20World%21'}
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

export default URLEncoder;
