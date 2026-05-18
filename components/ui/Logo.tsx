"use client";

import { cn } from "@/utils/cn";

interface LogoProps {
    className?: string;
    width?: number | string;
    height?: number | string;
}

export default function Logo({ className, width, height }: LogoProps) {
    return (
        <video
            src="https://res.cloudinary.com/ddbj6idxf/video/upload/VID_20260517214248_gtmxg2.mp4"
            poster="/logo.svg"
            autoPlay
            loop
            muted
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
            aria-label="DV27 Logo"
            className={cn("object-contain pointer-events-none mix-blend-multiply", className)}
            style={{ width, height }}
        >
            <img src="/logo.svg" alt="DV27 Logo" className="w-full h-full object-contain" />
        </video>
    );
}
