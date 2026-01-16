import { useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce.ts';
import { CopyButton } from './CopyButton.tsx';
import { ErrorMessage } from './ErrorMessage.tsx';
import { SplitView } from './SplitView.tsx';

type ConversionResult =
  | { success: true; value: string }
  | { success: false; error: string };

type BidirectionalConverterProps = {
  encode: (input: string) => ConversionResult;
  decode: (input: string) => ConversionResult;
  labels: {
    decoded: string;
    encoded: string;
  };
  placeholders: {
    decoded: string;
    encoded: string;
  };
  debounceMs?: number;
};

export function BidirectionalConverter({
  encode,
  decode,
  labels,
  placeholders,
  debounceMs = 300,
}: BidirectionalConverterProps) {
  const [decoded, setDecoded] = useState('');
  const [encoded, setEncoded] = useState('');
  const [lastEdited, setLastEdited] = useState<'decoded' | 'encoded'>('decoded');
  const [error, setError] = useState<string | null>(null);

  const debouncedDecoded = useDebounce(decoded, debounceMs);
  const debouncedEncoded = useDebounce(encoded, debounceMs);

  useEffect(() => {
    if (lastEdited !== 'decoded') return;

    const result = encode(debouncedDecoded);
    if (result.success) {
      setEncoded(result.value);
      setError(null);
    } else {
      setError(result.error);
    }
  }, [debouncedDecoded, lastEdited, encode]);

  useEffect(() => {
    if (lastEdited !== 'encoded') return;

    if (!debouncedEncoded.trim()) {
      setDecoded('');
      setError(null);
      return;
    }

    const result = decode(debouncedEncoded);
    if (result.success) {
      setDecoded(result.value);
      setError(null);
    } else {
      setError(result.error);
    }
  }, [debouncedEncoded, lastEdited, decode]);

  const handleDecodedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLastEdited('decoded');
    setDecoded(e.target.value);
  };

  const handleEncodedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLastEdited('encoded');
    setEncoded(e.target.value);
  };

  const leftPane = (
    <div className='form-group'>
      <div className='flex-between mb-half'>
        <label htmlFor='decoded-input' className='mb-0'>
          {labels.decoded}
        </label>
        <CopyButton text={decoded} compact />
      </div>
      <textarea
        id='decoded-input'
        className='form-textarea'
        value={decoded}
        onChange={handleDecodedChange}
        placeholder={placeholders.decoded}
      />
    </div>
  );

  const rightPane = (
    <div className='form-group'>
      <div className='flex-between mb-half'>
        <label htmlFor='encoded-input' className='mb-0'>
          {labels.encoded}
        </label>
        <CopyButton text={encoded} compact />
      </div>
      <textarea
        id='encoded-input'
        className='form-textarea'
        value={encoded}
        onChange={handleEncodedChange}
        placeholder={placeholders.encoded}
      />
    </div>
  );

  return (
    <>
      <SplitView left={leftPane} right={rightPane} />
      <ErrorMessage error={error} />
    </>
  );
}
