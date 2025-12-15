import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Badge = ({ children, variant = 'primary', className }) => {
    const variants = {
        primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
        success: 'bg-green-500/20 text-green-300 border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        danger: 'bg-red-500/20 text-red-300 border-red-500/30',
        neutral: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        outline: 'border-white/20 text-slate-300',
    };

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                variants[variant],
                className
            )}
        >
            {children}
        </motion.span>
    );
};

export { Badge };
