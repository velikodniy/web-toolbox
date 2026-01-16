import { useCallback, useEffect, useState } from 'react';
import { FaSync } from 'react-icons/fa';
import { CopyButton, ErrorMessage } from '../../components/ui/index.ts';
import { useDebounce } from '../../hooks/useDebounce.ts';
import {
  generateUuid,
  MAX_UUID,
  NULL_UUID,
  STANDARD_NAMESPACES,
  type UuidVersion,
} from './lib/uuid-domain.ts';
import {
  analyzeUuid,
  type UuidAnalysis,
  type UuidPart,
} from './lib/uuid-analyzer.ts';

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

const PART_LEGEND: { name: string; label: string }[] = [
  { name: 'time_low', label: 'Time Low' },
  { name: 'time_mid', label: 'Time Mid' },
  { name: 'time_hi', label: 'Time High' },
  { name: 'clock_seq', label: 'Clock Seq' },
  { name: 'node', label: 'Node' },
  { name: 'unix_ts_ms', label: 'Timestamp' },
  { name: 'rand_a', label: 'Random A' },
  { name: 'rand_b', label: 'Random B' },
  { name: 'random_a', label: 'Random A' },
  { name: 'random_b', label: 'Random B' },
  { name: 'random_c', label: 'Random C' },
  { name: 'random_d', label: 'Random D' },
  { name: 'hash_a', label: 'Hash A' },
  { name: 'hash_b', label: 'Hash B' },
  { name: 'hash_c', label: 'Hash C' },
  { name: 'hash_d', label: 'Hash D' },
  { name: 'version', label: 'Version' },
  { name: 'variant', label: 'Variant' },
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

  const [analyzeInput, setAnalyzeInput] = useState<string>('');
  const [analysis, setAnalysis] = useState<UuidAnalysis | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const debouncedAnalyzeInput = useDebounce(analyzeInput, 300);

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

  useEffect(() => {
    if (!debouncedAnalyzeInput.trim()) {
      setAnalysis(null);
      setAnalyzeError(null);
      return;
    }

    const result = analyzeUuid(debouncedAnalyzeInput);
    if (result.success) {
      setAnalysis(result.data);
      setAnalyzeError(null);
    } else {
      setAnalysis(null);
      setAnalyzeError(result.error);
    }
  }, [debouncedAnalyzeInput]);

  const handleSetNull = () => {
    setUuid(NULL_UUID);
  };

  const handleSetMax = () => {
    setUuid(MAX_UUID);
  };

  const handleAnalyzeGenerated = () => {
    if (uuid) {
      setAnalyzeInput(uuid);
    }
  };

  const renderColoredUuid = (analysisData: UuidAnalysis) => {
    const { uuid: normalizedUuid, parts } = analysisData;
    const hexOnly = normalizedUuid.replace(/-/g, '');

    const segments: React.ReactNode[] = [];
    let charIndex = 0;
    let formattedIndex = 0;

    const formattedUuid = normalizedUuid;
    const hyphenPositions = [8, 13, 18, 23];

    for (const part of parts) {
      const partChars: React.ReactNode[] = [];

      for (let i = part.startIndex; i < part.endIndex; i++) {
        while (hyphenPositions.includes(formattedIndex)) {
          partChars.push(
            <span key={`hyphen-${formattedIndex}`} className='uuid-hyphen'>
              -
            </span>,
          );
          formattedIndex++;
        }

        partChars.push(
          <span key={`char-${formattedIndex}`}>{hexOnly[charIndex]}</span>,
        );
        charIndex++;
        formattedIndex++;
      }

      segments.push(
        <span
          key={`part-${part.name}-${part.startIndex}`}
          className={`uuid-part-${part.name}`}
          title={part.description}
          aria-label={`${part.name}: ${part.hex}`}
        >
          {partChars}
        </span>,
      );
    }

    while (formattedIndex < formattedUuid.length) {
      if (hyphenPositions.includes(formattedIndex)) {
        segments.push(
          <span key={`hyphen-${formattedIndex}`} className='uuid-hyphen'>
            -
          </span>,
        );
      }
      formattedIndex++;
    }

    return <code className='uuid-colored-display'>{segments}</code>;
  };

  const renderBreakdownTable = (parts: UuidPart[]) => {
    return (
      <table className='uuid-table'>
        <thead>
          <tr>
            <th>Part</th>
            <th>Hex</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={`row-${part.name}-${part.startIndex}`}>
              <td className='uuid-table-cell-name'>
                <span
                  className={`uuid-color-dot uuid-part-${part.name}-bg`}
                  aria-hidden='true'
                />
                {part.name}
              </td>
              <td className='uuid-table-cell-mono'>
                {part.hex}
                {part.decodedValue && (
                  <span className='uuid-decoded-value'>
                    ({part.decodedValue})
                  </span>
                )}
              </td>
              <td>{part.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderLegend = (analysisData: UuidAnalysis) => {
    const partNames = new Set(analysisData.parts.map((p) => p.name));
    const relevantLegend = PART_LEGEND.filter((item) =>
      partNames.has(item.name)
    );

    if (relevantLegend.length === 0) return null;

    return (
      <div className='uuid-legend'>
        {relevantLegend.map((item) => (
          <div key={item.name} className='uuid-legend-item'>
            <span
              className={`uuid-color-dot uuid-part-${item.name}-bg`}
              aria-hidden='true'
            />
            {item.label}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='tool-page'>
      <h1>UUID Generator & Analyzer</h1>
      <p className='description'>
        Generate and analyze UUIDs to see their structure and decoded values.
      </p>

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

      <div className='uuid-section-divider'>
        <h2 className='uuid-section-title'>Analyze UUID</h2>

        <div className='form-group'>
          <label htmlFor='analyze-input'>UUID to analyze:</label>
          <input
            id='analyze-input'
            type='text'
            className='form-input'
            placeholder='Paste a UUID to analyze...'
            value={analyzeInput}
            onChange={(e) => setAnalyzeInput(e.target.value)}
          />
        </div>

        <ErrorMessage error={analyzeError} />

        {analysis && (
          <div className='result-section'>
            <div className='uuid-subsection'>
              <h3 className='uuid-subsection-title'>Colored Breakdown:</h3>
              {renderLegend(analysis)}
              <div className='result-output uuid-colored-output'>
                {renderColoredUuid(analysis)}
              </div>
            </div>

            <div className='uuid-subsection'>
              <h3 className='uuid-subsection-title'>Summary:</h3>
              <div className='uuid-summary-grid'>
                <div className='uuid-summary-card'>
                  <div className='uuid-summary-label'>Version</div>
                  <div className='uuid-summary-value uuid-summary-value-lg'>
                    {analysis.isNil
                      ? 'NIL'
                      : analysis.isMax
                      ? 'MAX'
                      : `v${analysis.version}`}
                  </div>
                </div>
                <div className='uuid-summary-card'>
                  <div className='uuid-summary-label'>Variant</div>
                  <div className='uuid-summary-value'>{analysis.variant}</div>
                </div>
                {(analysis.version === 1 || analysis.version === 6) && (
                  <>
                    <div className='uuid-summary-card'>
                      <div className='uuid-summary-label'>Node ID</div>
                      <div className='uuid-summary-value uuid-summary-value-mono'>
                        {analysis.nodeId}
                      </div>
                    </div>
                    <div className='uuid-summary-card'>
                      <div className='uuid-summary-label'>Clock Seq</div>
                      <div className='uuid-summary-value uuid-summary-value-mono'>
                        {analysis.clockSeq}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {(analysis.version === 1 || analysis.version === 6 ||
                analysis.version === 7) && (
                <div className='uuid-summary-timestamps'>
                  <div className='uuid-summary-card'>
                    <div className='uuid-summary-label'>Timestamp (UTC)</div>
                    <div className='uuid-summary-value uuid-summary-value-mono'>
                      {analysis.timestampDate.toISOString()}
                    </div>
                  </div>
                  <div className='uuid-summary-card'>
                    <div className='uuid-summary-label'>
                      Timestamp (Local)
                    </div>
                    <div className='uuid-summary-value uuid-summary-value-mono'>
                      {analysis.timestampDate.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              {(analysis.version === 3 || analysis.version === 5) && (
                <div className='uuid-summary-hash'>
                  <div className='uuid-summary-card'>
                    <div className='uuid-summary-label'>
                      {analysis.version === 3 ? 'MD5' : 'SHA-1'}{' '}
                      Hash (truncated)
                    </div>
                    <div className='uuid-summary-value uuid-summary-value-mono uuid-hash-value'>
                      {analysis.hashHex}
                    </div>
                  </div>
                </div>
              )}
              {(analysis.version === 4 || analysis.version === 7) && (
                <div className='uuid-summary-hash'>
                  <div className='uuid-summary-card'>
                    <div className='uuid-summary-label'>
                      Random Data
                    </div>
                    <div className='uuid-summary-value uuid-summary-value-mono uuid-hash-value'>
                      {analysis.randomDataHex}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className='uuid-subsection-title'>Parts Breakdown:</h3>
              <div className='uuid-table-container'>
                {renderBreakdownTable(analysis.parts)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UUIDTool;
