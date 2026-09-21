import JSZip from 'jszip';
export async function openZip(buffer: ArrayBuffer | Uint8Array) {
  const zip = await JSZip.loadAsync(buffer);
  const files = Object.values(zip.files).filter((file) => !file.dir);
  if (files.length > 1000) throw Error('Use archives with 1,000 files or fewer.');
  const sizes = files.map(
    (f) => (f as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize,
  );
  if (
    sizes.some((n) => typeof n !== 'number') ||
    sizes.reduce<number>((sum, n) => sum + (n || 0), 0) > 200 * 1024 * 1024
  )
    throw Error('Expanded archive exceeds the 200 MB safety limit.');
  return files;
}
export function uniqueFilename(name: string, used: Set<string>): string {
  const safe = name.replace(/[<>:"/\\|?*]/g, '_') || 'file';
  let out = safe,
    i = 2;
  const dot = safe.lastIndexOf('.'),
    stem = dot > 0 ? safe.slice(0, dot) : safe,
    ext = dot > 0 ? safe.slice(dot) : '';
  while (used.has(out)) out = `${stem} (${i++})${ext}`;
  used.add(out);
  return out;
}
