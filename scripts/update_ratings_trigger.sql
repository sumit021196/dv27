-- Trigger to update product rating when reviews are modified
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_product_rating ON reviews;
CREATE TRIGGER tr_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();
