"use client";

import { useState } from "react";
import { FALLBACK_IMG } from "@/utils/images";

interface AdminImageWithFallbackProps {
    src: string;
    alt: string;
    className?: string;
}

export default function AdminImageWithFallback({ src, alt, className }: AdminImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={imgSrc || FALLBACK_IMG}
            alt={alt}
            className={className}
            onError={() => setImgSrc(FALLBACK_IMG)}
        />
    );
}
