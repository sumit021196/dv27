-- ==========================================
-- CLIENT INITIALIZATION SCRIPT
-- ==========================================
-- This script prepares a new database for a fresh client.
-- Use this after running full_schema.sql and migrations.

-- 1. CLEAR EXISTING DATA (Optional - CAUTION)
-- Uncomment these if you want to start with an empty store
-- TRUNCATE orders, order_items, shipping_details, wishlist, reviews CASCADE;
-- TRUNCATE products, categories, product_images, banners CASCADE;

-- 2. INITIALIZE DEFAULT SETTINGS
-- Replace 'CLIENT NAME' with the actual client name
DELETE FROM settings WHERE key IN ('site_name', 'ticker_text', 'theme_colors', 'contact_info', 'social_links', 'seo_meta');

INSERT INTO settings (key, value, type, description) VALUES
('site_name', '"NEW CLIENT STORE"', 'text', 'The name of the website'),
('ticker_text', '"WELCOME TO OUR NEW STORE • FREE SHIPPING ON ALL ORDERS • SHOP NOW"', 'text', 'The scrolling announcement text'),
('theme_colors', '{"primary": "#000000", "accent": "#FF0000", "text": "#FFFFFF"}', 'json', 'Global theme colors'),
('contact_info', '{"email": "contact@client.com", "phone": "+91 00000 00000", "address": "City, India"}', 'json', 'Contact information'),
('social_links', '{"instagram": "https://instagram.com/client", "youtube": "https://youtube.com/@client"}', 'json', 'Social media links'),
('seo_meta', '{"description": "New fashion destination", "keywords": "fashion, clothing, store"}', 'json', 'SEO Metadata');

-- 3. INITIALIZE DEFAULT CATEGORIES (Optional)
INSERT INTO categories (name, slug, image_url) VALUES
('New Arrivals', 'new-arrivals', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b'),
('Best Sellers', 'best-sellers', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f');
