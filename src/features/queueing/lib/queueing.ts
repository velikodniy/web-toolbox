import type { Result } from '../../../lib/result.ts';

type ValidationErrorCode =
  | 'INVALID_ARRIVAL_RATE'
  | 'INVALID_SERVICE_RATE'
  | 'INVALID_SERVERS'
  | 'INVALID_CAPACITY'
  | 'INVALID_VARIANCE'
  | 'UNSTABLE_SYSTEM';

type ValidationError = {
  code: ValidationErrorCode;
  message: string;
};

type QueueingResult = {
  utilization: number;
  L: number;
  Lq: number;
  W: number;
  Wq: number;
  P0: number;
  Pn: number | undefined;
  throughput: number;
  effectiveArrivalRate: number;
  blockingProbability: number;
  probabilityOfWait: number;
};

type MM1Input = {
  arrivalRate: number;
  serviceRate: number;
  targetN?: number | undefined;
};

type MMcInput = {
  arrivalRate: number;
  serviceRate: number;
  servers: number;
  targetN?: number | undefined;
};

type MM1KInput = {
  arrivalRate: number;
  serviceRate: number;
  capacity: number;
  targetN?: number | undefined;
};

type MMcKInput = {
  arrivalRate: number;
  serviceRate: number;
  servers: number;
  capacity: number;
  targetN?: number | undefined;
};

type MG1Input = {
  arrivalRate: number;
  serviceRate: number;
  serviceTimeVariance: number;
  targetN?: number | undefined;
};

type MD1Input = {
  arrivalRate: number;
  serviceRate: number;
  targetN?: number | undefined;
};

const validatePositiveRate = (
  rate: number,
  code: ValidationErrorCode,
  name: string,
): ValidationError | null => {
  if (rate <= 0 || !Number.isFinite(rate)) {
    return { code, message: `${name} must be a positive number` };
  }
  return null;
};

const validateServers = (servers: number): ValidationError | null => {
  if (servers < 1 || !Number.isInteger(servers)) {
    return {
      code: 'INVALID_SERVERS',
      message: 'Number of servers must be a positive integer',
    };
  }
  return null;
};

const validateCapacity = (
  capacity: number,
  minCapacity: number,
): ValidationError | null => {
  if (capacity < minCapacity || !Number.isInteger(capacity)) {
    return {
      code: 'INVALID_CAPACITY',
      message: `Capacity must be an integer >= ${minCapacity}`,
    };
  }
  return null;
};

const validateVariance = (variance: number): ValidationError | null => {
  if (variance < 0 || !Number.isFinite(variance)) {
    return {
      code: 'INVALID_VARIANCE',
      message: 'Variance must be a non-negative number',
    };
  }
  return null;
};

const powOverFactorial = (base: number, n: number): number => {
  if (n <= 0) return 1;
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= base / i;
  }
  return result;
};

export const calculateMM1 = (
  input: MM1Input,
): Result<QueueingResult, ValidationError> => {
  const { arrivalRate: lambda, serviceRate: mu, targetN } = input;

  const arrivalError = validatePositiveRate(
    lambda,
    'INVALID_ARRIVAL_RATE',
    'Arrival rate',
  );
  if (arrivalError) return { success: false, error: arrivalError };

  const serviceError = validatePositiveRate(
    mu,
    'INVALID_SERVICE_RATE',
    'Service rate',
  );
  if (serviceError) return { success: false, error: serviceError };

  const rho = lambda / mu;

  if (rho >= 1) {
    return {
      success: false,
      error: {
        code: 'UNSTABLE_SYSTEM',
        message:
          'System is unstable: arrival rate must be less than service rate',
      },
    };
  }

  const L = rho / (1 - rho);
  const Lq = (rho * rho) / (1 - rho);
  const W = 1 / (mu - lambda);
  const Wq = lambda / (mu * (mu - lambda));
  const P0 = 1 - rho;

  let Pn: number | undefined;
  if (targetN !== undefined && targetN >= 0) {
    Pn = P0 * rho ** targetN;
  }

  return {
    success: true,
    data: {
      utilization: rho,
      L,
      Lq,
      W,
      Wq,
      P0,
      Pn,
      throughput: lambda,
      effectiveArrivalRate: lambda,
      blockingProbability: 0,
      probabilityOfWait: rho,
    },
  };
};

const calculateP0ForMMc = (lambda: number, mu: number, c: number): number => {
  const rho = lambda / (c * mu);
  const a = lambda / mu;

  let sum = 0;
  for (let n = 0; n < c; n++) {
    sum += powOverFactorial(a, n);
  }

  const lastTerm = powOverFactorial(a, c) * (1 / (1 - rho));
  return 1 / (sum + lastTerm);
};

