-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    type TEXT NOT NULL, -- 'text', 'image', 'json', 'number'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Settings are viewable by everyone." ON public.settings FOR SELECT USING (true);

-- Initial Data
INSERT INTO public.settings (key, value, type, description) VALUES
('site_name', '"THE DV27"', 'text', 'The name of the website'),
('ticker_text', '"OUR FLEXFAM IS NOW 150K STRONG • NEW ARRIVALS EVERY WEEK • FREE SHIPPING ON ORDERS ABOVE ₹999"', 'text', 'The scrolling announcement text at the top and bottom'),
('theme_colors', '{"primary": "#000000", "accent": "#FF00FF", "text": "#FFFFFF"}', 'json', 'Global theme colors'),
('contact_info', '{"email": "contact@dv27.in", "phone": "+91 98765 43210", "address": "New Delhi, India"}', 'json', 'Contact information for footer'),
('social_links', '{"instagram": "https://instagram.com/dv27", "youtube": "https://youtube.com/@dv27"}', 'json', 'Social media links');
