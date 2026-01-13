/**
 * Browser Fingerprint Generator
 * Creates a semi-unique identifier based on browser/device characteristics
 * Used for usage tracking without requiring user registration
 */

interface FingerprintComponents {
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number | undefined;
  touchSupport: boolean;
  webglVendor: string;
  webglRenderer: string;
  canvasFingerprint: string;
}

/**
 * Generate a hash from string using a simple but effective algorithm
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive hex string
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Get WebGL renderer info for fingerprinting
 */
function getWebGLInfo(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      return { vendor: 'unknown', renderer: 'unknown' };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {
      return { vendor: 'unknown', renderer: 'unknown' };
    }

    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown',
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown',
    };
  } catch {
    return { vendor: 'unknown', renderer: 'unknown' };
  }
}

/**
 * Generate canvas fingerprint
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;

    // Draw text with specific styling
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('WebP.Convert', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('fingerprint', 4, 17);

    // Get data URL and hash it
    const dataUrl = canvas.toDataURL();
    return hashString(dataUrl);
  } catch {
    return 'canvas-error';
  }
}

/**
 * Collect all fingerprint components
 */
function collectComponents(): FingerprintComponents {
  const webglInfo = getWebGLInfo();

  return {
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    webglVendor: webglInfo.vendor,
    webglRenderer: webglInfo.renderer,
    canvasFingerprint: getCanvasFingerprint(),
  };
}

/**
 * Generate a unique-ish browser fingerprint
 * Returns a hex string that should be consistent for the same browser/device
 */
export function generateFingerprint(): string {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const components = collectComponents();

  // Combine all components into a single string
  const fingerprintString = [
    components.screenResolution,
    components.colorDepth,
    components.timezone,
    components.language,
    components.platform,
    components.hardwareConcurrency,
    components.deviceMemory || 0,
    components.touchSupport,
    components.webglVendor,
    components.webglRenderer,
    components.canvasFingerprint,
  ].join('|');

  // Generate final fingerprint hash
  const hash1 = hashString(fingerprintString);
  const hash2 = hashString(fingerprintString.split('').reverse().join(''));

  return `${hash1}-${hash2}`;
}

/**
 * Get or create a persistent device ID
 * Combines fingerprint with a random component stored in localStorage
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const STORAGE_KEY = 'webp_device_id';
  const fingerprint = generateFingerprint();

  // Check if we already have a device ID
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      const data = JSON.parse(stored);
      // If fingerprint matches, return stored ID
      if (data.fingerprint === fingerprint) {
        return data.deviceId;
      }
      // Fingerprint changed but we have a stored random component
      // Create new ID with old random + new fingerprint
      const newId = `${fingerprint}-${data.random}`;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fingerprint,
        random: data.random,
        deviceId: newId,
      }));
      return newId;
    } catch {
      // Invalid stored data, create new
    }
  }

  // Create new device ID with random component
  const random = Math.random().toString(36).substring(2, 10);
  const deviceId = `${fingerprint}-${random}`;

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    fingerprint,
    random,
    deviceId,
  }));

  return deviceId;
}
