interface StopButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function StopButton({ disabled, onClick }: StopButtonProps) {
  return (
    <button
      type="button"
      aria-label="Stop"
      disabled={disabled}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-composer-chipBorder bg-composer-chip text-sm font-semibold text-composer-danger transition hover:bg-composer-elevated disabled:cursor-not-allowed disabled:opacity-45"
      onClick={onClick}
    >
      {"\u25a0"}
    </button>
  );
}
