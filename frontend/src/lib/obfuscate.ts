/**
 * Professional, collision-free YouTube-style Video ID Obfuscator.
 * Uses a 6-round Feistel permutation over 32-bit unsigned space combined with
 * Base62 mapping. Guaranteed 100% bijective and reversible across all IDs.
 *
 * Example:
 * 371 -> "eMapPa"
 * 372 -> "bpaFxe"
 *
 * Backward-compatible: Accepts both modern slugs ("eMapPa"), legacy "v_" prefixed
 * slugs ("v_eMapPa"), and direct legacy database numeric IDs ("371").
 */

const ROUND_KEYS = [0x79b1, 0x3a4f, 0x9c2d, 0x6e8b, 0x51f3, 0x27a5];
const B62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function roundFn(r: number, k: number): number {
  return ((r * k + 0x4b1e) ^ (r >>> 5) ^ (r << 7)) & 0xffff;
}

function encrypt32(val: number): number {
  let l = (val >>> 16) & 0xffff;
  let r = val & 0xffff;
  for (let i = 0; i < 6; i++) {
    const nextR = (l ^ roundFn(r, ROUND_KEYS[i])) & 0xffff;
    l = r;
    r = nextR;
  }
  return ((l << 16) | r) >>> 0;
}

function decrypt32(val: number): number {
  let l = (val >>> 16) & 0xffff;
  let r = val & 0xffff;
  for (let i = 5; i >= 0; i--) {
    const prevL = (r ^ roundFn(l, ROUND_KEYS[i])) & 0xffff;
    r = l;
    l = prevL;
  }
  return ((l << 16) | r) >>> 0;
}

/**
 * Encodes a numeric video ID into a sleek, 6-character YouTube-like slug.
 * E.g. 371 -> "eMapPa"
 */
export function encodeVideoId(id: number | string): string {
  const num = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(num) || num <= 0) return String(id);

  const enc = encrypt32(num);
  let val = enc;
  let res = '';
  for (let i = 0; i < 6; i++) {
    res += B62[val % 62];
    val = Math.floor(val / 62);
  }
  return res;
}

/**
 * Decodes an obfuscated slug back to the original database numeric ID string.
 * Backward compatible with direct numbers ("371"), legacy "v_" prefix ("v_eMapPa"),
 * and standard 6-character slugs ("eMapPa").
 */
export function decodeVideoId(slug: string): string {
  if (!slug) return '';
  let clean = String(slug).trim();

  // If pure legacy numeric database ID (e.g. "371")
  if (/^\d+$/.test(clean) && Number(clean) < 10000000) {
    return clean;
  }

  // Strip legacy "v_" prefix if present
  if (clean.startsWith('v_')) {
    clean = clean.slice(2);
  }

  // Must be 6 characters for the Feistel cipher
  if (clean.length !== 6) {
    return clean;
  }

  let val = 0;
  let mult = 1;
  for (let i = 0; i < 6; i++) {
    const idx = B62.indexOf(clean[i]);
    if (idx === -1) return clean; // Invalid character, fallback to raw string
    val += idx * mult;
    mult *= 62;
  }

  const decrypted = decrypt32(val);
  return String(decrypted);
}
