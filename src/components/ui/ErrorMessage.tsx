type ErrorMessageProps = {
  error: string | null | undefined;
  className?: string;
};

export function ErrorMessage({ error, className = '' }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className={`error-message ${className}`.trim()}>
      {error}
    </div>
  );
}
