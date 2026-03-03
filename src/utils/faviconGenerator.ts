/**
 * Generates dynamic favicons based on air quality status.
 * Uses canvas to create colored circle indicators.
 */

export type AirQualityLevel = 'good' | 'moderate' | 'poor' | 'unknown';

// Colors matching the airq theme
const COLORS: Record<AirQualityLevel, string> = {
  good: '#137547',     // airq-primary (green)
  moderate: '#FFC914', // airq-secondary (yellow)
  poor: '#ED4C4C',     // airq-tertiary (red)
  unknown: '#999999',  // gray
};

/**
 * Generate a favicon data URL with the specified color
 */
export function generateFavicon(level: AirQualityLevel): string {
  // Create a 32x32 canvas for the favicon
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  const color = COLORS[level];

  // Draw outer ring (darker)
  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#28262C'; // airq-dark
  ctx.fill();

  // Draw inner circle (status color)
  ctx.beginPath();
  ctx.arc(16, 16, 11, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Add a subtle highlight
  ctx.beginPath();
  ctx.arc(12, 12, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fill();

  return canvas.toDataURL('image/png');
}

/**
 * Generate a favicon from an emoji rendered on canvas
 */
function generateEmojiFavicon(emoji: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.font = '28px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 16, 18);

  return canvas.toDataURL('image/png');
}

function setFaviconHref(href: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Update the browser favicon to an air quality indicator
 */
export function updateFavicon(level: AirQualityLevel): void {
  const faviconUrl = generateFavicon(level);
  if (!faviconUrl) return;
  setFaviconHref(faviconUrl);
}

/**
 * Update the browser favicon to a newspaper emoji
 */
export function setNewsFavicon(): void {
  const url = generateEmojiFavicon('\uD83D\uDCF0');
  if (url) setFaviconHref(url);
}

/**
 * Determine air quality level based on CO2 PPM
 * Uses the same thresholds as the color system
 */
export function getAirQualityLevel(co2Ppm: number | null): AirQualityLevel {
  if (co2Ppm === null) return 'unknown';
  if (co2Ppm <= 800) return 'good';
  if (co2Ppm < 1000) return 'moderate';
  return 'poor';
}
