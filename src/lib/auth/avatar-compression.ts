/**
 * Client-side avatar optimization utility.
 * Center-crops, downscales and converts user-selected photos to a lightweight
 * square image before uploading to Supabase Storage, preventing mobile upload failures
 * on high-resolution camera captures (3–10 MB).
 */

const MAX_AVATAR_DIMENSION = 512;
const AVATAR_WEBP_QUALITY = 0.85;

export async function compressAvatarImage(
  file: File,
  maxDimension: number = MAX_AVATAR_DIMENSION,
  quality: number = AVATAR_WEBP_QUALITY
): Promise<File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }

  // Already tiny images don't need recompression
  if (file.size < 200 * 1024 && file.type === "image/webp") {
    return file;
  }

  return new Promise<File>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { naturalWidth: width, naturalHeight: height } = img;
      if (!width || !height) {
        resolve(file);
        return;
      }

      // Compute square crop bounding box (center crop)
      const minSide = Math.min(width, height);
      const sx = (width - minSide) / 2;
      const sy = (height - minSide) / 2;
      const targetSize = Math.min(minSide, maxDimension);

      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const optimizedFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
