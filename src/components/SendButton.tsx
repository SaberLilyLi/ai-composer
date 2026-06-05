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
      className="flex h-11 w-11 items-center justify-center rounded-full bg-composer-send text-lg font-semibold text-composer-sendText shadow-tile transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-45"
      onClick={onClick}
    >
      {"\u2191"}
    </button>
  );
}
