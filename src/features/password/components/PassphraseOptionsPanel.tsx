import type { PassphraseOptions } from '../lib/passphrase.ts';

type PassphraseOptionsPanelProps = {
  options: PassphraseOptions;
  onChange: (options: PassphraseOptions) => void;
};

export function PassphraseOptionsPanel({
  options,
  onChange,
}: PassphraseOptionsPanelProps) {
  return (
    <>
      <div className='pwd-row'>
        <label htmlFor='word-count' className='pwd-label'>
          Words
        </label>
        <input
          id='word-count'
          type='number'
          min={2}
          max={12}
          className='pwd-input-number'
          value={options.wordCount}
          onChange={(event) =>
            onChange({
              ...options,
              wordCount: Number(event.target.value),
            })}
        />

        <label htmlFor='separator' className='pwd-label'>
          Separator
        </label>
        <input
          id='separator'
          type='text'
          className='pwd-input-separator'
          value={options.separator}
          onChange={(event) =>
            onChange({
              ...options,
              separator: event.target.value,
            })}
          maxLength={4}
        />
      </div>

      <div className='pwd-checkboxes'>
        <label className='pwd-checkbox'>
          <input
            type='checkbox'
            checked={options.capitalize}
            onChange={(event) =>
              onChange({
                ...options,
                capitalize: event.target.checked,
              })}
          />
          <span>Capitalize</span>
        </label>
        <label className='pwd-checkbox'>
          <input
            type='checkbox'
            checked={options.includeNumber}
            onChange={(event) =>
              onChange({
                ...options,
                includeNumber: event.target.checked,
              })}
          />
          <span>Add number</span>
        </label>
        <label className='pwd-checkbox'>
          <input
            type='checkbox'
            checked={options.includeSymbol}
            onChange={(event) =>
              onChange({
                ...options,
                includeSymbol: event.target.checked,
              })}
          />
          <span>Add symbol</span>
        </label>
      </div>
    </>
  );
}
