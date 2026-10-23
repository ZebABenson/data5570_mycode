"use client";

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
};

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  prefix = "",
  suffix = "",
  onChange,
}: SliderFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-navy/80">{label}</label>
        <div className="flex items-center gap-1 rounded-lg border border-steel/40 bg-white px-2 py-1">
          {prefix && <span className="text-sm text-navy/50">{prefix}</span>}
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            className="w-16 text-right text-sm font-semibold text-navy focus:outline-none"
          />
          {suffix && <span className="text-sm text-navy/50">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal"
      />
    </div>
  );
}
