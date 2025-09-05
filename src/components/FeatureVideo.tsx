import React, { useEffect, useRef, useState } from 'react';
import OptimizedImage from './OptimizedImage';

interface FeatureVideoProps {
  src: string;
  poster?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
}

const FeatureVideo: React.FC<FeatureVideoProps> = ({
  src,
  poster,
  alt,
  className = '',
  priority = false,
  fetchPriority = 'auto',
  onLoad
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure autoplay-compatible settings
    video.muted = true; // important for autoplay on most browsers
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;
    video.preload = 'auto';

    const markLoaded = () => {
      if (!isLoaded) {
        setIsLoaded(true);
        onLoad?.();
      }
    };

    const attemptPlay = () => {
      video.play().then(markLoaded).catch(() => {});
    };

    video.addEventListener('loadedmetadata', attemptPlay);
    video.addEventListener('loadeddata', attemptPlay);
    video.addEventListener('canplay', attemptPlay);
    video.addEventListener('playing', markLoaded);
    video.addEventListener('error', () => {
      setIsLoaded(false);
      setHasError(true);
    });

    // Kick it off immediately
    attemptPlay();

    return () => {
      video.removeEventListener('loadedmetadata', attemptPlay);
      video.removeEventListener('loadeddata', attemptPlay);
      video.removeEventListener('canplay', attemptPlay);
      video.removeEventListener('playing', markLoaded);
    };
  }, [onLoad, isLoaded]);

  // Resume play when tab becomes visible again
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        const video = videoRef.current;
        if (video) {
          video.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {poster && (!isLoaded || hasError) && (
        <OptimizedImage
          src={poster}
          alt={alt}
          className="w-full h-full object-cover"
          priority={priority}
          fetchPriority={fetchPriority}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {!isLoaded && !poster && !hasError && (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        </div>
      )}

      {src && !hasError && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          playsInline
          muted
          loop
          autoPlay
          preload={priority ? 'auto' : 'metadata'}
          aria-label={alt}
          {...(fetchPriority && { fetchpriority: fetchPriority })}
        />
      )}

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-16 h-16 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureVideo;


