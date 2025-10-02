import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';

const JSONFormatter: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [, copy] = useCopyToClipboard();

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError('');
    } catch (_err) {
      setError('Invalid JSON. Please check your syntax.');
      setOutput(null);
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
    } catch (_err) {
      setError('Invalid JSON. Please check your syntax.');
      setOutput(null);
    }
  };

  const validateJSON = () => {
    try {
      JSON.parse(input);
      setError('');
      setOutput('Valid JSON!');
    } catch (_err) {
      setError('Invalid JSON. Please check your syntax.');
      setOutput(null);
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
      <h1>JSON Formatter</h1>
      <p className='description'>
        Format, validate, and beautify JSON data. Perfect for debugging and
        making JSON more readable.
      </p>

      <div className='form-group'>
        <label htmlFor='input'>JSON Input:</label>
        <textarea
          id='input'
          className='form-textarea'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Enter JSON here... e.g., {"name": "John", "age": 30}'
          style={{ minHeight: '150px' }}
        />
      </div>

      <div className='form-group'>
        <label htmlFor='indent'>Indent Size:</label>
        <input
          type='number'
          id='indent'
          className='form-input'
          value={indentSize}
          onChange={(e) =>
            setIndentSize(
              Math.max(1, Math.min(8, parseInt(e.target.value) || 2)),
            )}
          min='1'
          max='8'
          style={{ width: '100px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type='button'
          className='btn'
          onClick={formatJSON}
          disabled={!input.trim()}
        >
          Format
        </button>
        <button
          type='button'
          className='btn'
          onClick={minifyJSON}
          disabled={!input.trim()}
        >
          Minify
        </button>
        <button
          type='button'
          className='btn'
          onClick={validateJSON}
          disabled={!input.trim()}
        >
          Validate
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
          {output !== 'Valid JSON!' && (
            <button
              type='button'
              className='btn btn-secondary'
              onClick={handleCopy}
            >
              Copy Result
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default JSONFormatter;
