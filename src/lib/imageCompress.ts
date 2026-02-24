const MAX_DIMENSION = 1024;
const MAX_BYTES = 1 * 1024 * 1024; // 1MB
const JPEG_QUALITY = 0.7;

export interface CompressedImage {
  base64: string;
}

/**
 * Resize image so longest side is at most MAX_DIMENSION, convert to JPEG at given quality,
 * and ensure result is under MAX_BYTES. Reduces quality or size as needed.
 */
export function compressImageForApi(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.naturalWidth;
      let height = img.naturalHeight;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      let quality = JPEG_QUALITY;

      function tryEncode() {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to encode image'));
              return;
            }
            if (blob.size <= MAX_BYTES) {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.includes(',') ? result.split(',')[1] : result;
                resolve({ base64: base64 ?? '' });
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
              return;
            }
            if (quality > 0.2) {
              quality -= 0.1;
              tryEncode();
            } else {
              reject(new Error('Image could not be compressed under 1MB'));
            }
          },
          'image/jpeg',
          quality
        );
      }

      tryEncode();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
