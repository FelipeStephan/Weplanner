"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { cn } from "../lib/utils"; // Assuming utils is at ../lib/utils based on file structure

interface BackgroundMediaProps {
    url: string | null;
    type: "video" | "image";
    fallbackVideoSrc?: string;
    fallbackImageSrc?: string;
    className?: string; // Allow custom classes
    enableGlitch?: boolean;
}

export const BackgroundMedia = ({
    url,
    type,
    fallbackVideoSrc,
    fallbackImageSrc,
    className,
    enableGlitch = false,
}: BackgroundMediaProps) => {
    const videoRef1 = useRef<HTMLVideoElement>(null);
    const videoRef2 = useRef<HTMLVideoElement>(null);

    const [loaded, setLoaded] = useState(false);
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [currentType, setCurrentType] = useState<"video" | "image">("video");

    // Glitch State
    const [isGlitching, setIsGlitching] = useState(false);

    // Crossfade State
    const [activeVideo, setActiveVideo] = useState<1 | 2>(1); // Which video is currently primary (listening to time)
    const [topLayerOpacity, setTopLayerOpacity] = useState(1); // 1 = Show V1, 0 = Show V2

    useEffect(() => {
        setLoaded(false);
        setIsGlitching(false);
        // Reset to initial state
        setActiveVideo(1);
        setTopLayerOpacity(1);

        if (url) {
            setCurrentUrl(url);
            setCurrentType(type);
        } else {
            if (fallbackVideoSrc) {
                setCurrentUrl(fallbackVideoSrc);
                setCurrentType("video");
            } else if (fallbackImageSrc) {
                setCurrentUrl(fallbackImageSrc);
                setCurrentType("image");
            }
        }
    }, [url, type, fallbackVideoSrc, fallbackImageSrc]);

    // Handle Glitch (Single Video Logic)
    const handleGlitchTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        const timeLeft = video.duration - video.currentTime;
        if (timeLeft < 0.5 && !isGlitching) {
            setIsGlitching(true);
        }
    };

    const handleGlitchEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        video.currentTime = 0;
        video.play();
        setTimeout(() => setIsGlitching(false), 500);
    };

    // Handle Crossfade (Dual Video Logic)
    const handleCrossfadeTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        // Only run logic if we are the active video
        const video = e.currentTarget;
        if (video !== (activeVideo === 1 ? videoRef1.current : videoRef2.current)) return;

        const timeLeft = video.duration - video.currentTime;

        // Start crossfade 1s before end
        if (timeLeft < 1.0) {
            // Need to switch!
            const nextVideo = activeVideo === 1 ? videoRef2.current : videoRef1.current;
            const nextActive = activeVideo === 1 ? 2 : 1;

            if (nextVideo) {
                // Determine if we need to switch active video tracker to stop firing this trigger
                // We do it immediately so we don't trigger multiple times
                setActiveVideo(nextActive);

                // Start the next video
                nextVideo.currentTime = 0;
                nextVideo.play();
                nextVideo.muted = true; // Ensure muted

                // Toggle visibility
                // If V1 was active (opacity 1), we want to fade V1 out (opacity 0) to reveal V2.
                // If V2 was active (V1 opacity 0), we want to fade V1 in (opacity 1) to cover V2.
                if (activeVideo === 1) {
                    setTopLayerOpacity(0);
                } else {
                    setTopLayerOpacity(1);
                }

                // Schedule reset of the old video after transition (1s)
                setTimeout(() => {
                    video.pause();
                    video.currentTime = 0;
                }, 1000);
            }
        }
    };


    return (
        <div className={cn("fixed inset-0 z-0 overflow-hidden bg-black", className)}>
            <style>{`
                /* ... Glitch Keyframes omitted for brevity, keeping existing ... */
                 @keyframes glitch-anim-1 {
                    0% { clip-path: inset(20% 0 80% 0); transform: translate(-5px, 2px); }
                    20% { clip-path: inset(60% 0 10% 0); transform: translate(5px, -2px); }
                    40% { clip-path: inset(40% 0 50% 0); transform: translate(-5px, 5px); }
                    60% { clip-path: inset(80% 0 5% 0); transform: translate(5px, -5px); }
                    80% { clip-path: inset(10% 0 70% 0); transform: translate(-5px, 2px); }
                    100% { clip-path: inset(30% 0 50% 0); transform: translate(5px, -2px); }
                }
                @keyframes glitch-anim-2 {
                    0% { clip-path: inset(10% 0 60% 0); transform: translate(5px, -2px); }
                    20% { clip-path: inset(80% 0 5% 0); transform: translate(-5px, 5px); }
                    40% { clip-path: inset(30% 0 20% 0); transform: translate(5px, -5px); }
                    60% { clip-path: inset(10% 0 80% 0); transform: translate(-5px, 2px); }
                    80% { clip-path: inset(50% 0 30% 0); transform: translate(5px, -2px); }
                    100% { clip-path: inset(20% 0 70% 0); transform: translate(-5px, 5px); }
                }
                @keyframes glitch-flash {
                    0% { opacity: 1; filter: brightness(1); }
                    50% { opacity: 0.8; filter: brightness(1.5) contrast(1.2); }
                    100% { opacity: 1; filter: brightness(1); }
                }
                .glitch-active {
                    animation: glitch-anim-1 0.2s infinite linear alternate-reverse;
                    filter: hue-rotate(90deg) contrast(1.5);
                }
                .glitch-active::before {
                    content: "";
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: inherit;
                    opacity: 0.5;
                    animation: glitch-anim-2 0.3s infinite linear alternate-reverse;
                    mix-blend-mode: hard-light;
                    pointer-events: none;
                }
            `}</style>

            {currentUrl && (
                currentType === "video" ? (
                    <div className="relative w-full h-full">
                        {/* 
                            Logic Split: 
                            1. Glitch Mode: Uses Video 1 only.
                            2. Crossfade Mode: Uses Video 1 (Top) and Video 2 (Bottom).
                        */}

                        {/* Video Layer 2 (Bottom) - Only used for crossfade */}
                        {!enableGlitch && (
                            <video
                                ref={videoRef2}
                                muted
                                playsInline
                                className={cn(
                                    "absolute inset-0 w-full h-full object-cover z-0",
                                    // Always visible behind, but we can set loaded here too
                                    loaded ? "opacity-100" : "opacity-0"
                                )}
                                src={currentUrl}
                                // No listeners needed, driven by V1 logic usually, but we attach for updates when it becomes active
                                onTimeUpdate={handleCrossfadeTimeUpdate}
                            />
                        )}

                        {/* Video Layer 1 (Top) - Used for Glitch AND Crossfade */}
                        <video
                            ref={videoRef1}
                            autoPlay
                            muted
                            playsInline
                            className={cn(
                                "absolute inset-0 w-full h-full object-cover",
                                // Z-Index: 10 to cover V2
                                "z-10",
                                // Transition:
                                enableGlitch
                                    ? "transition-all duration-75" // Fast for Glitch
                                    : "transition-opacity duration-1000 ease-in-out", // Slow for Crossfade
                                // Opacity Logic:
                                enableGlitch
                                    ? (loaded && !isGlitching ? "opacity-100" : (isGlitching ? "opacity-100 glitch-active scale-105" : "opacity-0"))
                                    : (loaded ? `opacity-${topLayerOpacity === 1 ? "100" : "0"}` : "opacity-0")
                            )}
                            src={currentUrl}
                            onLoadedData={() => setLoaded(true)}
                            onTimeUpdate={enableGlitch ? handleGlitchTimeUpdate : handleCrossfadeTimeUpdate}
                            onEnded={enableGlitch ? handleGlitchEnded : undefined} // Crossfade doesn't rely on onEnded
                        />

                        {/* Mask Overlay during glitch */}
                        {isGlitching && enableGlitch && (
                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay animate-pulse pointer-events-none z-20" />
                        )}
                    </div>
                ) : (
                    <Image
                        src={currentUrl}
                        alt="Background"
                        fill
                        className={cn(
                            "object-cover transition-opacity duration-1000 ease-in-out",
                            loaded ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => setLoaded(true)}
                        priority
                        unoptimized
                    />
                )
            )}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>
    );
};
