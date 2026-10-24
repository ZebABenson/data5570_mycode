export function BlueprintBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="blueprintGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="#A9BBC7"
              strokeWidth="0.75"
              opacity="0.35"
            />
          </pattern>
          <linearGradient id="blueprintFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EEF3F6" stopOpacity="0" />
            <stop offset="75%" stopColor="#EEF3F6" stopOpacity="0" />
            <stop offset="100%" stopColor="#EEF3F6" stopOpacity="1" />
          </linearGradient>
        </defs>

        <rect width="1600" height="800" fill="url(#blueprintGrid)" />

        {/* Elevation drawing: a simple multi-story office building outline */}
        <g stroke="#10263F" strokeWidth="1.4" fill="none" opacity="0.09">
          <rect x="980" y="140" width="340" height="420" />
          <line x1="980" y1="220" x2="1320" y2="220" />
          <line x1="980" y1="300" x2="1320" y2="300" />
          <line x1="980" y1="380" x2="1320" y2="380" />
          <line x1="980" y1="460" x2="1320" y2="460" />
          <line x1="1066" y1="140" x2="1066" y2="560" />
          <line x1="1150" y1="140" x2="1150" y2="560" />
          <line x1="1234" y1="140" x2="1234" y2="560" />
          <rect x="1120" y="470" width="60" height="90" />
        </g>

        {/* Dimension line under the elevation drawing only -- kept clear of the text column */}
        <g stroke="#5B8090" strokeWidth="1" fill="none" opacity="0.2">
          <line x1="980" y1="610" x2="1320" y2="610" />
          <line x1="980" y1="600" x2="980" y2="620" />
          <line x1="1320" y1="600" x2="1320" y2="620" />
        </g>

        <rect width="1600" height="800" fill="url(#blueprintFade)" />
      </svg>
    </div>
  );
}
