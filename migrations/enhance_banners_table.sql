-- Enhance banners table
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Shop Now',
ADD COLUMN IF NOT EXISTS style_type TEXT DEFAULT 'default'; -- 'default', 'wtflex_bold', 'split', 'video'
