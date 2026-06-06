interface SendButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function SendButton({ disabled, onClick }: SendButtonProps) {
  return (
    <button
      type="button"
      aria-label="Send"
      disabled={disabled}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-composer-send text-xl font-semibold text-composer-sendText shadow-tile transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:bg-[var(--color-send-disabled)] disabled:text-white disabled:opacity-100"
      onClick={onClick}
    >
      {"\u2191"}
    </button>
  );
}
