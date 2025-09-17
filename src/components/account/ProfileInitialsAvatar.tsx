import React, { useMemo } from 'react';

interface ProfileInitialsAvatarProps {
  firstName: string;
  lastName: string;
  className?: string;
  noHover?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'hero';
}

const BACKGROUND_COLORS = [
  'bg-gray-100',
  'bg-slate-100',
  'bg-zinc-100', 
  'bg-neutral-100',
  'bg-stone-100',
  'bg-red-50',
  'bg-orange-50',
  'bg-amber-50',
  'bg-yellow-50',
  'bg-lime-50',
  'bg-green-50',
  'bg-emerald-50',
  'bg-teal-50',
  'bg-cyan-50',
  'bg-sky-50',
  'bg-blue-50',
  'bg-indigo-50',
  'bg-violet-50',
  'bg-purple-50',
  'bg-fuchsia-50',
  'bg-pink-50',
  'bg-rose-50',
];

const ProfileInitialsAvatar: React.FC<ProfileInitialsAvatarProps> = ({
  firstName,
  lastName,
  className = '',
  noHover = false,
  size = 'medium',
}) => {
  const initials = useMemo(() => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`.trim();
  }, [firstName, lastName]);

  const backgroundColorClass = useMemo(() => {
    // Use a deterministic color based on the initials to keep it consistent
    const index = initials
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return BACKGROUND_COLORS[index % BACKGROUND_COLORS.length];
  }, [initials]);

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'small':
        return { container: 'w-12 h-12', text: 'text-lg' };
      case 'medium':
        return { container: 'w-16 h-16', text: 'text-xl' };
      case 'large':
        return { container: 'w-24 h-24', text: 'text-2xl' };
      case 'xlarge':
        return { container: 'w-32 h-32', text: 'text-3xl' };
      case 'hero':
        return { container: 'w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32', text: 'text-2xl md:text-3xl lg:text-4xl' };
      default:
        return { container: 'w-16 h-16', text: 'text-xl' };
    }
  }, [size]);

  if (!initials) {
    return null;
  }

  return (
    <div
      className={`
        ${backgroundColorClass}
        ${sizeClasses.container}
        rounded-full flex items-center justify-center
        shadow-lg text-gray-700 dark:text-gray-600 font-bold ${sizeClasses.text}
        border-2 border-white/20
        ${!noHover ? 'transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105' : ''}
        ${className}
      `}
      aria-label={`Profile initials: ${initials}`}
    >
      {initials}
    </div>
  );
};

export default ProfileInitialsAvatar;
