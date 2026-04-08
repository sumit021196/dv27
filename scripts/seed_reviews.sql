-- Seed demo reviews with correct IDs
-- Using product IDs 11, 16, 17 found in the database
INSERT INTO public.reviews (product_id, rating, comment, status) VALUES
(11, 5, 'Superior quality! The French Terry cotton feels amazing.', 'approved'),
(11, 4, 'Great fit, definitely worth the price.', 'approved'),
(16, 5, 'Best cap I have ever owned. High quality embroidery.', 'approved'),
(16, 4, 'Love the distressed look. Shipping was fast.', 'approved'),
(17, 5, 'The vintage aesthetic is perfect. Huge fan of the fit.', 'approved')
ON CONFLICT DO NOTHING;
