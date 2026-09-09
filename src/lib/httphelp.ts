/** Offline reference data: HTTP status codes, MIME types, user-agent parsing. */

export interface StatusInfo {
  code: number;
  name: string;
  meaning: string;
  hint: string;
}

export const HTTP_STATUS: StatusInfo[] = [
  { code: 100, name: 'Continue', meaning: 'The server received the request header; the client may continue sending the body.', hint: 'Rarely seen in browsers.' },
  { code: 101, name: 'Switching Protocols', meaning: 'The client requested a protocol change (e.g. to WebSocket) and the server agreed.', hint: 'Common for WebSocket upgrades.' },
  { code: 200, name: 'OK', meaning: 'The request succeeded and the response contains the result.', hint: 'The normal success code.' },
  { code: 201, name: 'Created', meaning: 'A new resource was created (e.g. POST returned the new object).', hint: 'Usually include a Location header.' },
  { code: 202, name: 'Accepted', meaning: 'The request was accepted for processing but has not yet been processed.', hint: 'Typical for async jobs.' },
  { code: 204, name: 'No Content', meaning: 'The request succeeded but there is no body to return.', hint: 'Common for DELETE and PATCH confirmations.' },
  { code: 301, name: 'Moved Permanently', meaning: 'The resource has a new URL permanently; clients should update bookmarks.', hint: 'Old URL should redirect forever.' },
  { code: 302, name: 'Found', meaning: 'The resource was found at another URL (temporary redirect).', hint: 'Browsers treat 302/303/307 almost the same.' },
  { code: 304, name: 'Not Modified', meaning: 'The cached copy is still fresh; the client should use its cache.', hint: 'Key to HTTP caching.' },
  { code: 307, name: 'Temporary Redirect', meaning: 'Same as 302 but the request method and body must not change on redirect.', hint: 'Strict temporary redirect.' },
  { code: 308, name: 'Permanent Redirect', meaning: 'Like 301 but the request method and body must not change on redirect.', hint: 'Strict permanent redirect.' },
  { code: 400, name: 'Bad Request', meaning: 'The server cannot process the request because of malformed syntax or invalid input.', hint: 'Check the payload format.' },
  { code: 401, name: 'Unauthorized', meaning: 'Authentication is missing or invalid. Log in and retry.', hint: 'Missing/expired token or cookie.' },
  { code: 403, name: 'Forbidden', meaning: 'The server understood the request but refuses to authorize it.', hint: 'Authenticated but not allowed.' },
  { code: 404, name: 'Not Found', meaning: 'The resource does not exist at that URL.', hint: 'Check the path for typos.' },
  { code: 405, name: 'Method Not Allowed', meaning: 'The HTTP method is not allowed for that resource (e.g. POST to a read-only endpoint).', hint: 'Check the API docs for allowed verbs.' },
  { code: 409, name: 'Conflict', meaning: 'The request conflicts with the current state of the resource.', hint: 'Often a duplicate create or version clash.' },
  { code: 413, name: 'Payload Too Large', meaning: 'The request body is larger than the server is willing to process.', hint: 'Raise limits or split uploads.' },
  { code: 415, name: 'Unsupported Media Type', meaning: 'The request format (Content-Type) is not supported.', hint: 'Usually a wrong or missing header.' },
  { code: 418, name: "I'm a Teapot", meaning: 'A jest code from RFC 2324 (Hyper Text Coffee Pot Control Protocol).', hint: 'Easter egg — not a real error.' },
  { code: 422, name: 'Unprocessable Entity', meaning: 'The format is valid but the semantic content was rejected.', hint: 'Validation failure on otherwise well-formed data.' },
  { code: 429, name: 'Too Many Requests', meaning: 'The client sent too many requests in a given time (rate limited).', hint: 'Back off and retry; check Retry-After.' },
  { code: 451, name: 'Unavailable For Legal Reasons', meaning: 'Content is unavailable due to a legal demand.', hint: 'Rare in practice.' },
  { code: 500, name: 'Internal Server Error', meaning: 'Something broke on the server; the response is not useful.', hint: 'The server team must look at logs.' },
  { code: 501, name: 'Not Implemented', meaning: 'The server does not support the functionality required.', hint: 'Endpoint not built yet.' },
  { code: 502, name: 'Bad Gateway', meaning: 'A proxy received an invalid response from the upstream server.', hint: 'Upstream is down or misconfigured.' },
  { code: 503, name: 'Service Unavailable', meaning: 'The server is temporarily overloaded or under maintenance.', hint: 'Usually transient — retry later.' },
  { code: 504, name: 'Gateway Timeout', meaning: 'A proxy did not get a timely response from the upstream server.', hint: 'Upstream is slow or stuck.' },
];

export interface MimeInfo {
  ext: string;
  name: string;
  type: string;
}

