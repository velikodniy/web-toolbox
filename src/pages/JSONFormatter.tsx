import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import { useDebounce } from '../hooks/useDebounce.ts';

interface ToastMethods {
  success: (message: string) => string;
  error: (message: string) => string;
}

const JSONFormatter: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [valid, setValid] = useState<boolean>(false);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [, copy] = useCopyToClipboard();

  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setError('');
      setValid(false);
      return;
    }
    try {
      JSON.parse(debouncedInput);
      setError('');
      setValid(true);
    } catch (_err) {
      setError('Invalid JSON');
      setValid(false);
    }
  }, [debouncedInput]);

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError('');
      setValid(true);
    } catch (_err) {
      setError('Invalid JSON. Please check your syntax.');
      setValid(false);
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
      setValid(true);
    } catch (_err) {
      setError('Invalid JSON. Please check your syntax.');
      setValid(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    const success = await copy(output);
    if (success) {
      (toast as unknown as ToastMethods).success('Copied!');
    } else {
      (toast as unknown as ToastMethods).error('Failed to copy');
    }
  };

  return (
    <div className='tool-page' style={{ maxWidth: '1200px' }}>
      <h1>JSON Formatter</h1>
      <p className='description'>
        Format, validate, and beautify JSON data.
      </p>

      <div className='tool-controls'>
        <div className='form-group' style={{ marginBottom: 0 }}>
          <label htmlFor='indent' style={{ marginRight: '0.5rem' }}>
            Indent:
          </label>
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
            style={{ width: '60px', display: 'inline-block' }}
          />
        </div>
      </div>

      <div className='split-view'>
        <div
          className='form-group'
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div
            className='tool-control-group'
            style={{ marginBottom: '0.5rem', justifyContent: 'space-between' }}
          >
            <label htmlFor='input' style={{ marginBottom: 0 }}>Input</label>
            {valid && (
              <span
                style={{ color: 'var(--success-text)', fontSize: '0.9rem' }}
              >
                Valid JSON!
              </span>
            )}
            {error && (
              <span style={{ color: 'var(--error-text)', fontSize: '0.9rem' }}>
                {error}
              </span>
            )}
          </div>
          <textarea
            id='input'
            className='form-textarea'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Enter JSON here...'
            style={{ flex: 1, minHeight: '400px' }}
          />
        </div>

        <div
          className='form-group'
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div
            className='tool-control-group'
            style={{ marginBottom: '0.5rem', justifyContent: 'space-between' }}
          >
            <label htmlFor='output' style={{ marginBottom: 0 }}>Output</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type='button'
                className='btn btn-secondary'
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={formatJSON}
                disabled={!input.trim()}
              >
                Format
              </button>
              <button
                type='button'
                className='btn btn-secondary'
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={minifyJSON}
                disabled={!input.trim()}
              >
                Minify
              </button>
              <button
                type='button'
                className='btn btn-secondary'
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={handleCopy}
                disabled={!output}
              >
                Copy
              </button>
            </div>
          </div>
          <textarea
            id='output'
            className='form-textarea'
            value={output}
            readOnly
            placeholder='Formatted output will appear here...'
            style={{
              flex: 1,
              minHeight: '400px',
              backgroundColor: 'var(--bg-subtle)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default JSONFormatter;
