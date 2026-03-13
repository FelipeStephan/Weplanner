"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Switch({
    checked,
    onCheckedChange,
    className,
    leftIcon,
    rightIcon
}: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-amber-500" : "bg-slate-700",
                className
            )}
        >
            <span className="sr-only">Toggle theme</span>

            {/* Icons background */}
            <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
                <div className={cn("text-[10px] transition-opacity duration-200", checked ? "opacity-100" : "opacity-0")}>
                    {rightIcon}
                </div>
                <div className={cn("text-[10px] transition-opacity duration-200", !checked ? "opacity-100" : "opacity-0")}>
                    {leftIcon}
                </div>
            </div>

            <motion.span
                layout
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
                className={cn(
                    "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-lg ring-0",
                    checked ? "ml-auto" : "mr-auto"
                )}
            />
        </button>
    );
}
