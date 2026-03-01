import { ModelDiagram } from '../lib/diagrams.tsx';

type ModelType = 'MM1' | 'MMc' | 'MM1K' | 'MMcK' | 'MG1' | 'MD1';

type ModelInfo = {
  name: string;
  description: string;
};

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
          onChange={(e) => onModelChange(e.target.value as ModelType)}
        >
          {(Object.entries(MODEL_INFO) as [ModelType, ModelInfo][]).map(
            ([key, m]) => (
              <option key={key} value={key}>
                {m.name} — {m.description}
              </option>
            ),
          )}
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
