export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <g fill="#9ca3af">
        <rect x="60" y="120" width="280" height="200" rx="12"/>
        <circle cx="200" cy="220" r="40"/>
      </g>
      <text x="200" y="420" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#6b7280">
        Image unavailable
      </text>
    </svg>`
  );
