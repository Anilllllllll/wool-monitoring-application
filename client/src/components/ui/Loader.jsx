import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Loader = ({ className, size = 'md' }) => {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    return (
        <div className="flex justify-center items-center">
            <Loader2 className={cn("animate-spin text-primary-500", sizes[size], className)} />
        </div>
    );
};

export { Loader };
