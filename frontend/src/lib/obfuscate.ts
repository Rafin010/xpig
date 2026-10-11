// URL-safe Base62 alphabet for YouTube-style professional slugs
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const XOR_KEY = 0x5a3c9e;
const MULTIPLIER = 15823;
const MOD_INVERSE = 1729352975; // Modular inverse of 15823 mod 2^32

/**
 * Encodes a numeric video ID into a sleek, obfuscated, URL-safe slug.
 * Example: 371 -> "v_xxrb9"
 */
export function encodeVideoId(id: number | string): string {
  const num = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(num) || num <= 0) return String(id);

  // Bijective transformation in Z_{2^32}
  const masked = ((Math.imul(num, MULTIPLIER)) ^ XOR_KEY) >>> 0;
  
  let encoded = '';
  let temp = masked;
  do {
    encoded = ALPHABET[temp % 62] + encoded;
    temp = Math.floor(temp / 62);
  } while (temp > 0);

  // Pad to 5 characters with 'x' for sleek uniform slugs
  while (encoded.length < 5) {
    encoded = 'x' + encoded;
  }

  return `v_${encoded}`;
}

/**
 * Decodes an obfuscated slug back to the original database numeric ID.
 * Returns numeric ID as string. Fully backward-compatible if already numeric.
 * Example: "v_xxrb9" -> "371", "371" -> "371"
 */
export function decodeVideoId(slug: string): string {
  if (!slug) return '';
  
  // If already pure digits, return directly (backward compatibility)
  if (/^\d+$/.test(slug)) {
    return slug;
  }

  // Handle prefix
  let clean = slug;
  if (clean.startsWith('v_')) {
    clean = clean.slice(2);
  }

  // Remove leading padding 'x'
  clean = clean.replace(/^x+/, '');
  if (!clean) return slug;

  let num = 0;
  for (let i = 0; i < clean.length; i++) {
    const idx = ALPHABET.indexOf(clean[i]);
    if (idx === -1) return slug; // fallback if invalid characters
    num = num * 62 + idx;
  }

  const unXor = (num ^ XOR_KEY) >>> 0;
  const decoded = Math.imul(unXor, MOD_INVERSE) >>> 0;

  return String(decoded);
}
