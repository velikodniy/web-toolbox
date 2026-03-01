type ModelType = 'MM1' | 'MMc' | 'MM1K' | 'MMcK' | 'MG1' | 'MD1';

type ModelDiagramProps = {
  model: ModelType;
  title: string;
  description: string;
};

export const ModelDiagram = (
  { model, title, description }: ModelDiagramProps,
) => {
  const isMultiServer = model === 'MMc' || model === 'MMcK';
  const hasCapacity = model === 'MM1K' || model === 'MMcK';

  const queueX = 60;
  const queueWidth = hasCapacity ? 90 : 110;
  const queueEnd = queueX + queueWidth;
  const serverX = queueEnd + 40;
  const serverWidth = isMultiServer ? 45 : 50;
  const exitX = serverX + serverWidth;

  const gap = 10;
  const head = 8;

  return (
    <svg
      viewBox='0 0 380 130'
      className='model-diagram'
      role='img'
      aria-labelledby='diagram-title'
    >
      <title id='diagram-title'>{title} queueing model: {description}</title>

      <defs>
        <marker
          id='arrowhead'
          markerWidth='8'
          markerHeight='6'
          refX='8'
          refY='3'
          orient='auto'
          markerUnits='userSpaceOnUse'
        >
          <polygon points='0 0, 8 3, 0 6' fill='currentColor' />
        </marker>
      </defs>

      <g className='arrival-flow'>
        <line
          x1='5'
          y1='65'
          x2={queueX - gap - head}
          y2='65'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='butt'
          markerEnd='url(#arrowhead)'
        />
        <text
          x='28'
          y='48'
          textAnchor='middle'
          fontSize='14'
          fill='currentColor'
        >
          λ
        </text>
      </g>

      <g className='queue'>
        {hasCapacity
          ? (
            <>
              <rect
                x={queueX}
                y='45'
                width={queueWidth}
                height='40'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                rx='4'
              />
              <circle
                cx={queueX + queueWidth / 2 - 20}
                cy='65'
                r='7'
                fill='currentColor'
                opacity='0.4'
              />
              <circle
                cx={queueX + queueWidth / 2}
                cy='65'
                r='7'
                fill='currentColor'
                opacity='0.6'
              />
              <circle
                cx={queueX + queueWidth / 2 + 20}
                cy='65'
                r='7'
                fill='currentColor'
                opacity='0.8'
              />
              <text
                x={queueX + queueWidth / 2}
                y='100'
                textAnchor='middle'
                fontSize='11'
                fill='currentColor'
                opacity='0.8'
              >
                capacity K
              </text>
            </>
          )
          : (
            <>
              <line
                x1={queueX}
                y1='45'
                x2={queueX + 40}
                y2='45'
                stroke='currentColor'
                strokeWidth='2'
                strokeDasharray='4,3'
                opacity='0.6'
              />
              <line
                x1={queueX + 40}
                y1='45'
                x2={queueEnd}
                y2='45'
                stroke='currentColor'
                strokeWidth='2'
              />
              <line
                x1={queueX}
                y1='85'
                x2={queueX + 40}
                y2='85'
                stroke='currentColor'
                strokeWidth='2'
                strokeDasharray='4,3'
                opacity='0.6'
              />
              <line
                x1={queueX + 40}
                y1='85'
                x2={queueEnd}
                y2='85'
                stroke='currentColor'
                strokeWidth='2'
              />
              <line
                x1={queueEnd}
                y1='45'
                x2={queueEnd}
                y2='85'
                stroke='currentColor'
                strokeWidth='2'
              />
              <text
                x={queueX + 18}
                y='65'
                textAnchor='middle'
                dominantBaseline='middle'
                fontSize='18'
                fill='currentColor'
                opacity='0.5'
              >
                ⋯
              </text>
              <circle
                cx={queueX + 50}
                cy='65'
                r='7'
                fill='currentColor'
                opacity='0.4'
              />
              <circle
                cx={queueX + 70}
                cy='65'
                r='7'
                fill='currentColor'
                opacity='0.6'
              />
              <circle
                cx={queueX + 90}
                cy='65'
                r='7'
                fill='currentColor'
                opacity='0.8'
              />
              <text
                x={queueX + queueWidth / 2}
                y='100'
                textAnchor='middle'
                fontSize='11'
                fill='currentColor'
                opacity='0.8'
              >
                ∞
              </text>
            </>
          )}
      </g>

      <g className='queue-to-server-flow'>
        <line
          x1={queueEnd + gap}
          y1='65'
          x2={serverX - gap - head}
          y2='65'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='butt'
          markerEnd='url(#arrowhead)'
        />
      </g>

      <g className='servers'>
        {!isMultiServer
          ? (
            <>
              <rect
                x={serverX}
                y='40'
                width={serverWidth}
                height='50'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                rx='4'
              />
              <text
                x={serverX + serverWidth / 2}
                y='65'
                textAnchor='middle'
                dominantBaseline='middle'
                fontSize='14'
                fill='currentColor'
              >
                μ
              </text>
            </>
          )
          : (
            <>
              <rect
                x={serverX}
                y='27'
                width={serverWidth}
                height='26'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                rx='4'
              />
              <text
                x={serverX + serverWidth / 2}
                y='40'
                textAnchor='middle'
                dominantBaseline='middle'
                fontSize='12'
                fill='currentColor'
              >
                μ
              </text>

              <text
                x={serverX + serverWidth / 2}
                y='65'
                textAnchor='middle'
                dominantBaseline='middle'
                fontSize='14'
                fill='currentColor'
                opacity='0.5'
              >
                ⋮
              </text>

              <rect
                x={serverX}
                y='77'
                width={serverWidth}
                height='26'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                rx='4'
              />
              <text
                x={serverX + serverWidth / 2}
                y='90'
                textAnchor='middle'
                dominantBaseline='middle'
                fontSize='12'
                fill='currentColor'
              >
                μ
              </text>

              <text
                x={serverX + serverWidth / 2}
                y='118'
                textAnchor='middle'
                fontSize='10'
                fill='currentColor'
                opacity='0.8'
              >
                c servers
              </text>
            </>
          )}
      </g>

      <g className='exit-flow'>
        <line
          x1={exitX + gap}
          y1='65'
          x2={exitX + 45 - gap - head}
          y2='65'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='butt'
          markerEnd='url(#arrowhead)'
        />
      </g>

      {hasCapacity && (
        <g className='blocking-indicator'>
          <path
            d='M 55 40 C 55 15, 100 5, 320 5'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeDasharray='5,5'
            opacity='0.5'
          />
          <text
            x='190'
            y='18'
            textAnchor='middle'
            fontSize='10'
            fill='currentColor'
            opacity='0.7'
          >
            blocked when full
          </text>
        </g>
      )}
    </svg>
  );
};
