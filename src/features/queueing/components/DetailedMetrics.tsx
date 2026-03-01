import { type ReactNode } from 'react';
import { CopyButton } from '../../../components/ui/index.ts';
import type { QueueingResult } from '../lib/queueing.ts';

type ModelType = 'MM1' | 'MMc' | 'MM1K' | 'MMcK' | 'MG1' | 'MD1';

export type DetailedMetricsProps = {
  result: QueueingResult;
  model: ModelType;
};

type MetricDef = {
  key: keyof QueueingResult;
  label: ReactNode;
  description: string;
  format: (v: number) => string;
  showFor?: (model: ModelType) => boolean;
};

const isFiniteCapacity = (model: ModelType): boolean =>
  model === 'MM1K' || model === 'MMcK';

const pct = (v: number): string => `${(v * 100).toFixed(2)}%`;
const dec = (v: number): string => v.toFixed(6);

const METRICS: MetricDef[] = [
  {
    key: 'utilization',
    label: '\u03C1',
    description: 'Server utilization',
    format: dec,
  },
  {
    key: 'L',
    label: 'L',
    description: 'Avg customers in system',
    format: dec,
  },
  {
    key: 'Lq',
    label: (
      <>
        L<sub>q</sub>
      </>
    ),
    description: 'Avg customers in queue',
    format: dec,
  },
  {
    key: 'W',
    label: 'W',
    description: 'Avg time in system (seconds)',
    format: dec,
  },
  {
    key: 'Wq',
    label: (
      <>
        W<sub>q</sub>
      </>
    ),
    description: 'Avg wait time (seconds)',
    format: dec,
  },
  {
    key: 'P0',
    label: (
      <>
        P<sub>0</sub>
      </>
    ),
    description: 'Probability system is empty',
    format: pct,
  },
  {
    key: 'throughput',
    label: 'Throughput',
    description: 'Effective throughput',
    format: dec,
  },
  {
    key: 'probabilityOfWait',
    label: (
      <>
        P<sub>wait</sub>
      </>
    ),
    description: 'Probability of waiting',
    format: pct,
  },
  {
    key: 'blockingProbability',
    label: (
      <>
        P<sub>block</sub>
      </>
    ),
    description: 'Blocking probability',
    format: pct,
    showFor: isFiniteCapacity,
  },
  {
    key: 'effectiveArrivalRate',
    label: (
      <>
        &lambda;<sub>eff</sub>
      </>
    ),
    description: 'Effective arrival rate',
    format: dec,
    showFor: isFiniteCapacity,
  },
];

export const DetailedMetrics = ({ result, model }: DetailedMetricsProps) => {
  const visibleMetrics = METRICS.filter((m) => !m.showFor || m.showFor(model));

  return (
    <details className='detailed-metrics'>
      <summary>Detailed metrics (mathematical notation)</summary>
      <div className='metrics-grid'>
        {visibleMetrics.map((m) => {
          const value = result[m.key];
          if (value === undefined) return null;
          return (
            <div key={String(m.key)} className='metric-card'>
              <div className='metric-header'>
                <span className='metric-label'>{m.label}</span>
                <CopyButton text={String(value)} compact />
              </div>
              <div className='metric-value'>
                {m.format(value as number)}
              </div>
              <div className='metric-description'>{m.description}</div>
            </div>
          );
        })}
      </div>
    </details>
  );
};
