import React, { useMemo } from 'react';

interface ProfileInitialsAvatarProps {
  firstName: string;
  lastName: string;
  className?: string;
  noHover?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'hero';
}

const BACKGROUND_COLORS = [
  'bg-gradient-to-br from-slate-600 to-slate-700',
  'bg-gradient-to-br from-gray-600 to-gray-700',
  'bg-gradient-to-br from-zinc-600 to-zinc-700',
  'bg-gradient-to-br from-neutral-600 to-neutral-700',
  'bg-gradient-to-br from-stone-600 to-stone-700',
  'bg-gradient-to-br from-red-500 to-red-600',
  'bg-gradient-to-br from-orange-500 to-orange-600',
  'bg-gradient-to-br from-amber-500 to-amber-600',
  'bg-gradient-to-br from-yellow-500 to-yellow-600',
  'bg-gradient-to-br from-lime-500 to-lime-600',
  'bg-gradient-to-br from-green-500 to-green-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-600',
  'bg-gradient-to-br from-teal-500 to-teal-600',
  'bg-gradient-to-br from-cyan-500 to-cyan-600',
  'bg-gradient-to-br from-sky-500 to-sky-600',
  'bg-gradient-to-br from-blue-600 to-blue-700',
  'bg-gradient-to-br from-indigo-600 to-indigo-700',
  'bg-gradient-to-br from-violet-600 to-violet-700',
  'bg-gradient-to-br from-purple-600 to-purple-700',
  'bg-gradient-to-br from-fuchsia-600 to-fuchsia-700',
  'bg-gradient-to-br from-pink-500 to-pink-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
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
        shadow-lg text-white font-bold ${sizeClasses.text}
        border-2 border-white/30 dark:border-white/20
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
