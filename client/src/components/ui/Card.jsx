import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => {
    return (
        <motion.div
            ref={ref}
            initial={hoverEffect ? { y: 0 } : undefined}
            whileHover={hoverEffect ? { y: -5, boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.2)' } : undefined}
            transition={{ type: 'spring', stiffness: 300 }}
            className={cn(
                'rounded-xl border border-white/5 bg-surface/50 backdrop-blur-md p-6 shadow-xl',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
});

Card.displayName = "Card";

export { Card };
