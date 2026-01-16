import { CopyButton } from './CopyButton.tsx';

type KeyValueRowProps = {
  label: string;
  value: string;
  copyValue?: string;
  copySuccessMessage?: string;
};

export function KeyValueRow({
  label,
  value,
  copyValue,
  copySuccessMessage,
}: KeyValueRowProps) {
  return (
    <div className='flex-between mb-half'>
      <span className='text-muted'>{label}:</span>
      <span className='flex-center font-medium'>
        {value}
        {copyValue && (
          <CopyButton
            text={copyValue}
            successMessage={copySuccessMessage ?? `${label} copied!`}
            iconOnly
          />
        )}
      </span>
    </div>
  );
}
