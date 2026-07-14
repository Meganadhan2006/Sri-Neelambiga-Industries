/**
 * Transforms a Cloudinary secure URL on the fly to get optimized, responsive formats and sizes.
 * 
 * @param {string} url - Original Cloudinary image URL
 * @param {number} width - Target width (default: 800)
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, width = 800) => {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;
  
  // Replace '/upload/' with '/upload/f_auto,q_auto,w_X,c_limit/'
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
};
