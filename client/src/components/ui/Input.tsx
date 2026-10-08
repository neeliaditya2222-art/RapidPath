import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#617580]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-white border text-[#112B37] rounded-lg text-sm px-3.5 py-2.5 transition-all duration-150 placeholder:text-[#617580]/70 focus:outline-none focus:ring-2',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error
                  ? 'border-[#C73540] focus:ring-[#C73540]/30 bg-[#FCECEE]/30'
                  : 'border-[#DCE5E9] hover:border-[#617580] focus:border-[#007F86] focus:ring-[#007F86]/20',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-[#617580]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-[#C73540] font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#617580]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
