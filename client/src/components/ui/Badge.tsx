import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'emergency';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  pulse = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border select-none';

  const variants = {
    primary: 'bg-[#E1F2F1] text-[#007F86] border-[#007F86]/30',
    success: 'bg-[#E8F5ED] text-[#24735B] border-[#24735B]/30',
    warning: 'bg-[#FFF2D7] text-[#97610A] border-[#97610A]/30',
    danger: 'bg-[#FCECEE] text-[#C73540] border-[#C73540]/30',
    info: 'bg-[#E1F2F1] text-[#007F86] border-[#007F86]/20',
    neutral: 'bg-[#F2F5F6] text-[#617580] border-[#DCE5E9]',
    emergency: 'bg-[#FCECEE] text-[#C73540] border-[#C73540]/40 font-semibold',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};
