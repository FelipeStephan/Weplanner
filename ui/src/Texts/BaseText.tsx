import React from 'react';
import { cn } from '../lib/utils';

type sizes = "small" | "medium" | "large" | "xl" | "extra-small" | "tiny" | "nano";

const sizeClasses: Record<sizes, string> = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xl: "text-xl",
    "extra-small": "text-xs",
    tiny: "text-[11px]",
    nano: "text-[9px]",
};

const colorClasses: Record<BaseTextProps['color'], string> = {
    black: "text-black",
    white: "text-white",
    gray: "text-gray-400 dark:text-gray-500",
    gold: "text-[#f2b90d]",
    slate: "text-slate-400 dark:text-slate-500",
    red: "text-red-500",
};

interface BaseTextProps {
    text: string | null;
    size?: sizes;
    color: "black" | "white" | "gray" | "gold" | "slate" | "red"; // TODO Add theme colors here!
    className?: string;
    bold?: boolean;
}

export const BaseText: React.FC<BaseTextProps> = ({ text, size = "medium", color, className, bold }) => {
    return (
        <div
            className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out w-full text-left",
                text ? "max-h-[100px] opacity-100" : "max-h-0 opacity-0",
            )}
        >
            <p className={cn(
                "p-0 m-0",
                sizeClasses[size],
                colorClasses[color],
                bold ? "font-bold" : "font-normal",
                className
            )}>
                {text || ""}
            </p>
        </div>
    );
};
