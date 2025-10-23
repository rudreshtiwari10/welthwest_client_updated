import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, title, className = '' }) => {
  // Validate video ID (YouTube IDs are typically 11 characters)
  if (!videoId || videoId.includes('YOUR_')) {
    return (
      <div className={`relative w-full aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm px-4 text-center">
          Video ID not configured. Please add your YouTube video ID.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-video ${className}`}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
};

export default YouTubeEmbed;
