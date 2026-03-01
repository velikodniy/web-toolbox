import { ModelDiagram } from '../lib/diagrams.tsx';
import type { ModelType } from '../lib/types.ts';

type ModelInfo = {
  name: string;
  description: string;
};

const MODEL_KEYS: readonly ModelType[] = [
  'MM1',
  'MMc',
  'MM1K',
  'MMcK',
  'MG1',
  'MD1',
];

const isModelType = (value: string): value is ModelType =>
  (MODEL_KEYS as readonly string[]).includes(value);

const MODEL_INFO: Record<ModelType, ModelInfo> = {
  MM1: { name: 'M/M/1', description: 'Single server, infinite queue' },
  MMc: { name: 'M/M/c', description: 'Multiple servers, infinite queue' },
  MM1K: { name: 'M/M/1/K', description: 'Single server, finite capacity K' },
  MMcK: {
    name: 'M/M/c/K',
    description: 'Multiple servers, finite capacity K',
  },
  MG1: {
    name: 'M/G/1',
    description: 'Single server, general service distribution',
  },
  MD1: {
    name: 'M/D/1',
    description: 'Single server, deterministic service time',
  },
};

type ModelSelectorProps = {
  model: ModelType;
  onModelChange: (model: ModelType) => void;
};

export const ModelSelector = (
  { model, onModelChange }: ModelSelectorProps,
) => {
  const info = MODEL_INFO[model];

  return (
    <>
      <div className='form-group'>
        <label htmlFor='model-select'>Model</label>
        <select
          id='model-select'
          className='form-input'
          value={model}
          onChange={(e) => {
            if (isModelType(e.target.value)) onModelChange(e.target.value);
          }}
        >
          {MODEL_KEYS.map((key) => {
            const m = MODEL_INFO[key];
            return (
              <option key={key} value={key}>
                {m.name} — {m.description}
              </option>
            );
          })}
        </select>
      </div>
      <ModelDiagram
        model={model}
        title={info.name}
        description={info.description}
      />
    </>
  );
};
