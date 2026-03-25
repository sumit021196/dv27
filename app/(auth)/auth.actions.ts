
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function getFriendlyErrorMessage(message: string) {
    if (message.includes("Invalid login credentials") || message.includes("Email not confirmed")) {
        return "Invalid email or password. Please try again.";
    }
    if (message.includes("User already registered") || message.includes("duplicate key")) {
        return "An account with this email already exists.";
    }
    if (message.includes("Password should be at least 6 characters")) {
        return "Password must be at least 6 characters long.";
    }
    if (message.includes("rate limit")) {
        return "Too many requests. Please try again later.";
    }
    return message;
}

export async function signup(formData: FormData) {
    try {
        const supabase = await createClient();

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const fullName = formData.get("fullName") as string;

        if (!email || !password || !fullName) {
            return { error: "Please fill in all required fields." };
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            return { error: getFriendlyErrorMessage(error.message) };
        }
    } catch (err: any) {
        return { error: "An unexpected error occurred during signup. Please try again." };
    }

    revalidatePath("/", "layout");
    redirect("/?signup=success");
}

export async function login(formData: FormData) {
    let redirectToAdmin = false;
    try {
        const supabase = await createClient();

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            return { error: "Please provide both email and password." };
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error: getFriendlyErrorMessage(error.message) };
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .single();

            if (profile?.is_admin === true) {
                redirectToAdmin = true;
            }
        }
    } catch (err: any) {
        return { error: "An unexpected error occurred during login. Please try again." };
    }

    revalidatePath("/", "layout");
    if (redirectToAdmin) {
        redirect("/admin");
    } else {
        redirect("/");
    }
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}
