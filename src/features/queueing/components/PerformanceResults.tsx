import { CopyButton } from '../../../components/ui/index.ts';
import { secondsToMs } from '../lib/unit-conversion.ts';

type ModelType = 'MM1' | 'MMc' | 'MM1K' | 'MMcK' | 'MG1' | 'MD1';

export type PerformanceResultsProps = {
  utilization: number;
  Wq: number;
  W: number;
  Lq: number;
  throughput: number;
  model: ModelType;
  blockingProbability: number;
};

const isFiniteCapacity = (model: ModelType): boolean =>
  model === 'MM1K' || model === 'MMcK';

const formatMs = (seconds: number): string => {
  const ms = secondsToMs(seconds);
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  if (ms >= 1) return `${ms.toFixed(1)} ms`;
  return `${(ms * 1000).toFixed(1)} \u03BCs`;
};

export const PerformanceResults = ({
  utilization,
  Wq,
  W,
  Lq,
  throughput,
  model,
  blockingProbability,
}: PerformanceResultsProps) => {
  const showBlocking = isFiniteCapacity(model) && blockingProbability > 0;

  return (
    <div className='result-section'>
      <h3>Performance</h3>
      <div className='metrics-grid'>
        <div className='metric-card'>
          <div className='metric-header'>
            <span className='metric-label'>Server utilization</span>
            <CopyButton text={String(utilization)} compact />
          </div>
          <div className='metric-value'>
            {(utilization * 100).toFixed(1)}%
          </div>
          <div className='utilization-bar'>
            <div
              className='utilization-fill'
              style={{ width: `${Math.min(utilization * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-header'>
            <span className='metric-label'>Avg queue wait</span>
            <CopyButton text={String(secondsToMs(Wq))} compact />
          </div>
          <div className='metric-value'>{formatMs(Wq)}</div>
          <div className='metric-description'>
            Time spent waiting before service
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-header'>
            <span className='metric-label'>Avg total time</span>
            <CopyButton text={String(secondsToMs(W))} compact />
          </div>
          <div className='metric-value'>{formatMs(W)}</div>
          <div className='metric-description'>
            Total time in system (wait + service)
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-header'>
            <span className='metric-label'>Queue depth</span>
            <CopyButton text={String(Lq)} compact />
          </div>
          <div className='metric-value'>{Lq.toFixed(2)}</div>
          <div className='metric-description'>
            Average requests waiting in queue
          </div>
        </div>

        <div className='metric-card'>
          <div className='metric-header'>
            <span className='metric-label'>Throughput</span>
            <CopyButton text={String(throughput)} compact />
          </div>
          <div className='metric-value'>{throughput.toFixed(1)} req/s</div>
          <div className='metric-description'>
            Effective requests served per second
          </div>
        </div>

        {showBlocking && (
          <div className='metric-card'>
            <div className='metric-header'>
              <span className='metric-label'>Requests blocked</span>
              <CopyButton text={String(blockingProbability)} compact />
            </div>
            <div className='metric-value'>
              {(blockingProbability * 100).toFixed(1)}%
            </div>
            <div className='metric-description'>
              Rejected when system is full
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
