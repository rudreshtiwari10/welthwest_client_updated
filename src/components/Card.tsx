import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: 'primary' | 'secondary' | 'accent' | 'none';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  gradient = 'none'
}) => {
  const gradientClasses = {
    primary: 'bg-gradient-to-br from-white to-blue-50 dark:from-dark-300 dark:to-blue-900/10',
    secondary: 'bg-gradient-to-br from-white to-purple-50 dark:from-dark-300 dark:to-purple-900/10',
    accent: 'bg-gradient-to-br from-white to-indigo-50 dark:from-dark-300 dark:to-indigo-900/10',
    none: 'bg-white dark:bg-dark-300',
  };

  const hoverClasses = hover
    ? 'hover:shadow-2xl hover:-translate-y-2 transform hover:scale-105'
    : '';

  return (
    <div
      className={`
        ${gradientClasses[gradient]}
        rounded-2xl
        p-6
        border border-gray-200 dark:border-gray-700
        shadow-lg
        ${hoverClasses}
        transition-all
        duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
