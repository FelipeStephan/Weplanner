"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, PanInfo, AnimatePresence, useMotionValue, useSpring, useDragControls } from "framer-motion";
import { cn } from "./lib/utils";
import { Menu } from "lucide-react";

export interface FloatingButtonItem {
  id: string;
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
}

export interface FloatingButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDragEnd" | "onDragStart" | "onDrag" | "onAnimationStart"> {
  initialX?: number;
  initialY?: number;
  onDragEndPosition?: (x: number, y: number) => void;
  items?: FloatingButtonItem[];
  children?: React.ReactNode;
  addonContent?: React.ReactNode | ((props: { isOpen: boolean, menuPosition: 'top' | 'bottom' }) => React.ReactNode);
  notificationBadge?: number;
}

export const FloatingButton = React.forwardRef<HTMLDivElement, FloatingButtonProps>(
  ({ className, initialX = 0, initialY = 0, onDragEndPosition, items = [], children, addonContent, notificationBadge, ...props }, ref) => {
    const [isMounted, setIsMounted] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('top');
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // dragControls: drag is ONLY initiated via the main button's onPointerDown.
    // addonContent (avatar, chat window) will never trigger a drag.
    const dragControls = useDragControls();

    // Motion values for smooth dragging
    const dragX = useMotionValue(initialX);
    const dragY = useMotionValue(initialY);

    useEffect(() => {
      dragX.set(initialX);
      dragY.set(initialY);
    }, [initialX, initialY, dragX, dragY]);

    // Spring smoothing
    const springX = useSpring(dragX, { stiffness: 150, damping: 20 });
    const springY = useSpring(dragY, { stiffness: 150, damping: 20 });

    const respect_scroll_size = 18;
    const BUTTON_SIZE = 56 + respect_scroll_size;

    useEffect(() => {
      setIsMounted(true);
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

      const handleResize = () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        setWindowSize({ width: newWidth, height: newHeight });

        if (containerRef.current) {
          const style = window.getComputedStyle(containerRef.current);
          const matrix = new DOMMatrixReadOnly(style.transform);
          const currentX = matrix.m41;
          const currentY = matrix.m42;

          const maxX = Math.max(0, newWidth - BUTTON_SIZE);
          const maxY = Math.max(0, newHeight - BUTTON_SIZE - respect_scroll_size);

          if (currentX > maxX || currentY > maxY) {
            const boundedX = Math.min(Math.max(0, currentX), maxX);
            const boundedY = Math.min(Math.max(0, currentY), maxY);
            dragX.set(boundedX);
            dragY.set(boundedY);
            onDragEndPosition?.(boundedX, boundedY);
          }
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [onDragEndPosition, dragX, dragY]);

    const updateMenuPosition = (currentY: number) => {
      setMenuPosition(currentY > windowSize.height / 2 ? 'top' : 'bottom');
    };

    const maxX = Math.max(0, windowSize.width - BUTTON_SIZE);
    const maxY = Math.max(0, windowSize.height - BUTTON_SIZE + respect_scroll_size);

    const handleDragStart = () => {
      setIsDragging(true);
      setIsOpen(false);
    };

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
      setTimeout(() => setIsDragging(false), 100);
      const finalX = dragX.get();
      const finalY = dragY.get();
      onDragEndPosition?.(finalX, finalY);
      updateMenuPosition(finalY);
    };

    const handleMainButtonPointerDown = (e: React.PointerEvent) => {
      // Start drag ONLY from the main button circle.
      // addonContent is outside this handler, so it never triggers drag.
      dragControls.start(e);
    };

    const handleMainButtonClick = () => {
      if (!isDragging && items.length > 0) {
        if (containerRef.current) {
          updateMenuPosition(containerRef.current.getBoundingClientRect().top);
        }
        setIsOpen(prev => !prev);
      }
    };

    if (!isMounted) return null;

    return (
      <motion.div
        ref={(node) => {
          (containerRef as any).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
        }}
        drag
        dragControls={dragControls}
        dragListener={false}  // ← drag only starts from dragControls.start(), not from any click
        dragConstraints={{ left: 0, top: 0, right: maxX, bottom: maxY }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn("fixed z-[9999] flex flex-col items-center", className)}
        style={{
          touchAction: "none",
          left: 0,
          top: 0,
          position: "fixed",
          x: springX,
          y: springY,
        }}
        {...(props as any)}
      >
        {/* Menu items */}
        <AnimatePresence>
          {isOpen && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: menuPosition === 'top' ? 20 : -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: menuPosition === 'top' ? 20 : -20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute flex flex-col gap-3",
                menuPosition === 'top' ? "bottom-full mb-4" : "top-full mt-4"
              )}
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.5, y: menuPosition === 'top' ? 10 : -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: menuPosition === 'top' ? 10 : -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className="w-12 h-12 bg-gray-100/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-200/90 transition-all border border-white/30 active:scale-95"
                    title={item.label}
                  >
                    {item.icon}
                  </button>
                  <span className={cn(
                    "absolute top-1/2 -translate-y-1/2 px-2 py-1 bg-black/70 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap",
                    "right-full mr-3"
                  )}>
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* addonContent: rendered OUTSIDE the drag-initiating button div.
            Pointer events here are completely isolated and will NEVER start a drag. */}
        {typeof addonContent === 'function'
          ? addonContent({ isOpen, menuPosition })
          : addonContent}

        {/* Main button circle: the ONLY element that can initiate drag */}
        <div
          onPointerDown={handleMainButtonPointerDown}
          onClick={handleMainButtonClick}
          className={cn(
            "w-14 h-14 bg-gray-100/80 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-gray-700 hover:bg-gray-200/90 transition-all border border-white/30",
            isDragging ? "cursor-grabbing scale-95" : "cursor-grab hover:scale-105",
            isOpen && "bg-gray-200 shadow-inner",
            "relative"
          )}
        >
          {children || <Menu className="w-6 h-6" />}

          {/* Notification Badge */}
          {typeof notificationBadge === 'number' && notificationBadge > 0 && (
            <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-md border-2 border-white pointer-events-none z-10">
              {notificationBadge > 99 ? '99+' : notificationBadge}
            </div>
          )}
        </div>
      </motion.div>
    );
  }
);

FloatingButton.displayName = "FloatingButton";
