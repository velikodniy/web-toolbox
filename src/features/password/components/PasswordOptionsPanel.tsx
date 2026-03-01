import type { PasswordGenerationOptions } from '../lib/password.ts';

type PasswordOptionsPanelProps = {
  options: PasswordGenerationOptions;
  onChange: (options: PasswordGenerationOptions) => void;
};

export function PasswordOptionsPanel({
  options,
  onChange,
}: PasswordOptionsPanelProps) {
  return (
    <>
      <div className='pwd-row'>
        <label htmlFor='password-length' className='pwd-label'>
          Length
        </label>
        <input
          id='password-length'
          type='number'
          min={4}
          max={128}
          className='pwd-input-number'
          value={options.length}
          onChange={(event) =>
            onChange({
              ...options,
              length: Number(event.target.value),
            })}
        />
        <label className='pwd-checkbox'>
          <input
            type='checkbox'
            checked={options.includeLowercase}
            onChange={(event) =>
              onChange({
                ...options,
                includeLowercase: event.target.checked,
              })}
          />
          <span>a-z</span>
        </label>
        <label className='pwd-checkbox'>
          <input
            type='checkbox'
            checked={options.includeUppercase}
            onChange={(event) =>
              onChange({
                ...options,
                includeUppercase: event.target.checked,
              })}
          />
          <span>A-Z</span>
        </label>
        <label className='pwd-checkbox'>
          <input
            type='checkbox'
            checked={options.includeNumbers}
            onChange={(event) =>
              onChange({
                ...options,
                includeNumbers: event.target.checked,
              })}
          />
          <span>0-9</span>
        </label>
        <label className='pwd-checkbox'>
          <input
            type='checkbox'
            checked={options.includeSymbols}
            onChange={(event) =>
              onChange({
                ...options,
                includeSymbols: event.target.checked,
              })}
          />
          <span>!@#$</span>
        </label>
      </div>

      <label className='pwd-checkbox pwd-checkbox-standalone'>
        <input
          type='checkbox'
          checked={options.excludeAmbiguous}
          onChange={(event) =>
            onChange({
              ...options,
              excludeAmbiguous: event.target.checked,
            })}
        />
        <span>Exclude ambiguous (0/O, 1/l)</span>
      </label>
    </>
  );
}
