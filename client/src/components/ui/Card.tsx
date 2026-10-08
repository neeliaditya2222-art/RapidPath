import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'navy' | 'emergency';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-150';

  const variants = {
    default: 'bg-white border border-[#DCE5E9] text-[#112B37] shadow-sm',
    elevated: 'bg-white border border-[#DCE5E9] text-[#112B37] shadow-md',
    bordered: 'bg-white border-2 border-[#DCE5E9] text-[#112B37]',
    navy: 'bg-[#102E3C] border border-[#1A4254] text-white shadow-md',
    emergency: 'bg-[#FCECEE] border border-[#C73540]/30 text-[#112B37]',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </div>
  );
};
