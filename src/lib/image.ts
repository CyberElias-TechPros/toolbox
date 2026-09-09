/** Client-side image processing helpers (no server, no upload). */

export interface LoadedImage {
  bitmap: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
}

/** Decode an image File into a drawable bitmap with intrinsic size. */
export async function loadImageFile(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Some browsers reject certain formats (e.g. SVG) via createImageBitmap.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(new Error(`Could not decode "${file.name}". The file may be corrupted or not a supported image.`));
      el.src = url;
    });
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) throw new Error(`Could not read dimensions for "${file.name}".`);
    return { bitmap: img, width: w, height: h };
  } finally {
    // Keep the URL alive until the image has rendered on a canvas; revoke lazily.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

/** Draw a bitmap onto a canvas of the given size with high-quality smoothing. */
export function drawToCanvas(
  source: ImageBitmap | HTMLImageElement,
  width: number,
  height: number,
  sx = 0,
  sy = 0,
  sw = width,
  sh = height,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is not available in this browser.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // Solid white background for formats without alpha (JPEG).
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Encode a canvas to a Blob in the given MIME type and quality (0..1). */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('The browser could not encode the image. Try a different format.'));
      },
      type,
      quality,
    );
  });
}

export const MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
};

export function extFromFilename(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

/** True when the browser can encode to this type via canvas.toBlob. */
export function canEncode(type: string): boolean {
  try {
    const c = document.createElement('canvas');
    c.width = 2;
    c.height = 2;
    return c.toDataURL(type).startsWith(`data:${type}`);
  } catch {
    return false;
  }
}
