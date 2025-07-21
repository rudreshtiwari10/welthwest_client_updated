import React, { useState, useEffect } from 'react';

interface TypewriterInputProps {
  placeholders: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const TypewriterInput: React.FC<TypewriterInputProps> = ({
  placeholders,
  value,
  onChange,
  className = '',
  onKeyDown,
  onFocus
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const targetPlaceholder = placeholders[placeholderIndex];

    if (isTyping) {
      if (currentPlaceholder.length < targetPlaceholder.length) {
        // Typing effect
        timeout = setTimeout(() => {
          setCurrentPlaceholder(targetPlaceholder.slice(0, currentPlaceholder.length + 1));
        }, 100);
      } else {
        // Wait before starting to erase
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (currentPlaceholder.length > 0) {
        // Erasing effect
        timeout = setTimeout(() => {
          setCurrentPlaceholder(currentPlaceholder.slice(0, -1));
        }, 50);
      } else {
        // Move to next placeholder
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentPlaceholder, isTyping, placeholderIndex, placeholders]);

  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      className={className}
      placeholder={currentPlaceholder}
    />
  );
};

export default TypewriterInput; 