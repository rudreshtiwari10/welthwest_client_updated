import React, { useMemo } from 'react';

interface ProfileInitialsAvatarProps {
  firstName: string;
  lastName: string;
  className?: string;
  noHover?: boolean;
}

const BACKGROUND_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500',
];

const ProfileInitialsAvatar: React.FC<ProfileInitialsAvatarProps> = ({
  firstName,
  lastName,
  className = '',
  noHover = false,
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

  if (!initials) {
    return null;
  }

  return (
    <div
      className={`
        ${backgroundColorClass}
        w-24 h-24 rounded-full flex items-center justify-center
        shadow-lg text-white font-bold text-2xl
        ${!noHover ? 'transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-110' : ''}
        ${className}
      `}
      aria-label={`Profile initials: ${initials}`}
    >
      {initials}
    </div>
  );
};

export default ProfileInitialsAvatar;
