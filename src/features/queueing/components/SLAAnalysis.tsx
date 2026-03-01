import { useState } from 'react';
import {
  calculateExceedanceProbability,
  calculateWaitPercentile,
} from '../lib/percentiles.ts';
import { secondsToMs } from '../lib/unit-conversion.ts';

type ModelType = 'MM1' | 'MMc' | 'MM1K' | 'MMcK' | 'MG1' | 'MD1';

export type SLAAnalysisProps = {
  model: ModelType;
  utilization: number;
  serviceRate: number;
  Wq: number;
  servers?: number;
  probabilityOfWait?: number;
};

const PERCENTILES = [0.5, 0.9, 0.95, 0.99] as const;
const PERCENTILE_LABELS = ['P50', 'P90', 'P95', 'P99'] as const;

const isApproximate = (model: ModelType): boolean =>
  model !== 'MM1' && model !== 'MMc';

const formatMs = (seconds: number): string => {
  const ms = secondsToMs(seconds);
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  if (ms >= 1) return `${ms.toFixed(1)} ms`;
  return `${(ms * 1000).toFixed(1)} \u03BCs`;
};

export const SLAAnalysis = ({
  model,
  utilization,
  serviceRate,
  Wq,
  servers,
  probabilityOfWait,
}: SLAAnalysisProps) => {
  const [targetMs, setTargetMs] = useState('');

  const approximate = isApproximate(model);

  const percentileResults = PERCENTILES.map((p) =>
    calculateWaitPercentile({
      model,
      utilization,
      serviceRate,
      percentile: p,
      servers,
      probabilityOfWait,
      Wq,
    })
  );

  const targetSeconds = Number.parseFloat(targetMs) / 1000;
  const targetResult =
    targetMs && Number.isFinite(targetSeconds) && targetSeconds > 0
      ? calculateExceedanceProbability({
        model,
        utilization,
        serviceRate,
        targetSeconds,
        servers,
        probabilityOfWait,
        Wq,
      })
      : null;
  const meetTarget = targetResult ? (1 - targetResult.probability) * 100 : null;

  return (
    <div className='result-section'>
      <h3>
        SLA Analysis
        {approximate && <span className='badge-approximate'>approximate</span>}
      </h3>

      <table className='percentile-table'>
        <thead>
          <tr>
            {PERCENTILE_LABELS.map((label) => <th key={label}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            {percentileResults.map((result, i) => (
              <td key={PERCENTILE_LABELS[i]}>{formatMs(result.seconds)}</td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className='sla-target'>
        <div className='form-group'>
          <label htmlFor='sla-target'>
            What % of requests complete within target?
          </label>
          <div className='sla-target-input'>
            <input
              id='sla-target'
              type='number'
              className='form-input'
              value={targetMs}
              onChange={(e) => setTargetMs(e.target.value)}
              min='0'
              step='1'
              placeholder='e.g., 50'
            />
            <span className='input-unit'>ms</span>
          </div>
        </div>
        {meetTarget !== null && (
          <div className='sla-result'>
            <span className='metric-value'>{meetTarget.toFixed(2)}%</span>
            <span className='metric-description'>
              of requests wait less than {targetMs} ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
