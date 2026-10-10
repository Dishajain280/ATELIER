/**
 * ATELIER — Image Upload Protection & Client-Side Optimization
 * 
 * Prevents 413 Payload Too Large errors and browser memory exhaustion:
 * 1. Validates file size and MIME types before processing.
 * 2. Downscales oversized photographs using an in-memory Canvas to maximum practical dimensions.
 * 3. Compresses output JPEG/WebP to maintain crisp visual fidelity with lightweight payloads.
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxFileSizeBytes?: number; // Maximum initial file size (e.g. 15MB)
}

const DEFAULT_MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Megabytes
const DEFAULT_MAX_DIMENSION = 1600; // 1600px max width/height
const DEFAULT_QUALITY = 0.82; // Balanced curatorial clarity and small footprint

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/**
 * Validates file size and image type before upload/encoding.
 */
export function validateImageFile(
  file: File | null | undefined,
  maxSizeBytes: number = DEFAULT_MAX_FILE_SIZE
): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No image file was selected.' };
  }

  // Check MIME type
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type || 'unknown'}). Please select a JPG, PNG, WEBP, or GIF image.`,
    };
  }

  // Check file size threshold
  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxInMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Image file is too large (${sizeInMB}MB). Maximum allowed upload size is ${maxInMB}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Resizes large images to maximum practical dimensions and compresses to optimized Base64 data URL.
 * Automatically handles orientation and downscaling.
 */
export async function processAndOptimizeImage(
  file: File,
  options?: ImageProcessingOptions
): Promise<string> {
  const maxDim = options?.maxWidth || DEFAULT_MAX_DIMENSION;
  const quality = options?.quality ?? DEFAULT_QUALITY;
  const maxBytes = options?.maxFileSizeBytes || DEFAULT_MAX_FILE_SIZE;

  // Step 1: Pre-validation
  const validation = validateImageFile(file, maxBytes);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Step 2: In-browser canvas downscaling
  return new Promise((resolve, reject) => {
    // If not in a browser environment or canvas unavailable, fallback
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale if dimensions exceed threshold
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to FileReader if 2D context fails
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image data'));
          reader.readAsDataURL(file);
          return;
        }

        // High quality bicubic image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with controlled quality, except for PNG with transparency
        const isPng = file.type === 'image/png';
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        resolve(dataUrl);
      } catch (err: any) {
        // Fallback to direct FileReader on any canvas drawing error
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Image processing failed: ' + err.message));
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image. The file may be corrupted or unreadable.'));
    };

    img.src = objectUrl;
  });
}
