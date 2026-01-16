import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCopy, FiRefreshCw } from 'react-icons/fi';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.ts';
import {
  generatePassword,
  type PasswordGenerationOptions,
} from '../lib/password/password.ts';
import {
  generatePassphrase,
  type PassphraseOptions,
} from '../lib/password/passphrase.ts';

type Mode = 'password' | 'passphrase';

const DEFAULT_PASSWORD_OPTIONS: PasswordGenerationOptions = {
  length: 16,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
};

const DEFAULT_PASSPHRASE_OPTIONS: PassphraseOptions = {
  wordCount: 4,
  separator: '-',
  capitalize: false,
  includeNumber: false,
  includeSymbol: false,
};

const PasswordGenerator = () => {
  const [mode, setMode] = useState<Mode>('password');
  const [passwordOptions, setPasswordOptions] = useState<
    PasswordGenerationOptions
  >(DEFAULT_PASSWORD_OPTIONS);
  const [passphraseOptions, setPassphraseOptions] = useState<PassphraseOptions>(
    DEFAULT_PASSPHRASE_OPTIONS,
  );
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [, copy] = useCopyToClipboard();

  const doGenerate = useCallback(
    (currentMode: Mode) => {
      if (currentMode === 'password') {
        const generation = generatePassword(passwordOptions);
        if (generation.success) {
          setResult(generation.data);
          setError(null);
        } else {
          setResult('');
          setError(generation.error);
        }
        return;
      }

      const generation = generatePassphrase(passphraseOptions);
      if (generation.success) {
        setResult(generation.data);
        setError(null);
      } else {
        setResult('');
        setError(generation.error);
      }
    },
    [passwordOptions, passphraseOptions],
  );

  const handleGenerate = useCallback(() => {
    doGenerate(mode);
  }, [doGenerate, mode]);

  // Regenerate when options change
  useEffect(() => {
    doGenerate(mode);
  }, [mode, passwordOptions, passphraseOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = useCallback(async () => {
    if (!result) return;
    const success = await copy(result);
    if (success) {
      toast.success('Copied!');
    } else {
      toast.error('Failed to copy');
    }
  }, [copy, result]);

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
  };

  return (
    <div className='tool-page pwd-tool'>
      <h1>Password Generator</h1>
      <p className='description'>
        Generate strong passwords or memorable passphrases.
      </p>

      {/* Result area at top for quick access */}
      <div className='pwd-result-box'>
        <div
          className='pwd-result-value'
          data-testid='generator-output'
          title={result}
        >
          {result || 'Click Generate'}
        </div>
        <div className='pwd-result-actions'>
          <button
            type='button'
            className='pwd-icon-btn'
            onClick={handleGenerate}
            aria-label='Generate new'
            title='Generate new'
          >
            <FiRefreshCw />
          </button>
          <button
            type='button'
            className='pwd-icon-btn'
            onClick={handleCopy}
            disabled={!result}
            aria-label='Copy to clipboard'
            title='Copy to clipboard'
          >
            <FiCopy />
          </button>
        </div>
      </div>

      {error && <div className='error-message'>{error}</div>}

      {/* Mode toggle */}
      <div className='pwd-mode-toggle'>
        <button
          type='button'
          className={`pwd-mode-btn ${mode === 'password' ? 'active' : ''}`}
          onClick={() => handleModeChange('password')}
        >
          Password
        </button>
        <button
          type='button'
          className={`pwd-mode-btn ${mode === 'passphrase' ? 'active' : ''}`}
          onClick={() => handleModeChange('passphrase')}
        >
          Passphrase
        </button>
      </div>

      {/* Options */}
      <div className='pwd-options'>
        {mode === 'password'
          ? (
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
                  value={passwordOptions.length}
                  onChange={(event) =>
                    setPasswordOptions({
                      ...passwordOptions,
                      length: Number(event.target.value),
                    })}
                />
                <label className='pwd-checkbox'>
                  <input
                    type='checkbox'
                    checked={passwordOptions.includeLowercase}
                    onChange={(event) =>
                      setPasswordOptions({
                        ...passwordOptions,
                        includeLowercase: event.target.checked,
                      })}
                  />
                  <span>a-z</span>
                </label>
                <label className='pwd-checkbox'>
                  <input
                    type='checkbox'
                    checked={passwordOptions.includeUppercase}
                    onChange={(event) =>
                      setPasswordOptions({
                        ...passwordOptions,
                        includeUppercase: event.target.checked,
                      })}
                  />
                  <span>A-Z</span>
                </label>
                <label className='pwd-checkbox'>
                  <input
                    type='checkbox'
                    checked={passwordOptions.includeNumbers}
                    onChange={(event) =>
                      setPasswordOptions({
                        ...passwordOptions,
                        includeNumbers: event.target.checked,
                      })}
                  />
                  <span>0-9</span>
                </label>
                <label className='pwd-checkbox'>
                  <input
                    type='checkbox'
                    checked={passwordOptions.includeSymbols}
                    onChange={(event) =>
                      setPasswordOptions({
                        ...passwordOptions,
                        includeSymbols: event.target.checked,
                      })}
                  />
                  <span>!@#$</span>
                </label>
              </div>

              <label className='pwd-checkbox pwd-checkbox-standalone'>
                <input
                  type='checkbox'
                  checked={passwordOptions.excludeAmbiguous}
                  onChange={(event) =>
                    setPasswordOptions({
                      ...passwordOptions,
                      excludeAmbiguous: event.target.checked,
                    })}
                />
                <span>Exclude ambiguous (0/O, 1/l)</span>
              </label>
            </>
          )
          : (
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
                  value={passphraseOptions.wordCount}
                  onChange={(event) =>
                    setPassphraseOptions({
                      ...passphraseOptions,
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
                  value={passphraseOptions.separator}
                  onChange={(event) =>
                    setPassphraseOptions({
                      ...passphraseOptions,
                      separator: event.target.value,
                    })}
                  maxLength={4}
                />
              </div>

              <div className='pwd-checkboxes'>
                <label className='pwd-checkbox'>
                  <input
                    type='checkbox'
                    checked={passphraseOptions.capitalize}
                    onChange={(event) =>
                      setPassphraseOptions({
                        ...passphraseOptions,
                        capitalize: event.target.checked,
                      })}
                  />
                  <span>Capitalize</span>
                </label>
                <label className='pwd-checkbox'>
                  <input
                    type='checkbox'
                    checked={passphraseOptions.includeNumber}
                    onChange={(event) =>
                      setPassphraseOptions({
                        ...passphraseOptions,
                        includeNumber: event.target.checked,
                      })}
                  />
                  <span>Add number</span>
                </label>
                <label className='pwd-checkbox'>
                  <input
                    type='checkbox'
                    checked={passphraseOptions.includeSymbol}
                    onChange={(event) =>
                      setPassphraseOptions({
                        ...passphraseOptions,
                        includeSymbol: event.target.checked,
                      })}
                  />
                  <span>Add symbol</span>
                </label>
              </div>
            </>
          )}
      </div>
    </div>
  );
};

export default PasswordGenerator;
