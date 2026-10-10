/**
 * ATELIER — External Link Protocol Sanitization & Normalization
 * 
 * Protects users from XSS, malicious protocol exploits, and broken links:
 * 1. Strictly permits only http:// and https:// schemes (and mailto: where specified).
 * 2. Rejects unsafe protocols such as javascript:, vbscript:, data:, file:, etc.
 * 3. Normalizes bare domains (e.g., instagram.com/artist) by auto-prepending https://.
 * 4. Safe getter returns empty string for dangerous links to prevent rendering unsafe hrefs.
 */

export interface UrlValidationResult {
  valid: boolean;
  normalized?: string;
  error?: string;
}

const DISALLOWED_PROTOCOLS = [
  'javascript:',
  'vbscript:',
  'data:',
  'file:',
  'about:',
  'blob:',
];

/**
 * Validates and normalizes an external URL.
 * Only allows http: and https: protocols.
 */
export function validateAndNormalizeUrl(rawUrl: string | undefined | null): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: true, normalized: '' };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: true, normalized: '' };
  }

  // Reject obvious dangerous protocol strings case-insensitively
  const lower = trimmed.toLowerCase();
  for (const proto of DISALLOWED_PROTOCOLS) {
    if (lower.startsWith(proto) || lower.includes(proto)) {
      return {
        valid: false,
        error: `Unsafe link protocol detected (${proto}). Only http:// and https:// links are permitted.`,
      };
    }
  }

  // Auto-prepend https:// if no protocol was specified
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    // If it looks like a relative path or slash, avoid treating as protocol
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: `Invalid protocol (${parsed.protocol}). Only http:// and https:// links are permitted.`,
      };
    }

    // Must have a valid hostname with at least a dot or localhost
    if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
      return {
        valid: false,
        error: 'Please enter a valid web domain or URL.',
      };
    }

    return {
      valid: true,
      normalized: parsed.toString(),
    };
  } catch {
    return {
      valid: false,
      error: 'Please enter a well-formed URL (e.g. https://instagram.com/artist).',
    };
  }
}

/**
 * Safe getter for rendering in `<a href={...}>`.
 * Returns a guaranteed-safe URL or empty string if unsafe.
 */
export function getSafeExternalUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) return '';
  const result = validateAndNormalizeUrl(rawUrl);
  return result.valid && result.normalized ? result.normalized : '';
}

/**
 * Formats Instagram handle or link safely into a canonical web URL.
 */
export function formatInstagramUrl(input: string | undefined | null): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return getSafeExternalUrl(trimmed);
  }

  // Strip leading @
  const cleanHandle = trimmed.replace(/^@/, '');
  if (!/^[a-zA-Z0-9._]+$/.test(cleanHandle)) {
    return '';
  }

  return `https://instagram.com/${cleanHandle}`;
}