const calculateErlangC = (
  lambda: number,
  mu: number,
  c: number,
  P0: number,
): number => {
  const a = lambda / mu;
  const rho = lambda / (c * mu);
  return powOverFactorial(a, c) * (1 / (1 - rho)) * P0;
};

export const calculateMMc = (
  input: MMcInput,
): Result<QueueingResult, ValidationError> => {
  const { arrivalRate: lambda, serviceRate: mu, servers: c, targetN } = input;

  const arrivalError = validatePositiveRate(
    lambda,
    'INVALID_ARRIVAL_RATE',
    'Arrival rate',
  );
  if (arrivalError) return { success: false, error: arrivalError };

  const serviceError = validatePositiveRate(
    mu,
    'INVALID_SERVICE_RATE',
    'Service rate',
  );
  if (serviceError) return { success: false, error: serviceError };

  const serverError = validateServers(c);
  if (serverError) return { success: false, error: serverError };

  const rho = lambda / (c * mu);

  if (rho >= 1) {
    return {
      success: false,
      error: {
        code: 'UNSTABLE_SYSTEM',
        message:
          'System is unstable: arrival rate must be less than total service capacity',
      },
    };
  }

  const P0 = calculateP0ForMMc(lambda, mu, c);
  const Pq = calculateErlangC(lambda, mu, c, P0);
  const Lq = (Pq * rho) / (1 - rho);
  const L = Lq + lambda / mu;
  const Wq = Lq / lambda;
  const W = Wq + 1 / mu;

  let Pn: number | undefined;
  if (targetN !== undefined && targetN >= 0) {
    const a = lambda / mu;
    if (targetN < c) {
      Pn = powOverFactorial(a, targetN) * P0;
    } else {
      Pn = powOverFactorial(a, c) * (rho ** (targetN - c)) * P0;
    }
  }

  return {
    success: true,
    data: {
      utilization: rho,
      L,
      Lq,
      W,
      Wq,
      P0,
      Pn,
      throughput: lambda,
      effectiveArrivalRate: lambda,
      blockingProbability: 0,
      probabilityOfWait: Pq,
    },
  };
};

const calculateMM1KStateProbabilities = (
  lambda: number,
  mu: number,
  K: number,
): number[] => {
  const rho = lambda / mu;
  const probabilities: number[] = [];

  if (Math.abs(rho - 1) < 1e-10) {
    const P0 = 1 / (K + 1);
    for (let n = 0; n <= K; n++) {
      probabilities.push(P0);
    }
  } else {
    const P0 = (1 - rho) / (1 - rho ** (K + 1));
    for (let n = 0; n <= K; n++) {
      probabilities.push(P0 * rho ** n);
    }
  }

  return probabilities;
};

export const calculateMM1K = (
  input: MM1KInput,
): Result<QueueingResult, ValidationError> => {
  const { arrivalRate: lambda, serviceRate: mu, capacity: K, targetN } = input;

  const arrivalError = validatePositiveRate(
    lambda,
    'INVALID_ARRIVAL_RATE',
    'Arrival rate',
  );
  if (arrivalError) return { success: false, error: arrivalError };

  const serviceError = validatePositiveRate(
    mu,
    'INVALID_SERVICE_RATE',
    'Service rate',
  );
  if (serviceError) return { success: false, error: serviceError };

  const capacityError = validateCapacity(K, 1);
  if (capacityError) return { success: false, error: capacityError };

  const probabilities = calculateMM1KStateProbabilities(lambda, mu, K);
  const P0 = probabilities[0];
  const PK = probabilities[K];

  const effectiveLambda = lambda * (1 - PK);
  const rho = effectiveLambda / mu;

  let L = 0;
  for (let n = 0; n <= K; n++) {
    L += n * probabilities[n];
  }

  let Lq = 0;
  for (let n = 1; n <= K; n++) {
    Lq += (n - 1) * probabilities[n];
  }

  const W = L / effectiveLambda;
  const Wq = Lq / effectiveLambda;

  let Pn: number | undefined;
  if (targetN !== undefined && targetN >= 0 && targetN <= K) {
    Pn = probabilities[targetN];
  }

  return {
    success: true,
    data: {
      utilization: rho,
      L,
      Lq,
      W,
      Wq,
      P0,
      Pn,
      throughput: effectiveLambda,
      effectiveArrivalRate: effectiveLambda,
      blockingProbability: PK,
      probabilityOfWait: Math.max(0, 1 - P0 - PK),
    },
  };
};

