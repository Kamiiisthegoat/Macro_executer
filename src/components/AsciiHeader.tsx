import React from 'react';

interface AsciiHeaderProps {
  title: string;
  char?: '=' | '-';
  className?: string;
}

export const AsciiHeader: React.FC<AsciiHeaderProps> = ({
  title,
  char = '=',
  className = ''
}) => {
  // Use a dense sequence of repeating characters that is clipped by overflow-hidden
  const filler = char.repeat(80);

  return (
    <div
      className={`flex items-center w-full overflow-hidden select-none py-1 ${className}`}
      style={{ fontSize: 'clamp(11px, 3.4vw, 15px)' }}
    >
      <div className="flex-1 overflow-hidden whitespace-nowrap text-right opacity-35 font-mono tracking-tighter select-none">
        {filler}
      </div>
      <span className="whitespace-nowrap px-2 font-mono font-bold shrink-0 text-[var(--accent-primary)] tracking-tight">
        {title}
      </span>
      <div className="flex-1 overflow-hidden whitespace-nowrap opacity-35 font-mono tracking-tighter select-none">
        {filler}
      </div>
    </div>
  );
};
