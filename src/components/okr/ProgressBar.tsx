interface ProgressBarProps {
  value: number;
  color: string;
  height?: number;
}

export function ProgressBar({ value, color, height = 8 }: ProgressBarProps) {
  return (
    <div className="w-full overflow-hidden rounded-full" style={{ background: "#1E293B", height }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}