const calculateMMcKStateProbabilities = (
  lambda: number,
  mu: number,
  c: number,
  K: number,
): number[] => {
  const a = lambda / mu;
  const probabilities: number[] = [];

  let sum = 0;
  for (let n = 0; n < c; n++) {
    sum += powOverFactorial(a, n);
  }

  const rho = lambda / (c * mu);
  const aPowCOverFactC = powOverFactorial(a, c);
  if (Math.abs(rho - 1) < 1e-10) {
    for (let n = c; n <= K; n++) {
      sum += aPowCOverFactC;
    }
  } else {
    for (let n = c; n <= K; n++) {
      sum += aPowCOverFactC * rho ** (n - c);
    }
  }

  const P0 = 1 / sum;

  for (let n = 0; n <= K; n++) {
    if (n < c) {
      probabilities.push(powOverFactorial(a, n) * P0);
    } else {
      probabilities.push(aPowCOverFactC * rho ** (n - c) * P0);
    }
  }

  return probabilities;
};

export const calculateMMcK = (
  input: MMcKInput,
): Result<QueueingResult, ValidationError> => {
  const {
    arrivalRate: lambda,
    serviceRate: mu,
    servers: c,
    capacity: K,
    targetN,
  } = input;

  const arrivalError = validatePositiveRate(
    lambda,
    'INVALID_ARRIVAL_RATE',
    'Arrival rate',
  );
  if (arrivalError) return { success: false, error: arrivalError };

  const serviceError = validatePositiveRate(
    mu,
    'INVALID_SERVICE_RATE',
    'Service rate',
  );
  if (serviceError) return { success: false, error: serviceError };

  const serverError = validateServers(c);
  if (serverError) return { success: false, error: serverError };

  const capacityError = validateCapacity(K, c);
  if (capacityError) return { success: false, error: capacityError };

  const probabilities = calculateMMcKStateProbabilities(lambda, mu, c, K);
  const P0 = probabilities[0];
  const PK = probabilities[K];

  const effectiveLambda = lambda * (1 - PK);

  let L = 0;
  for (let n = 0; n <= K; n++) {
    L += n * probabilities[n];
  }

  let Lq = 0;
  for (let n = c; n <= K; n++) {
    Lq += (n - c) * probabilities[n];
  }

  const W = effectiveLambda > 0 ? L / effectiveLambda : 0;
  const Wq = effectiveLambda > 0 ? Lq / effectiveLambda : 0;

  let avgServersUsed = 0;
  for (let n = 0; n <= K; n++) {
    avgServersUsed += Math.min(n, c) * probabilities[n];
  }
  const rho = avgServersUsed / c;

  let probWait = 0;
  for (let n = c; n < K; n++) {
    probWait += probabilities[n];
  }

  let Pn: number | undefined;
  if (targetN !== undefined && targetN >= 0 && targetN <= K) {
    Pn = probabilities[targetN];
  }

  return {
    success: true,
    data: {
      utilization: rho,
      L,
      Lq,
      W,
      Wq,
      P0,
      Pn,
      throughput: effectiveLambda,
      effectiveArrivalRate: effectiveLambda,
      blockingProbability: PK,
      probabilityOfWait: probWait,
    },
  };
};

export const calculateMG1 = (
  input: MG1Input,
): Result<QueueingResult, ValidationError> => {
  const {
    arrivalRate: lambda,
    serviceRate: mu,
    serviceTimeVariance: variance,
  } = input;

  const arrivalError = validatePositiveRate(
    lambda,
    'INVALID_ARRIVAL_RATE',
    'Arrival rate',
  );
  if (arrivalError) return { success: false, error: arrivalError };

  const serviceError = validatePositiveRate(
    mu,
    'INVALID_SERVICE_RATE',
    'Service rate',
  );
  if (serviceError) return { success: false, error: serviceError };

  const varianceError = validateVariance(variance);
  if (varianceError) return { success: false, error: varianceError };

  const rho = lambda / mu;

  if (rho >= 1) {
    return {
      success: false,
      error: {
        code: 'UNSTABLE_SYSTEM',
        message:
          'System is unstable: arrival rate must be less than service rate',
      },
    };
  }

  // Pollaczek-Khinchine formula: Lq = (lambda^2 * sigma^2 + rho^2) / (2(1-rho))
  const Lq = (lambda * lambda * variance + rho * rho) / (2 * (1 - rho));
  const Wq = Lq / lambda;
  const W = Wq + 1 / mu;
  const L = lambda * W;
  const P0 = 1 - rho;
  const Pn: number | undefined = undefined;

  return {
    success: true,
    data: {
      utilization: rho,
      L,
      Lq,
      W,
      Wq,
      P0,
      Pn,
      throughput: lambda,
      effectiveArrivalRate: lambda,
      blockingProbability: 0,
      probabilityOfWait: rho,
    },
  };
};

export const calculateMD1 = (
  input: MD1Input,
): Result<QueueingResult, ValidationError> => {
  return calculateMG1({
    arrivalRate: input.arrivalRate,
    serviceRate: input.serviceRate,
    serviceTimeVariance: 0,
    targetN: input.targetN,
  });
};

export type { QueueingResult, ValidationError };
