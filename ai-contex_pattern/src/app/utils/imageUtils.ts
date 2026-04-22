/**
 * Compresses and resizes an image file using a canvas.
 * Returns a JPEG data URL with reduced size — safe to store in React state.
 *
 * @param file     - The File object from an <input type="file">
 * @param maxWidth  - Maximum output width in pixels (default 1600)
 * @param maxHeight - Maximum output height in pixels (default 600)
 * @param quality   - JPEG quality 0–1 (default 0.82)
 */
export function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 600,
  quality = 0.82,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl !== 'string') {
        reject(new Error('Resultado inválido do FileReader.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao carregar a imagem.'));
      img.onload = () => {
        let { width, height } = img;

        // Scale down proportionally if larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
