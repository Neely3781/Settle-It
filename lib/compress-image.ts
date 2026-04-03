export async function compressImage(
  dataUrl: string,
  maxWidth: number = 1200,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Scale down if wider than maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export async function compressImages(
  images: string[],
  maxWidth: number = 1200,
  quality: number = 0.7
): Promise<string[]> {
  const compressed: string[] = [];
  for (const img of images) {
    // Skip if already small (under 100KB base64 ~ 75KB binary)
    if (img.length < 135000) {
      compressed.push(img);
      continue;
    }
    const small = await compressImage(img, maxWidth, quality);
    compressed.push(small);
  }
  return compressed;
}
