-- ==========================================
-- RLS Policies for product_categories table
-- ==========================================

-- 1. Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- 2. Allow everyone to SELECT (Read access)
-- This ensures products show up on the frontend for all users
CREATE POLICY "Product categories are viewable by everyone."
ON public.product_categories
FOR SELECT
USING (true);

-- 3. Allow only admins to INSERT/UPDATE/DELETE
-- (Assuming admins are identified by is_admin = true in profiles table)
CREATE POLICY "Admins can manage product categories."
ON public.product_categories
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- Note: If you want to allow initial setup without strict profile check,
-- you can use service_role for migrations/scripts.
