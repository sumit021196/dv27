"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const trackView = async () => {
            // Get or create session ID
            let sessionId = sessionStorage.getItem("dv27_session_id");
            if (!sessionId) {
                sessionId = crypto.randomUUID();
                sessionStorage.setItem("dv27_session_id", sessionId);
            }

            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from("page_views").insert({
                path: pathname,
                session_id: sessionId,
                user_id: user?.id || null,
                user_agent: window.navigator.userAgent,
            });
        };

        trackView();
    }, [pathname, supabase]);

    return null;
}
