import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...props
}, ref) => {
    const variants = {
        primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-neon border border-primary-500/50',
        secondary: 'bg-surfaceHighlight hover:bg-surface border border-white/10 text-white hover:border-primary-500/30',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20',
        ghost: 'hover:bg-white/5 text-slate-300 hover:text-white',
        outline: 'border border-primary-500/50 text-primary-400 hover:bg-primary-500/10',
        glass: 'glass-panel hover:bg-white/10 text-white',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
    };

    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'relative inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
            {/* Subtle shine effect on hover could go here, but keeping it simple for now */}
        </motion.button>
    );
});

Button.displayName = "Button";

export { Button };
