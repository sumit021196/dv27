"use client";

import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LogoProps {
    className?: string;
    width?: number | string;
    height?: number | string;
}

export default function Logo({ className, width, height }: LogoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    const handleEnded = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play();
                setIsVisible(true);
            }
        }, 300); // Short pause for fade
    };

    return (
        <div className={cn("relative overflow-hidden", className)} style={{ width, height }}>
            <AnimatePresence mode="wait">
                {isVisible && (
                    <motion.video
                        key="logo-video"
                        ref={videoRef}
                        src="https://bjhuvekaehvyzzptszmq.supabase.co/storage/v1/object/public/products/VID_20260517214248.mp4"
                        autoPlay
                        muted
                        playsInline
                        // @ts-ignore
                        webkit-playsinline="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        onEnded={handleEnded}
                        className="w-full h-full object-contain pointer-events-none mix-blend-multiply"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