export const MIME_TYPES: MimeInfo[] = [
  { ext: 'html', name: 'HTML document', type: 'text/html' },
  { ext: 'css', name: 'Cascading Style Sheet', type: 'text/css' },
  { ext: 'js', name: 'JavaScript', type: 'text/javascript' },
  { ext: 'mjs', name: 'JavaScript module', type: 'text/javascript' },
  { ext: 'json', name: 'JSON', type: 'application/json' },
  { ext: 'xml', name: 'XML', type: 'application/xml' },
  { ext: 'txt', name: 'Plain text', type: 'text/plain' },
  { ext: 'csv', name: 'Comma-separated values', type: 'text/csv' },
  { ext: 'pdf', name: 'PDF document', type: 'application/pdf' },
  { ext: 'doc', name: 'Word document', type: 'application/msword' },
  { ext: 'docx', name: 'Word document (OOXML)', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { ext: 'xls', name: 'Excel spreadsheet', type: 'application/vnd.ms-excel' },
  { ext: 'xlsx', name: 'Excel spreadsheet (OOXML)', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { ext: 'pptx', name: 'PowerPoint (OOXML)', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  { ext: 'zip', name: 'ZIP archive', type: 'application/zip' },
  { ext: 'gz', name: 'Gzip archive', type: 'application/gzip' },
  { ext: 'tar', name: 'TAR archive', type: 'application/x-tar' },
  { ext: '7z', name: '7-Zip archive', type: 'application/x-7z-compressed' },
  { ext: 'rar', name: 'RAR archive', type: 'application/vnd.rar' },
  { ext: 'png', name: 'PNG image', type: 'image/png' },
  { ext: 'jpg', name: 'JPEG image', type: 'image/jpeg' },
  { ext: 'jpeg', name: 'JPEG image', type: 'image/jpeg' },
  { ext: 'gif', name: 'GIF image', type: 'image/gif' },
  { ext: 'webp', name: 'WebP image', type: 'image/webp' },
  { ext: 'svg', name: 'SVG image', type: 'image/svg+xml' },
  { ext: 'avif', name: 'AVIF image', type: 'image/avif' },
  { ext: 'ico', name: 'Favicon / icon', type: 'image/x-icon' },
  { ext: 'bmp', name: 'Bitmap image', type: 'image/bmp' },
  { ext: 'tiff', name: 'TIFF image', type: 'image/tiff' },
  { ext: 'mp4', name: 'MP4 video', type: 'video/mp4' },
  { ext: 'webm', name: 'WebM video', type: 'video/webm' },
  { ext: 'mov', name: 'QuickTime video', type: 'video/quicktime' },
  { ext: 'mp3', name: 'MP3 audio', type: 'audio/mpeg' },
  { ext: 'wav', name: 'WAV audio', type: 'audio/wav' },
  { ext: 'ogg', name: 'OGG audio/video', type: 'audio/ogg' },
  { ext: 'm4a', name: 'MPEG-4 audio', type: 'audio/mp4' },
  { ext: 'woff', name: 'Web font', type: 'font/woff' },
  { ext: 'woff2', name: 'Web font (WOFF2)', type: 'font/woff2' },
  { ext: 'ttf', name: 'TrueType font', type: 'font/ttf' },
  { ext: 'otf', name: 'OpenType font', type: 'font/otf' },
  { ext: 'rtf', name: 'Rich Text Format', type: 'application/rtf' },
  { ext: 'ics', name: 'iCalendar', type: 'text/calendar' },
  { ext: 'wasm', name: 'WebAssembly', type: 'application/wasm' },
];

export interface ParsedUserAgent {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: 'desktop' | 'phone' | 'tablet' | 'unknown';
}

const WINDOWS_MAP: Array<[RegExp, string]> = [
  [/nt 10\.0/i, 'Windows 10/11'],
  [/nt 6\.3/i, 'Windows 8.1'],
  [/nt 6\.2/i, 'Windows 8'],
  [/nt 6\.1/i, 'Windows 7'],
  [/nt 6\.0/i, 'Windows Vista'],
  [/nt 5\.1/i, 'Windows XP'],
];

/** Heuristic, dependency-free user-agent parsing. Best-effort by nature. */
export function parseUserAgent(ua: string): ParsedUserAgent {
  let browser = 'Unknown';
  let browserVersion = '';

  const edge = ua.match(/Edg(?:e|A|iOS)?\/([\d.]+)/i);
  const opera = ua.match(/OPR\/([\d.]+)/i);
  const firefox = ua.match(/Firefox\/([\d.]+)/i);
  const chrome = ua.match(/Chrome\/([\d.]+)/i);
  const safari = ua.match(/Version\/([\d.]+).*Safari/i);
  const ie = ua.match(/(?:MSIE |rv:)([\d.]+)/i);

  if (edge) {
    browser = 'Edge';
    browserVersion = edge[1];
  } else if (opera) {
    browser = 'Opera';
    browserVersion = opera[1];
  } else if (firefox) {
    browser = 'Firefox';
    browserVersion = firefox[1];
  } else if (ie) {
    browser = 'Internet Explorer';
    browserVersion = ie[1];
  } else if (chrome) {
    browser = 'Chrome';
    browserVersion = chrome[1];
  } else if (safari) {
    browser = 'Safari';
    browserVersion = safari[1];
  }

  let os = 'Unknown';
  let osVersion = '';
  if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
    const v = ua.match(/OS (\d+[_\d]*) like Mac/i);
    if (v) osVersion = v[1].replace(/_/g, '.');
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    const v = ua.match(/Android ([\d.]+)/i);
    if (v) osVersion = v[1];
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
    for (const [re, label] of WINDOWS_MAP) {
      if (re.test(ua)) {
        osVersion = label.replace('Windows ', '');
        os = label;
        break;
      }
    }
  } else if (/Mac OS X/i.test(ua)) {
    os = 'macOS';
    const v = ua.match(/Mac OS X ([\d_]+)/i);
    if (v) osVersion = v[1].replace(/_/g, '.');
  } else if (/CrOS/i.test(ua)) {
    os = 'ChromeOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  let device: ParsedUserAgent['device'] = 'desktop';
  if (/iPad|Tablet/i.test(ua)) device = 'tablet';
  else if (/iPhone|iPod|Android(?!.*Mobile)|Mobile/i.test(ua) && /Mobile/i.test(ua)) device = 'phone';
  else if (/Android/i.test(ua) && !/Mobile/i.test(ua)) device = 'tablet';

  return { browser, browserVersion, os, osVersion, device };
}
