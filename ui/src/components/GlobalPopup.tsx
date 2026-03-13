'use client';

import { useEffect, useState, useRef } from 'react';
import { X } from "lucide-react";
import { usePopup } from '../context/PopupContext';

export function GlobalPopup() {
    const { isOpen, content, hidePopup } = usePopup();
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [popupContent, setPopupContent] = useState(content);

    useEffect(() => {
        if (content) {
            setPopupContent(content);
        }
    }, [content]);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsClosing(false);
        } else if (isVisible) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
                setPopupContent(null);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isVisible]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                hidePopup();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, hidePopup]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with Blur - Isolated to prevent artifacts */}
            <div
                className={`absolute inset-0 bg-black/80 transition-opacity duration-200 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
                    }`}
                onClick={hidePopup}
            />

            {/* Content Content - Added w-full and justify-center to fix width issues */}
            <div
                className={`relative z-50 w-full max-w-7xl flex justify-center ${isClosing ? 'animate-zoomOut' : 'animate-zoomIn'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
{popupContent}
            </div>
        </div>
    );
}
