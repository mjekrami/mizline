-- Phase 1: CHECK constraints
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_quantity_positive" CHECK (quantity > 0);
ALTER TABLE "Product" ADD CONSTRAINT "Product_price_non_negative" CHECK (price >= 0);
ALTER TABLE "Order" ADD CONSTRAINT "Order_totals_non_negative" CHECK (subtotal >= 0 AND total >= 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_price_non_negative" CHECK (price >= 0);
ALTER TABLE "ModifierGroup" ADD CONSTRAINT "ModifierGroup_select_bounds"
  CHECK ("minSelect" >= 0 AND "maxSelect" >= 0 AND "minSelect" <= "maxSelect");
ALTER TABLE "Store" ADD CONSTRAINT "Store_delay_thresholds"
  CHECK ("delayWarningMinutes" < "delayCriticalMinutes");

-- Phase 2: Order name snapshots
ALTER TABLE "Order" ADD COLUMN "tableName" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "productName" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "variantName" TEXT;

UPDATE "Order" o
SET "tableName" = t.name
FROM "Table" t
WHERE t.id = o."tableId";

UPDATE "OrderItem" oi
SET "productName" = p.name,
    "variantName" = (
      SELECT pv.name FROM "ProductVariant" pv WHERE pv.id = oi."variantId"
    )
FROM "Product" p
WHERE p.id = oi."productId";

ALTER TABLE "Order" ALTER COLUMN "tableName" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "productName" SET NOT NULL;

-- Phase 3: Cross-entity consistency triggers
CREATE OR REPLACE FUNCTION check_order_consistency()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "Store" s
    WHERE s.id = NEW."storeId" AND s."tenantId" = NEW."tenantId"
  ) THEN
    RAISE EXCEPTION 'Order storeId does not belong to tenantId';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "Table" t
    WHERE t.id = NEW."tableId" AND t."storeId" = NEW."storeId"
  ) THEN
    RAISE EXCEPTION 'Order tableId does not belong to storeId';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_consistency
  BEFORE INSERT OR UPDATE OF "tenantId", "storeId", "tableId" ON "Order"
  FOR EACH ROW EXECUTE FUNCTION check_order_consistency();

CREATE OR REPLACE FUNCTION check_user_store_consistency()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "User" u
    JOIN "Store" s ON s.id = NEW."storeId"
    WHERE u.id = NEW."userId" AND u."tenantId" = s."tenantId"
  ) THEN
    RAISE EXCEPTION 'UserStore links a user to a store in a different tenant';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_store_consistency
  BEFORE INSERT OR UPDATE OF "userId", "storeId" ON "UserStore"
  FOR EACH ROW EXECUTE FUNCTION check_user_store_consistency();

CREATE OR REPLACE FUNCTION check_order_item_consistency()
RETURNS TRIGGER AS $$
DECLARE
  order_store_id TEXT;
  product_store_id TEXT;
BEGIN
  SELECT o."storeId" INTO order_store_id
  FROM "Order" o
  WHERE o.id = NEW."orderId";

  IF order_store_id IS NULL THEN
    RAISE EXCEPTION 'Order not found for order item';
  END IF;

  SELECT c."storeId" INTO product_store_id
  FROM "Product" p
  JOIN "Category" c ON c.id = p."categoryId"
  WHERE p.id = NEW."productId";

  IF product_store_id IS NULL OR product_store_id <> order_store_id THEN
    RAISE EXCEPTION 'Product does not belong to the same store as the order';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_item_consistency
  BEFORE INSERT OR UPDATE OF "orderId", "productId" ON "OrderItem"
  FOR EACH ROW EXECUTE FUNCTION check_order_item_consistency();

CREATE OR REPLACE FUNCTION check_product_modifier_consistency()
RETURNS TRIGGER AS $$
DECLARE
  product_store_id TEXT;
  group_store_id TEXT;
BEGIN
  SELECT c."storeId" INTO product_store_id
  FROM "Product" p
  JOIN "Category" c ON c.id = p."categoryId"
  WHERE p.id = NEW."productId";

  SELECT mg."storeId" INTO group_store_id
  FROM "ModifierGroup" mg
  WHERE mg.id = NEW."groupId";

  IF product_store_id IS NULL OR group_store_id IS NULL OR product_store_id <> group_store_id THEN
    RAISE EXCEPTION 'Product and modifier group must belong to the same store';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_modifier_consistency
  BEFORE INSERT OR UPDATE OF "productId", "groupId" ON "ProductModifierGroup"
  FOR EACH ROW EXECUTE FUNCTION check_product_modifier_consistency();

-- Phase 5: Prevent cascade deletion of order history
ALTER TABLE "Order" DROP CONSTRAINT "Order_storeId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey"
  FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" DROP CONSTRAINT "Order_tableId_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey"
  FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
