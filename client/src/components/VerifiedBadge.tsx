import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';

interface VerifiedBadgeProps {
  collegeName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ collegeName, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full font-bold border border-blue-200 ${sizeClasses[size]}`}
      title={collegeName ? `Verified student from ${collegeName}` : 'Verified college student'}
    >
      <FiCheckCircle className="text-blue-600" />
      <span>Verified Student</span>
    </div>
  );
};