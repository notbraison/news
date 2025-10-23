/**
 * Initializes CSS theme variables by extracting a small color palette
 * from the site logo located at /logo.jpg. The computed values are
 * applied to :root as HSL triplets (e.g. "0 72% 51%") and also logged
 * to the console for persisting into index.css.
 */
export async function initializeThemeFromLogo(): Promise<void> {
  try {
    const img = await loadImage('/logo.jpg');
    const { primary, accent, foreground } = extractPalette(img);

    const root = document.documentElement;
    root.style.setProperty('--primary', `${primary.h} ${primary.s}% ${primary.l}%`);
    root.style.setProperty('--accent', `${accent.h} ${accent.s}% ${accent.l}%`);
    root.style.setProperty('--ring', `${primary.h} ${primary.s}% ${primary.l}%`);
    root.style.setProperty('--foreground', `${foreground.h} ${foreground.s}% ${foreground.l}%`);

    // Useful extras that align with existing design tokens
    root.style.setProperty('--news-red', `${primary.h} ${primary.s}% ${primary.l}%`);
    root.style.setProperty('--news-blue', `${accent.h} ${accent.s}% ${Math.min(50, accent.l)}%`);

    // Log values to bake into index.css
    // Copy the object printed below and replace the corresponding variables in index.css
    console.info('[ThemeFromLogo] Computed HSL values:', {
      primary: `${primary.h} ${primary.s}% ${primary.l}%`,
      accent: `${accent.h} ${accent.s}% ${accent.l}%`,
      foreground: `${foreground.h} ${foreground.s}% ${foreground.l}%`,
      ring: `${primary.h} ${primary.s}% ${primary.l}%`,
    });
  } catch (error) {
    // Fail silently to avoid blocking the app
    // eslint-disable-next-line no-console
    console.warn('[ThemeFromLogo] Failed to initialize from logo:', error);
  }
}

type Hsl = { h: number; s: number; l: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function extractPalette(img: HTMLImageElement): { primary: Hsl; accent: Hsl; foreground: Hsl } {
  const size = 160; // downscale for speed
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      primary: { h: 0, s: 72, l: 51 },
      accent: { h: 210, s: 100, l: 50 },
      foreground: { h: 210, s: 11, l: 15 },
    };
  }
  canvas.width = size;
  canvas.height = Math.max(1, Math.floor((img.height / img.width) * size));
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Build a coarse histogram in RGB space (quantize into 8x8x8 bins)
  const binCounts = new Map<string, { count: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    // Ignore fully transparent or near-white pixels
    if (a < 200) continue;
    if (r > 245 && g > 245 && b > 245) continue;

    const rq = r >> 5; // 0..7
    const gq = g >> 5; // 0..7
    const bq = b >> 5; // 0..7
    const key = `${rq}-${gq}-${bq}`;
    const entry = binCounts.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    entry.count += 1;
    entry.r += r; entry.g += g; entry.b += b;
    binCounts.set(key, entry);
  }

  const bins = Array.from(binCounts.entries())
    .map(([key, v]) => ({ key, count: v.count, r: v.r / v.count, g: v.g / v.count, b: v.b / v.count }))
    .sort((a, b) => b.count - a.count);

  const primaryRgb = bins[0] ? { r: bins[0].r, g: bins[0].g, b: bins[0].b } : { r: 229, g: 62, b: 62 };
  // Accent: choose next sufficiently different hue/lightness
  let accentRgb = { r: 0, g: 0, b: 0 };
  for (let i = 1; i < Math.min(10, bins.length); i++) {
    const cand = { r: bins[i].r, g: bins[i].g, b: bins[i].b };
    const d = colorDistance(primaryRgb, cand);
    if (d > 60) { accentRgb = cand; break; }
  }
  if (accentRgb.r === 0 && accentRgb.g === 0 && accentRgb.b === 0) {
    accentRgb = primaryRgb;
  }

  const primary = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  let accent = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b);

  // Foreground: pick contrasting color (black/white) based on primary lightness
  const foreground: Hsl = primary.l > 60 ? { h: 210, s: 11, l: 15 } : { h: 0, s: 0, l: 98 };

  // Ensure adequate saturation/lightness bounds for UI
  const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));
  const normalize = (hsl: Hsl): Hsl => ({ h: Math.round(hsl.h), s: clamp(Math.round(hsl.s), 35, 90), l: clamp(Math.round(hsl.l), 30, 65) });

  return {
    primary: normalize(primary),
    accent: normalize(accent),
    foreground,
  };
}

function colorDistance(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}


