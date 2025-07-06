import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'pending' | 'warning' | 'error';
  text: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'md',
  showIcon = true
}) => {
  const statusConfig = {
    success: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-700',
      icon: CheckCircle
    },
    pending: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-200 dark:border-yellow-700',
      icon: Clock
    },
    warning: {
      bg: 'bg-orange-100 dark:bg-orange-900/20',
      text: 'text-orange-800 dark:text-orange-200',
      border: 'border-orange-200 dark:border-orange-700',
      icon: AlertTriangle
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-700',
      icon: XCircle
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center space-x-1 rounded-full border font-medium
      ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}
    `}>
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{text}</span>
    </span>
  );
};