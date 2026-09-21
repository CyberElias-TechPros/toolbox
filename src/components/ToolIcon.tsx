import {
  FileText,
  Image,
  Type,
  Code2,
  Calculator,
  Megaphone,
  BriefcaseBusiness,
  Wrench,
  FileStack,
  FileOutput,
  Combine,
  ScanLine,
  QrCode,
  Shrink,
  Braces,
  LockKeyhole,
  ArrowDownUp,
  Clock,
  FileSpreadsheet,
  Archive,
  Binary,
  Crop,
  Palette,
  Scissors,
  Hash,
} from 'lucide-react';
export function ToolIcon({
  category,
  slug = '',
  size = 22,
}: {
  category: string;
  slug?: string;
  size?: number;
}) {
  const Icon = slug.includes('combine')
    ? Combine
    : slug.includes('word')
      ? FileText
      : slug.includes('excel') || slug.includes('spreadsheet') || slug.includes('csv')
        ? FileSpreadsheet
        : slug.includes('zip')
          ? Archive
          : slug.includes('qr')
            ? QrCode
            : slug.includes('compress')
              ? Shrink
              : slug.includes('json')
                ? Braces
                : slug.includes('password')
                  ? LockKeyhole
                  : slug.includes('merge')
                    ? FileStack
                    : slug.includes('split')
                      ? Scissors
                      : slug.includes('crop')
                        ? Crop
                        : slug.includes('color')
                          ? Palette
                          : slug.includes('hash')
                            ? Hash
                            : slug.includes('binary')
                              ? Binary
                              : slug.includes('clock') || slug.includes('timer')
                                ? Clock
                                : slug.includes('convert')
                                  ? ArrowDownUp
                                  : slug.includes('to-pdf')
                                    ? FileOutput
                                    : {
                                        image: Image,
                                        pdf: FileText,
                                        text: Type,
                                        developer: Code2,
                                        calculator: Calculator,
                                        marketing: Megaphone,
                                        business: BriefcaseBusiness,
                                        utility: Wrench,
                                      }[category] || ScanLine;
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
