'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  className = '',
}: ToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative h-8 w-14 rounded-full transition-colors ${
        checked ? 'bg-green-500/80' : 'bg-white/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      aria-label={ariaLabel}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      ></span>
    </button>
  );
}

