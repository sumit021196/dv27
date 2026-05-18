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
            src="https://bjhuvekaehvyzzptszmq.supabase.co/storage/v1/object/public/products/VID_20260517214248.mp4"
            autoPlay
            loop
            muted
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
            className={cn("object-contain pointer-events-none", className)}
            style={{ width, height }}
        />
    );
}
