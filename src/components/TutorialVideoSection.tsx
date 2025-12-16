import React from 'react';

interface TutorialVideoSectionProps {
  title: string;
  description: string;
  videoId: string;
  features: {
    title: string;
    description: string;
  }[];
}

const TutorialVideoSection: React.FC<TutorialVideoSectionProps> = ({
  title,
  description,
  videoId,
  features
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-dark-500 dark:to-dark-600 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8">
        {/* Left Side - Details */}
        <div className="flex flex-col justify-center space-y-4">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-2">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Video Tutorial</p>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            {description}
          </p>

          {/* Features List */}
          <div className="space-y-3 mt-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-1 mt-0.5">
                  <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{feature.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Badge */}
          <div className="flex items-center space-x-2 pt-4">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center space-x-1">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              <span>Watch & Learn</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">~ 3 min tutorial</span>
          </div>
        </div>

        {/* Right Side - Video */}
        <div className="flex items-center justify-center">
          <div className="w-full bg-black rounded-lg overflow-hidden shadow-2xl">
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialVideoSection;
