/**
 * Compresses an image file client-side using canvas resizing and quality reduction.
 * 
 * @param {File} file - The original image file
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Max width of compressed image (default: 1920)
 * @param {number} options.maxHeight - Max height of compressed image (default: 1080)
 * @param {number} options.quality - Quality rating between 0 and 1 (default: 0.8)
 * @returns {Promise<File>} Compressed File or original File if error occurs
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Apply aspect-ratio conserving resize
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas back to file blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // fallback to original file
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type || 'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};
