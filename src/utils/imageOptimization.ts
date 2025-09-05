/**
 * Image optimization utilities for modern format support and performance
 */

// Image format support detection
export const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const supportsAVIF = () => {
  const avif = new Image();
  return new Promise((resolve) => {
    avif.onload = () => resolve(true);
    avif.onerror = () => resolve(false);
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

// Get optimized image URL with format fallbacks
export const getOptimizedImageUrl = (basePath: string, filename: string, fallbackFormat: string = 'jpg') => {
  const baseUrl = `${basePath}/${filename}`;
  const name = filename.split('.')[0];
  
  // Return sources in order of preference: AVIF > WebP > Original
  return {
    avif: `${basePath}/${name}.avif`,
    webp: `${basePath}/${name}.webp`, 
    fallback: baseUrl
  };
};

// Create picture element with modern format support
export const createOptimizedPicture = (
  basePath: string,
  filename: string,
  alt: string,
  className?: string,
  sizes?: string,
  loading?: 'lazy' | 'eager',
  fetchPriority?: 'high' | 'low' | 'auto'
) => {
  const urls = getOptimizedImageUrl(basePath, filename);
  
  return `
    <picture>
      <source srcset="${urls.avif}" type="image/avif" />
      <source srcset="${urls.webp}" type="image/webp" />
      <img 
        src="${urls.fallback}" 
        alt="${alt}"
        ${className ? `class="${className}"` : ''}
        ${sizes ? `sizes="${sizes}"` : ''}
        ${loading ? `loading="${loading}"` : ''}
        ${fetchPriority ? `fetchpriority="${fetchPriority}"` : ''}
        decoding="async"
      />
    </picture>
  `;
};

// Preload critical images
export const preloadCriticalImages = (images: Array<{
  path: string;
  filename: string;
  fetchPriority?: 'high' | 'low' | 'auto';
}>) => {
  images.forEach(({ path, filename, fetchPriority = 'high' }) => {
    const urls = getOptimizedImageUrl(path, filename);
    
    // Preload AVIF if supported
    const avifLink = document.createElement('link');
    avifLink.rel = 'preload';
    avifLink.as = 'image';
    avifLink.href = urls.avif;
    avifLink.type = 'image/avif';
    if (fetchPriority) {
      avifLink.setAttribute('fetchpriority', fetchPriority);
    }
    
    // Preload WebP as fallback
    const webpLink = document.createElement('link');
    webpLink.rel = 'preload';
    webpLink.as = 'image';
    webpLink.href = urls.webp;
    webpLink.type = 'image/webp';
    if (fetchPriority) {
      webpLink.setAttribute('fetchpriority', fetchPriority);
    }
    
    document.head.appendChild(avifLink);
    document.head.appendChild(webpLink);
  });
};

// Lazy load images with intersection observer
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};

// Image compression and resize utilities
export const compressImage = (file: File, quality: number = 0.8, maxWidth: number = 1920): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const { width, height } = img;
      const aspectRatio = height / width;
      
      canvas.width = Math.min(width, maxWidth);
      canvas.height = canvas.width * aspectRatio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/webp',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Responsive image sizes helper
export const getResponsiveSizes = (breakpoints: Record<string, string>) => {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}`)
    .join(', ');
};

// Common responsive image sizes
export const RESPONSIVE_SIZES = {
  hero: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  thumbnail: '(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw',
  full: '100vw'
};