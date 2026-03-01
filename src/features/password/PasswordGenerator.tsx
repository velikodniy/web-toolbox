import { useCallback, useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import {
  CopyButton,
  ErrorMessage,
  ToolPageLayout,
} from '../../components/ui/index.ts';
import {
  generatePassword,
  type PasswordGenerationOptions,
} from './lib/password.ts';
import {
  generatePassphrase,
  type PassphraseOptions,
} from './lib/passphrase.ts';
import { PasswordOptionsPanel } from './components/PasswordOptionsPanel.tsx';
import { PassphraseOptionsPanel } from './components/PassphraseOptionsPanel.tsx';

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

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
  };

  return (
    <ToolPageLayout
      title='Password Generator'
      description='Generate strong passwords or memorable passphrases.'
    >
      <div className='pwd-tool'>
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
            <CopyButton
              text={result}
              label='Copy to clipboard'
              iconOnly
            />
          </div>
        </div>

        <ErrorMessage error={error} />

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
              <PasswordOptionsPanel
                options={passwordOptions}
                onChange={setPasswordOptions}
              />
            )
            : (
              <PassphraseOptionsPanel
                options={passphraseOptions}
                onChange={setPassphraseOptions}
              />
            )}
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default PasswordGenerator;
