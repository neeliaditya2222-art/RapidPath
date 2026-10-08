import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string; disabled?: boolean }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-white border text-[#112B37] rounded-lg text-sm px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 appearance-none cursor-pointer',
                error
                  ? 'border-[#C73540] focus:ring-[#C73540]/30 bg-[#FCECEE]/30'
                  : 'border-[#DCE5E9] hover:border-[#617580] focus:border-[#007F86] focus:ring-[#007F86]/20',
                className
              )
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-white text-[#112B37]">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#617580]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-[#C73540] font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#617580] mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={twMerge(
            clsx(
              'w-full bg-white border text-[#112B37] rounded-lg text-sm px-3.5 py-2.5 transition-all duration-150 placeholder:text-[#617580]/70 focus:outline-none focus:ring-2 resize-none',
              error
                ? 'border-[#C73540] focus:ring-[#C73540]/30 bg-[#FCECEE]/30'
                : 'border-[#DCE5E9] hover:border-[#617580] focus:border-[#007F86] focus:ring-[#007F86]/20',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-[#C73540] font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#617580]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
