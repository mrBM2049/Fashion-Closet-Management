-- ============================================================
-- ThreadShare – Key Queries for Viva Reference
-- ============================================================

USE threadshare;

-- [TOPIC: FULLTEXT Search]
-- Search items by name, brand, or description using FULLTEXT index
SELECT item_id, name, brand, image_url,
       MATCH(name, brand, description) AGAINST('vintage denim' IN BOOLEAN MODE) AS relevance
FROM   Inventory_Items
WHERE  user_id = 1
  AND  MATCH(name, brand, description) AGAINST('vintage denim' IN BOOLEAN MODE)
ORDER  BY relevance DESC;

-- [TOPIC: Subquery]
-- Items never worn (subquery with NOT IN)
SELECT item_id, name, brand, created_at
FROM   Inventory_Items
WHERE  user_id = 1
  AND  item_id NOT IN (SELECT DISTINCT item_id FROM Wear_Log)
ORDER  BY created_at DESC;

-- [TOPIC: Aggregate + GROUP BY]
-- Most worn items per user
SELECT name, brand, wear_count,
       ROUND(purchase_price / NULLIF(wear_count, 0), 2) AS cost_per_wear
FROM   Inventory_Items
WHERE  user_id = 1
  AND  purchase_price IS NOT NULL
ORDER  BY wear_count DESC
LIMIT  5;

-- [TOPIC: View]
-- Cost-per-wear analytics using the view
SELECT name, brand, purchase_price, wear_count, cost_per_wear
FROM   v_cost_per_wear
WHERE  user_id = 1
ORDER  BY cost_per_wear ASC;

-- [TOPIC: Trigger demonstration]
-- Insert into Wear_Log → trg_wear_count_increment fires automatically
-- Before: SELECT wear_count FROM Inventory_Items WHERE item_id = 1;
INSERT INTO Wear_Log (item_id, worn_on, occasion) VALUES (1, CURDATE(), 'College');
-- After: SELECT wear_count FROM Inventory_Items WHERE item_id = 1;
-- wear_count should be incremented by 1

-- [TOPIC: Stored Procedure call]
CALL sp_add_wear_entry(1, '2026-04-12', 'Party');

-- [TOPIC: Transaction + ROLLBACK]
-- Atomic outfit creation
START TRANSACTION;
  INSERT INTO Outfits (user_id, name, occasion_tag) VALUES (1, 'Monday Fit', 'Casual');
  SET @oid = LAST_INSERT_ID();
  INSERT INTO Outfit_Items (outfit_id, item_id, position)
    VALUES (@oid, 1, 1), (@oid, 2, 2), (@oid, 3, 3);
COMMIT;
-- On error: ROLLBACK;

-- [TOPIC: Multi-table JOIN]
-- Transaction history with item name, seller, and buyer
SELECT t.txn_id, t.txn_type, t.status, t.amount, t.txn_date,
       ii.name AS item_name,
       s.username AS seller, b.username AS buyer
FROM   Transactions t
JOIN   Inventory_Items ii ON ii.item_id   = t.item_id
JOIN   Users           s  ON s.user_id    = t.seller_id
JOIN   Users           b  ON b.user_id    = t.buyer_id
WHERE  t.seller_id = 1 OR t.buyer_id = 1
ORDER  BY t.created_at DESC;

-- [TOPIC: LEFT JOIN with filters]
-- Closet grid with category name
SELECT ii.*, c.name AS category_name
FROM   Inventory_Items ii
LEFT JOIN Categories c ON c.cat_id = ii.cat_id
WHERE  ii.user_id = 1
ORDER  BY ii.created_at DESC;

-- [TOPIC: Self-referencing FK]
-- Get subcategories for a parent category
SELECT child.cat_id, child.name, child.slug, parent.name AS parent_name
FROM   Categories child
LEFT JOIN Categories parent ON parent.cat_id = child.parent_id
ORDER  BY parent.name, child.name;

-- [TOPIC: M:N JOIN]
-- Outfit with its items
SELECT o.name AS outfit_name, ii.name AS item_name, ii.brand, oi.position
FROM   Outfit_Items oi
JOIN   Outfits o ON o.outfit_id = oi.outfit_id
JOIN   Inventory_Items ii ON ii.item_id = oi.item_id
WHERE  o.outfit_id = 1
ORDER  BY oi.position;
