export type ModelType = 'MM1' | 'MMc' | 'MM1K' | 'MMcK' | 'MG1' | 'MD1';

export const isFiniteCapacity = (model: ModelType): boolean =>
  model === 'MM1K' || model === 'MMcK';
