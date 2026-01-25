import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({
    label,
    error,
    className,
    type = "text",
    id,
    ...props
}, ref) => {
    const inputId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                type={type}
                className={twMerge(
                    "w-full px-3 py-2 border border-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors",
                    error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
