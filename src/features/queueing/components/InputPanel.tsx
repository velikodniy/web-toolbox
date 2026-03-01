import { msToRate } from '../lib/unit-conversion.ts';

type ModelType = 'MM1' | 'MMc' | 'MM1K' | 'MMcK' | 'MG1' | 'MD1';

export type InputPanelProps = {
  model: ModelType;
  requestRate: string;
  responseTime: string;
  servers: string;
  capacity: string;
  varianceMs: string;
  onRequestRateChange: (value: string) => void;
  onResponseTimeChange: (value: string) => void;
  onServersChange: (value: string) => void;
  onCapacityChange: (value: string) => void;
  onVarianceMsChange: (value: string) => void;
};

const formatEquivalent = (value: number): string =>
  Number.isFinite(value) ? value.toFixed(1).replace(/\.0$/, '') : '\u2014';

export const InputPanel = ({
  model,
  requestRate,
  responseTime,
  servers,
  capacity,
  varianceMs,
  onRequestRateChange,
  onResponseTimeChange,
  onServersChange,
  onCapacityChange,
  onVarianceMsChange,
}: InputPanelProps) => {
  const showServers = model === 'MMc' || model === 'MMcK';
  const showCapacity = model === 'MM1K' || model === 'MMcK';
  const showVariance = model === 'MG1';

  const lambda = Number.parseFloat(requestRate);
  const mu = msToRate(Number.parseFloat(responseTime));
  const sigmaS = Number.parseFloat(varianceMs) / 1_000_000;

  return (
    <div className='input-grid'>
      <div className='form-group'>
        <label htmlFor='request-rate'>
          Request rate
          {Number.isFinite(lambda) && lambda > 0 && (
            <span className='text-muted'>
              {' '}
              (&lambda; = {formatEquivalent(lambda)}/s)
            </span>
          )}
        </label>
        <input
          id='request-rate'
          type='number'
          className='form-input'
          value={requestRate}
          onChange={(e) => onRequestRateChange(e.target.value)}
          min='0'
          step='1'
          placeholder='e.g., 50'
        />
        <small className='input-help'>req/s</small>
      </div>

      <div className='form-group'>
        <label htmlFor='response-time'>
          Avg response time
          {Number.isFinite(mu) && mu > 0 && (
            <span className='text-muted'>
              {' '}
              (&mu; = {formatEquivalent(mu)}/s)
            </span>
          )}
        </label>
        <input
          id='response-time'
          type='number'
          className='form-input'
          value={responseTime}
          onChange={(e) => onResponseTimeChange(e.target.value)}
          min='0'
          step='1'
          placeholder='e.g., 20'
        />
        <small className='input-help'>ms</small>
      </div>

      {showServers && (
        <div className='form-group'>
          <label htmlFor='servers'>Server count</label>
          <input
            id='servers'
            type='number'
            className='form-input'
            value={servers}
            onChange={(e) => onServersChange(e.target.value)}
            min='1'
            step='1'
            placeholder='e.g., 3'
          />
          <small className='input-help'>parallel workers</small>
        </div>
      )}

      {showCapacity && (
        <div className='form-group'>
          <label htmlFor='capacity'>Max capacity</label>
          <input
            id='capacity'
            type='number'
            className='form-input'
            value={capacity}
            onChange={(e) => onCapacityChange(e.target.value)}
            min='1'
            step='1'
            placeholder='e.g., 100'
          />
          <small className='input-help'>
            total system slots (queue + servers)
          </small>
        </div>
      )}

      {showVariance && (
        <div className='form-group'>
          <label htmlFor='variance'>
            Response time variance
            {Number.isFinite(sigmaS) && sigmaS >= 0 && (
              <span className='text-muted'>
                {' '}
                (&sigma;&sup2; = {sigmaS.toFixed(6)} s&sup2;)
              </span>
            )}
          </label>
          <input
            id='variance'
            type='number'
            className='form-input'
            value={varianceMs}
            onChange={(e) => onVarianceMsChange(e.target.value)}
            min='0'
            step='1'
            placeholder='e.g., 100'
          />
          <small className='input-help'>ms&sup2;</small>
        </div>
      )}
    </div>
  );
};
