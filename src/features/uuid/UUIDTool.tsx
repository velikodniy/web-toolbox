import { useCallback, useEffect, useState } from 'react';
import { FaSync } from 'react-icons/fa';
import {
  CopyButton,
  ErrorMessage,
  ToolPageLayout,
} from '../../components/ui/index.ts';
import {
  generateUuid,
  MAX_UUID,
  NULL_UUID,
  STANDARD_NAMESPACES,
  type UuidVersion,
} from './lib/uuid-domain.ts';
import { UUIDAnalyzer } from './components/UUIDAnalyzer.tsx';

type NamespaceOption = 'DNS' | 'URL' | 'OID' | 'X500' | 'custom';

const VERSION_OPTIONS: { value: UuidVersion; label: string }[] = [
  { value: 'v1', label: 'v1 (Timestamp + MAC)' },
  { value: 'v3', label: 'v3 (MD5 hash)' },
  { value: 'v4', label: 'v4 (Random)' },
  { value: 'v5', label: 'v5 (SHA-1 hash)' },
  { value: 'v6', label: 'v6 (Timestamp, reordered)' },
  { value: 'v7', label: 'v7 (Unix timestamp)' },
];

const NAMESPACE_OPTIONS: { value: NamespaceOption; label: string }[] = [
  { value: 'DNS', label: 'DNS' },
  { value: 'URL', label: 'URL' },
  { value: 'OID', label: 'OID' },
  { value: 'X500', label: 'X.500' },
  { value: 'custom', label: 'Custom' },
];

const requiresNamespaceAndName = (version: UuidVersion): boolean => {
  return version === 'v3' || version === 'v5';
};

const getNamespaceUuid = (
  option: NamespaceOption,
  customValue: string,
): string => {
  if (option === 'custom') {
    return customValue;
  }
  return STANDARD_NAMESPACES[option];
};

const UUIDTool = () => {
  const [uuid, setUuid] = useState<string>('');
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [namespaceOption, setNamespaceOption] = useState<NamespaceOption>(
    'DNS',
  );
  const [customNamespace, setCustomNamespace] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [uuidToAnalyze, setUuidToAnalyze] = useState<string>('');

  const doGenerate = useCallback(
    (
      v: UuidVersion,
      nsOption: NamespaceOption,
      customNs: string,
      n: string,
    ) => {
      setGenerateError(null);
      try {
        if (requiresNamespaceAndName(v)) {
          const newUuid = generateUuid({
            version: v,
            namespace: getNamespaceUuid(nsOption, customNs),
            name: n,
          });
          setUuid(newUuid);
        } else {
          const newUuid = generateUuid({ version: v });
          setUuid(newUuid);
        }
      } catch (error) {
        setGenerateError(
          error instanceof Error ? error.message : 'Failed to generate UUID',
        );
      }
    },
    [],
  );

  const handleGenerate = useCallback(() => {
    doGenerate(version, namespaceOption, customNamespace, name);
  }, [doGenerate, version, namespaceOption, customNamespace, name]);

  useEffect(() => {
    if (!requiresNamespaceAndName(version)) {
      doGenerate(version, namespaceOption, customNamespace, name);
    }
  }, [version, namespaceOption, customNamespace, name, doGenerate]);

  const handleSetNull = () => {
    setUuid(NULL_UUID);
  };

  const handleSetMax = () => {
    setUuid(MAX_UUID);
  };

  const handleAnalyzeGenerated = () => {
    if (uuid) {
      setUuidToAnalyze(uuid);
    }
  };

  return (
    <ToolPageLayout
      title='UUID Generator & Analyzer'
      description='Generate and analyze UUIDs to see their structure and decoded values.'
    >
      <div className='uuid-section'>
        <h2 className='uuid-section-title'>Generate UUID</h2>

        <div className='form-group'>
          <label htmlFor='version'>Version:</label>
          <select
            id='version'
            className='form-input uuid-version-select'
            value={version}
            onChange={(e) => setVersion(e.target.value as UuidVersion)}
          >
            {VERSION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {requiresNamespaceAndName(version) && (
          <>
            <div className='form-group'>
              <label htmlFor='namespace'>Namespace:</label>
              <div className='uuid-namespace-row'>
                <select
                  id='namespace'
                  className='form-input uuid-namespace-select'
                  value={namespaceOption}
                  onChange={(e) =>
                    setNamespaceOption(e.target.value as NamespaceOption)}
                >
                  {NAMESPACE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {namespaceOption === 'custom' && (
                  <input
                    type='text'
                    className='form-input uuid-namespace-input'
                    placeholder='Enter namespace UUID'
                    value={customNamespace}
                    onChange={(e) => setCustomNamespace(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className='form-group'>
              <label htmlFor='name'>Name:</label>
              <input
                id='name'
                type='text'
                className='form-input'
                placeholder='Enter name to hash'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </>
        )}

        <div className='uuid-button-group'>
          <button type='button' className='btn' onClick={handleGenerate}>
            <FaSync /> Generate
          </button>
          <button
            type='button'
            className='btn btn-secondary'
            onClick={handleSetNull}
          >
            NULL UUID
          </button>
          <button
            type='button'
            className='btn btn-secondary'
            onClick={handleSetMax}
          >
            MAX UUID
          </button>
        </div>

        <ErrorMessage error={generateError} />

        {uuid && !generateError && (
          <div className='result-section'>
            <div className='uuid-result-header'>
              <h3>Generated UUID:</h3>
              <div className='uuid-result-actions'>
                <button
                  type='button'
                  className='btn btn-secondary btn-sm'
                  onClick={handleAnalyzeGenerated}
                >
                  Analyze
                </button>
                <CopyButton text={uuid} />
              </div>
            </div>
            <div className='result-output'>{uuid}</div>
          </div>
        )}
      </div>

      <UUIDAnalyzer initialInput={uuidToAnalyze} />
    </ToolPageLayout>
  );
};

export default UUIDTool;
