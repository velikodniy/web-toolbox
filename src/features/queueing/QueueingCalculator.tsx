import { useEffect, useState } from 'react';
import { ErrorMessage, ToolPageLayout } from '../../components/ui/index.ts';
import { useDebounce } from '../../hooks/useDebounce.ts';
import {
  calculateMD1,
  calculateMG1,
  calculateMM1,
  calculateMM1K,
  calculateMMc,
  calculateMMcK,
  type QueueingResult,
  type ValidationError,
} from './lib/queueing.ts';
import type { Result } from '../../lib/result.ts';
import { msToRate, varianceMsToSeconds } from './lib/unit-conversion.ts';
import { ModelSelector } from './components/ModelSelector.tsx';
import { InputPanel } from './components/InputPanel.tsx';
import { PerformanceResults } from './components/PerformanceResults.tsx';
import { SLAAnalysis } from './components/SLAAnalysis.tsx';
import { DetailedMetrics } from './components/DetailedMetrics.tsx';
import type { ModelType } from './lib/types.ts';

const DEBOUNCE_MS = 300;

const QueueingCalculator = () => {
  const [model, setModel] = useState<ModelType>('MM1');
  const [requestRate, setRequestRate] = useState('50');
  const [responseTime, setResponseTime] = useState('10');
  const [servers, setServers] = useState('3');
  const [capacity, setCapacity] = useState('100');
  const [varianceMs, setVarianceMs] = useState('100');

  const [result, setResult] = useState<QueueingResult | null>(null);
  const [error, setError] = useState<string>('');

  const debouncedRate = useDebounce(requestRate, DEBOUNCE_MS);
  const debouncedResponse = useDebounce(responseTime, DEBOUNCE_MS);
  const debouncedServers = useDebounce(servers, DEBOUNCE_MS);
  const debouncedCapacity = useDebounce(capacity, DEBOUNCE_MS);
  const debouncedVariance = useDebounce(varianceMs, DEBOUNCE_MS);

  useEffect(() => {
    const lambda = Number.parseFloat(debouncedRate);
    const responseMs = Number.parseFloat(debouncedResponse);
    const c = Number.parseInt(debouncedServers, 10);
    const K = Number.parseInt(debouncedCapacity, 10);
    const vMs = Number.parseFloat(debouncedVariance);

    if (Number.isNaN(lambda) || Number.isNaN(responseMs) || responseMs <= 0) {
      setResult(null);
      setError('');
      return;
    }

    const mu = msToRate(responseMs);
    const sigma2 = varianceMsToSeconds(vMs);

    let calcResult: Result<QueueingResult, ValidationError> | null = null;

    switch (model) {
      case 'MM1':
        calcResult = calculateMM1({ arrivalRate: lambda, serviceRate: mu });
        break;
      case 'MMc':
        if (Number.isNaN(c)) {
          setResult(null);
          setError('');
          return;
        }
        calcResult = calculateMMc({
          arrivalRate: lambda,
          serviceRate: mu,
          servers: c,
        });
        break;
      case 'MM1K':
        if (Number.isNaN(K)) {
          setResult(null);
          setError('');
          return;
        }
        calcResult = calculateMM1K({
          arrivalRate: lambda,
          serviceRate: mu,
          capacity: K,
        });
        break;
      case 'MMcK':
        if (Number.isNaN(c) || Number.isNaN(K)) {
          setResult(null);
          setError('');
          return;
        }
        calcResult = calculateMMcK({
          arrivalRate: lambda,
          serviceRate: mu,
          servers: c,
          capacity: K,
        });
        break;
      case 'MG1':
        if (Number.isNaN(sigma2)) {
          setResult(null);
          setError('');
          return;
        }
        calcResult = calculateMG1({
          arrivalRate: lambda,
          serviceRate: mu,
          serviceTimeVariance: sigma2,
        });
        break;
      case 'MD1':
        calcResult = calculateMD1({ arrivalRate: lambda, serviceRate: mu });
        break;
    }

    if (calcResult?.success) {
      setResult(calcResult.data);
      setError('');
    } else if (calcResult && !calcResult.success) {
      setResult(null);
      setError(calcResult.error.message);
    }
  }, [
    model,
    debouncedRate,
    debouncedResponse,
    debouncedServers,
    debouncedCapacity,
    debouncedVariance,
  ]);

  const mu = msToRate(Number.parseFloat(debouncedResponse));

  return (
    <ToolPageLayout
      title='Queueing Calculator'
      description='Model server capacity, predict wait times, and check SLA targets.'
    >
      <ModelSelector model={model} onModelChange={setModel} />

      <InputPanel
        model={model}
        requestRate={requestRate}
        responseTime={responseTime}
        servers={servers}
        capacity={capacity}
        varianceMs={varianceMs}
        onRequestRateChange={setRequestRate}
        onResponseTimeChange={setResponseTime}
        onServersChange={setServers}
        onCapacityChange={setCapacity}
        onVarianceMsChange={setVarianceMs}
      />

      <ErrorMessage error={error || null} />

      {result && (
        <>
          <PerformanceResults
            utilization={result.utilization}
            Wq={result.Wq}
            W={result.W}
            Lq={result.Lq}
            throughput={result.throughput}
            model={model}
            blockingProbability={result.blockingProbability}
          />

          <SLAAnalysis
            model={model}
            utilization={result.utilization}
            serviceRate={mu}
            Wq={result.Wq}
            servers={Number.parseInt(servers, 10) || 1}
            probabilityOfWait={result.probabilityOfWait}
          />

          <DetailedMetrics result={result} model={model} />
        </>
      )}
    </ToolPageLayout>
  );
};

export default QueueingCalculator;
