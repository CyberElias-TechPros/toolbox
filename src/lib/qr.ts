/** Build QR payload strings for the supported QR types. Pure and tested. */

export type QrType = 'url' | 'text' | 'wifi' | 'email' | 'phone';

export interface QrParams {
  type: QrType;
  url?: string;
  text?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  wifiEncryption?: 'WPA' | 'WEP' | 'nopass';
  wifiHidden?: boolean;
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
  phone?: string;
}

function escWifi(v: string): string {
  return v.replace(/([\\;,:"])/g, '\\$1');
}

export function buildQrPayload(p: QrParams): string {
  switch (p.type) {
    case 'url':
      return p.url ?? '';
    case 'text':
      return p.text ?? '';
    case 'phone':
      return p.phone ? `tel:${p.phone.replace(/[^\d+#*]/g, '')}` : '';
    case 'email': {
      if (!p.emailTo) return '';
      const params = new URLSearchParams();
      if (p.emailSubject) params.set('subject', p.emailSubject);
      if (p.emailBody) params.set('body', p.emailBody);
      const qs = params.toString();
      return `mailto:${p.emailTo}${qs ? `?${qs}` : ''}`;
    }
    case 'wifi': {
      if (!p.wifiSsid) return '';
      const parts = [`T:${p.wifiEncryption === 'WPA' ? 'WPA' : p.wifiEncryption === 'WEP' ? 'WEP' : 'nopass'}`, `S:${escWifi(p.wifiSsid)}`];
      if (p.wifiPassword) parts.push(`P:${escWifi(p.wifiPassword)}`);
      if (p.wifiHidden) parts.push('H:true');
      return `WIFI:${parts.join(';')};`;
    }
  }
}

export function requiredFieldsError(p: QrParams): string | null {
  switch (p.type) {
    case 'url': {
      const u = p.url?.trim() ?? '';
      return u && u !== 'http://' && u !== 'https://' ? null : 'Enter the URL to encode.';
    }
    case 'text':
      return p.text?.trim() ? null : 'Enter the text to encode.';
    case 'phone':
      return p.phone?.trim() ? null : 'Enter a phone number, e.g. +2348012345678.';
    case 'email':
      return p.emailTo?.trim() ? null : 'Enter the recipient email address.';
    case 'wifi':
      return p.wifiSsid?.trim() ? null : 'Enter the Wi-Fi network name (SSID).';
  }
}
