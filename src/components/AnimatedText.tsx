import React, { useState, useEffect } from 'react';

interface AnimatedTextProps {
  words: string[];
  baseText: string;
  interval?: number;
  direction?: 'up' | 'down';
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  words, 
  baseText, 
  interval = 3000,
  direction = 'up'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsAnimating(true);
      
      // After animation starts, schedule the word change
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        
        // After changing the word, end the animation
        setTimeout(() => {
          setIsAnimating(false);
        }, 500);
      }, 500);
    }, interval);

    return () => clearInterval(intervalId);
  }, [words, interval]);

  return (
    <span className="relative inline-block">
      {baseText}{' '}
      <span className="relative inline-block overflow-hidden" style={{ minWidth: '80px' }}>
        {words.map((word, index) => (
          <span
            key={index}
            className={`absolute left-0 transition-transform duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            } ${
              isAnimating && index === currentIndex
                ? direction === 'up'
                  ? '-translate-y-full'
                  : 'translate-y-full'
                : 'translate-y-0'
            } ${
              isAnimating && index === ((currentIndex - 1 + words.length) % words.length)
                ? direction === 'up'
                  ? 'translate-y-full'
                  : '-translate-y-full'
                : 'translate-y-0'
            }`}
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
};

export default AnimatedText; 