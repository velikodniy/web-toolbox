import React, { useEffect, useState } from 'react';
import { ErrorMessage } from '../../../components/ui/index.ts';
import { useDebounceEffect } from '../../../hooks/useDebounceEffect.ts';
import {
  analyzeUuid,
  type UuidAnalysis,
  type UuidPart,
} from '../lib/uuid-analyzer.ts';

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

type UUIDAnalyzerProps = {
  initialInput?: string;
};

export function UUIDAnalyzer({ initialInput }: UUIDAnalyzerProps) {
  const [analyzeInput, setAnalyzeInput] = useState<string>(initialInput ?? '');
  const [analysis, setAnalysis] = useState<UuidAnalysis | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  useDebounceEffect(analyzeInput, 300, (debouncedInput) => {
    if (!debouncedInput.trim()) {
      setAnalysis(null);
      setAnalyzeError(null);
      return;
    }

    const result = analyzeUuid(debouncedInput);
    if (result.success) {
      setAnalysis(result.data);
      setAnalyzeError(null);
    } else {
      setAnalysis(null);
      setAnalyzeError(result.error);
    }
  });

  // Sync when parent changes initialInput (e.g., user clicks "Analyze" on a generated UUID)
  useEffect(() => {
    if (initialInput !== undefined) {
      setAnalyzeInput(initialInput);
    }
  }, [initialInput]);

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
                    {analysis.version === 3 ? 'MD5' : 'SHA-1'} Hash (truncated)
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
  );
}
