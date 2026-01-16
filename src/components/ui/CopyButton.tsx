import toast from 'react-hot-toast';
import { FiCopy } from 'react-icons/fi';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.ts';

type CopyButtonProps = {
  text: string;
  label?: string;
  successMessage?: string;
  compact?: boolean;
  iconOnly?: boolean;
};

export function CopyButton({
  text,
  label = 'Copy',
  successMessage = 'Copied!',
  compact = false,
  iconOnly = false,
}: CopyButtonProps) {
  const [, copy] = useCopyToClipboard();

  const handleCopy = async () => {
    if (!text) return;
    const success = await copy(text);
    if (success) {
      toast.success(successMessage);
    } else {
      toast.error('Failed to copy');
    }
  };

  const buttonClass = iconOnly
    ? 'icon-btn'
    : compact
    ? 'btn btn-secondary btn-compact'
    : 'btn btn-secondary';

  return (
    <button
      type='button'
      className={buttonClass}
      onClick={handleCopy}
      disabled={!text}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
    >
      {iconOnly ? <FiCopy /> : label}
    </button>
  );
}
