import React, { useEffect, useState } from 'react';
import {
  CopyButton,
  ErrorMessage,
  SplitView,
  ToolPageLayout,
} from '../../components/ui/index.ts';
import { useDebounce } from '../../hooks/useDebounce.ts';

const JSONFormatter: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean>(false);
  const [indentSize, setIndentSize] = useState<number>(2);

  const debouncedInput = useDebounce(input, 300);

  useEffect(() => {
    if (!debouncedInput.trim()) {
      setError(null);
      setValid(false);
      return;
    }
    try {
      JSON.parse(debouncedInput);
      setError(null);
      setValid(true);
    } catch {
      setError('Invalid JSON');
      setValid(false);
    }
  }, [debouncedInput]);

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError(null);
      setValid(true);
    } catch {
      setError('Invalid JSON. Please check your syntax.');
      setValid(false);
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
      setValid(true);
    } catch {
      setError('Invalid JSON. Please check your syntax.');
      setValid(false);
    }
  };

  const leftPane = (
    <div className='form-group flex-col flex-1'>
      <div className='flex-between mb-half'>
        <label htmlFor='input' className='mb-0'>Input</label>
        {valid && <span className='text-success'>Valid JSON!</span>}
      </div>
      <textarea
        id='input'
        className='form-textarea flex-1 textarea-tall'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder='Enter JSON here...'
      />
      <ErrorMessage error={error} />
    </div>
  );

  const rightPane = (
    <div className='form-group flex-col flex-1'>
      <div className='flex-between mb-half'>
        <label htmlFor='output' className='mb-0'>Output</label>
        <div className='flex-center'>
          <button
            type='button'
            className='btn btn-secondary btn-compact'
            onClick={formatJSON}
            disabled={!input.trim()}
          >
            Format
          </button>
          <button
            type='button'
            className='btn btn-secondary btn-compact'
            onClick={minifyJSON}
            disabled={!input.trim()}
          >
            Minify
          </button>
          <CopyButton text={output} compact />
        </div>
      </div>
      <textarea
        id='output'
        className='form-textarea flex-1 textarea-tall'
        value={output}
        readOnly
        placeholder='Formatted output will appear here...'
        style={{ backgroundColor: 'var(--bg-subtle)' }}
      />
    </div>
  );

  return (
    <ToolPageLayout
      title='JSON Formatter'
      description='Format, validate, and beautify JSON data.'
      maxWidth='wide'
    >
      <div className='tool-controls'>
        <div className='form-group mb-0'>
          <label htmlFor='indent' className='label-inline'>
            Indent:
          </label>
          <input
            type='number'
            id='indent'
            className='form-input input-narrow'
            value={indentSize}
            onChange={(e) =>
              setIndentSize(
                Math.max(1, Math.min(8, parseInt(e.target.value) || 2)),
              )}
            min='1'
            max='8'
          />
        </div>
      </div>

      <SplitView left={leftPane} right={rightPane} />
    </ToolPageLayout>
  );
};

export default JSONFormatter;
