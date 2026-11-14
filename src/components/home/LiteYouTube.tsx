import React, { useState } from 'react';

interface LiteYouTubeProps {
  videoId: string;
  title: string;
  className?: string;
}

/** Click-to-load YouTube embed: shows a thumbnail, loads the iframe only on click. */
const LiteYouTube: React.FC<LiteYouTubeProps> = ({ videoId, title, className = '' }) => {
  const [active, setActive] = useState(false);

  return (
    <div className={`relative w-full aspect-video overflow-hidden rounded-xl bg-black ${className}`}>
      {active ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 w-full h-full"
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="h-7 w-7 translate-x-0.5 fill-white" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
};

export default LiteYouTube;
