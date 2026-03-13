"use client";

import * as React from "react";
import { cn } from "./lib/utils";

const TabsContext = React.createContext<{ activeTab: string; setActiveTab: (v: string) => void } | null>(null);

export function Tabs({ defaultValue, className, children }: { defaultValue: string, className?: string, children: React.ReactNode }) {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ className, children }: { className?: string, children: React.ReactNode }) {
    return <div className={cn("inline-flex w-auto bg-gray-200 h-auto p-1.5 rounded-xl mb-8 gap-2", className)}>{children}</div>;
}

export function TabsTrigger({ value, className, children }: { value: string, className?: string, children: React.ReactNode }) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.activeTab === value;
    return (
        <button
            onClick={() => context.setActiveTab(value)}
            className={cn(
                "h-11 px-6 text-gray-500 font-medium rounded-lg transition-all duration-300 ease-out",
                isActive
                    ? "bg-white text-[#1A2B3C] shadow-sm scale-[1.02]"
                    : "hover:text-gray-700 hover:bg-white/40 scale-100",
                className
            )}
            data-state={isActive ? 'active' : 'inactive'}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, className, children }: { value: string, className?: string, children: React.ReactNode }) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.activeTab !== value) return null;
    return (
        <div className={cn(
            "animate-in fade-in slide-in-from-bottom-4 duration-500",
            className
        )}>
            {children}
        </div>
    );
}
