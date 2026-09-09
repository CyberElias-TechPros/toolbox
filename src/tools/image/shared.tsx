import { downloadBlob } from '../../lib/utils';
import { track } from '../../lib/track';
import { Button } from '../../components/ui/primitives';

/** Small download button used by image/PDF result rows. */
export function DownloadButton({ blob, filename }: { blob: Blob; filename: string }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => {
        downloadBlob(blob, filename);
        track('download_clicked', filename);
      }}
    >
      ⬇ Download
    </Button>
  );
}
