import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes,
  priority = false,
  loading = 'lazy',
  fetchPriority,
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized source URLs
  const getOptimizedSources = (originalSrc: string) => {
    const pathParts = originalSrc.split('/');
    const filename = pathParts[pathParts.length - 1];
    const basePath = pathParts.slice(0, -1).join('/');
    const [name, extension] = filename.split('.');
    
    return {
      avif: `${basePath}/${name}.avif`,
      webp: `${basePath}/${name}.webp`,
      original: originalSrc
    };
  };

  const sources = getOptimizedSources(src);

  useEffect(() => {
    if (priority && imgRef.current) {
      // Preload critical images
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = sources.avif;
      link.type = 'image/avif';
      if (fetchPriority) {
        link.setAttribute('fetchpriority', fetchPriority);
      }
      document.head.appendChild(link);
    }
  }, [priority, sources.avif, fetchPriority]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // Use intersection observer for lazy loading
  useEffect(() => {
    if (!priority && loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      );

      observer.observe(imgRef.current);

      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    } else {
      setCurrentSrc(src);
    }
  }, [src, priority, loading]);

  return (
    <picture className={`block ${className}`}>
      {/* AVIF source for maximum compression */}
      <source 
        srcSet={currentSrc ? sources.avif : undefined}
        type="image/avif"
        sizes={sizes}
      />
      
      {/* WebP source for better compatibility */}
      <source 
        srcSet={currentSrc ? sources.webp : undefined}
        type="image/webp"
        sizes={sizes}
      />
      
      {/* Fallback image */}
      <img
        ref={imgRef}
        src={currentSrc || placeholder}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        {...(fetchPriority && { fetchpriority: fetchPriority })}
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${hasError ? 'opacity-50' : ''}
          ${className}
        `}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        sizes={sizes}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined,
          objectFit: 'cover'
        }}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className={`
            absolute inset-0 bg-gray-200 dark:bg-gray-700 
            animate-pulse rounded-lg
            flex items-center justify-center
          `}
          style={{
            aspectRatio: width && height ? `${width}/${height}` : undefined
          }}
        >
          <div className="w-8 h-8 text-gray-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        </div>
      )}
    </picture>
  );
};

export default OptimizedImage;