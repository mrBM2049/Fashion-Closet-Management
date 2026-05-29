-- ============================================================
-- ThreadShare – Seed Data  (Phase 7 — Full Demo Data)
-- ============================================================
-- Passwords are bcrypt hashes of 'password123'
-- Run AFTER schema.sql
-- ============================================================

USE threadshare;

-- ============================================================
-- Categories
-- ============================================================
INSERT IGNORE INTO Categories (name, slug, parent_id) VALUES
  ('Tops',        'tops',        NULL),
  ('Bottoms',     'bottoms',     NULL),
  ('Dresses',     'dresses',     NULL),
  ('Outerwear',   'outerwear',   NULL),
  ('Footwear',    'footwear',    NULL),
  ('Accessories', 'accessories', NULL),
  ('Activewear',  'activewear',  NULL),
  ('T-Shirts',    't-shirts',    1),
  ('Shirts',      'shirts',      1),
  ('Jeans',       'jeans',       2),
  ('Trousers',    'trousers',    2),
  ('Sneakers',    'sneakers',    5),
  ('Boots',       'boots',       5);

-- ============================================================
-- Users  (password: password123)
-- ============================================================
INSERT IGNORE INTO Users (email, username, password_hash, display_name, location) VALUES
  ('alice@example.com',   'alice',   '$2b$12$rkrrTZyEnGo/kjDnDygF6.eI2WJ594ZXQvrpUnw.193C0YYuSABAi', 'Alice Johnson',  'Mumbai'),
  ('bob@example.com',     'bob',     '$2b$12$rkrrTZyEnGo/kjDnDygF6.eI2WJ594ZXQvrpUnw.193C0YYuSABAi', 'Bob Smith',      'Delhi'),
  ('charlie@example.com', 'charlie', '$2b$12$rkrrTZyEnGo/kjDnDygF6.eI2WJ594ZXQvrpUnw.193C0YYuSABAi', 'Charlie Brown',  'Bangalore'),
  ('diana@example.com',   'diana',   '$2b$12$rkrrTZyEnGo/kjDnDygF6.eI2WJ594ZXQvrpUnw.193C0YYuSABAi', 'Diana Prince',   'Ahmedabad'),
  ('eve@example.com',     'eve',     '$2b$12$rkrrTZyEnGo/kjDnDygF6.eI2WJ594ZXQvrpUnw.193C0YYuSABAi', 'Eve Williams',   'Pune');

-- ============================================================
-- Inventory Items  (user_id 1 = alice, 2 = bob, 3 = charlie)
-- ============================================================
INSERT INTO Inventory_Items
  (user_id, cat_id, name, brand, size, color, condition_grade, purchase_price, status, wear_count, description, image_url)
VALUES
  -- Alice (user 1) — 14 items
  (1,  8,  'Classic White Tee',     'Uniqlo',          'M',   'White',  'Like New', 599.00,   'Available', 0, 'Supima cotton, crew neck',          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'),
  (1,  8,  'Graphic Band Tee',      'H&M',             'S',   'Black',  'Good',     399.00,   'Available', 0, 'Vintage rock print',                'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop'),
  (1,  9,  'Oxford Button-Down',    'Arrow',           'M',   'Blue',   'New',      1299.00,  'Available', 0, 'Slim fit, formal',                  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop'),
  (1,  10, 'Slim Fit Jeans',        'Levi\'s',         '28',  'Blue',   'Good',     2499.00,  'Available', 0, '511 slim, mid-rise',                'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'),
  (1,  10, 'Black Skinny Jeans',    'Zara',            '28',  'Black',  'Like New', 1999.00,  'Available', 0, 'High waist',                        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'),
  (1,  11, 'Khaki Chinos',          'Marks & Spencer', '30',  'Beige',  'Good',     1799.00,  'Available', 0, 'Straight fit',                      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop'),
  (1,  4,  'Denim Jacket',          'Levi\'s',         'M',   'Blue',   'Good',     3499.00,  'Available', 0, 'Trucker jacket, vintage wash',      'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=400&fit=crop'),
  (1,  4,  'Wool Blazer',           'Raymond',         'M',   'Grey',   'Like New', 4999.00,  'Available', 0, 'Single breasted, formal',           'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop'),
  (1,  12, 'White Sneakers',        'Nike',            '42',  'White',  'Good',     5999.00,  'Available', 0, 'Air Force 1',                       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'),
  (1,  12, 'Running Shoes',         'Adidas',          '42',  'Black',  'Fair',     3999.00,  'Available', 0, 'Ultraboost 22',                     'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop'),
  (1,  6,  'Leather Belt',          'Woodland',        'M',   'Brown',  'Good',     799.00,   'Available', 0, 'Genuine leather',                   'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=400&fit=crop'),
  (1,  6,  'Canvas Backpack',       'Wildcraft',       NULL,  'Navy',   'Good',     1499.00,  'Available', 0, '30L, laptop compartment',           'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'),
  (1,  3,  'Floral Sundress',       'Zara',            'S',   'Pink',   'New',      2299.00,  'Available', 0, 'Midi length, summer',               'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop'),
  (1,  7,  'Yoga Pants',            'Decathlon',       'S',   'Black',  'Good',     999.00,   'Available', 0, 'High waist, 4-way stretch',         'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop'),

  -- Bob (user 2) — 10 items
  (2,  8,  'Polo Shirt',            'Lacoste',         'L',   'Navy',   'Like New', 3499.00,  'Available', 0, 'Classic fit pique',                 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&h=400&fit=crop'),
  (2,  9,  'Linen Shirt',           'Fabindia',        'L',   'White',  'Good',     1299.00,  'Available', 0, 'Relaxed fit, summer',               'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop'),
  (2,  10, 'Cargo Pants',           'Roadster',        '32',  'Green',  'Good',     1599.00,  'Available', 0, 'Multi-pocket',                      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=400&h=400&fit=crop'),
  (2,  4,  'Leather Jacket',        'Royal Enfield',   'L',   'Black',  'Good',     8999.00,  'Available', 0, 'Biker style',                       'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'),
  (2,  12, 'Canvas Sneakers',       'Converse',        '43',  'White',  'Fair',     2999.00,  'Available', 0, 'Chuck Taylor All Star',             'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=400&h=400&fit=crop'),
  (2,  13, 'Chelsea Boots',         'Clarks',          '43',  'Brown',  'Like New', 6999.00,  'Available', 0, 'Leather upper',                     'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400&h=400&fit=crop'),
  (2,  6,  'Aviator Sunglasses',    'Ray-Ban',         NULL,  'Black',  'Good',     7999.00,  'Available', 0, 'Classic aviator',                   'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop'),
  (2,  7,  'Track Pants',           'Nike',            'L',   'Grey',   'Good',     1799.00,  'Available', 0, 'Dri-FIT',                           'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop'),
  (2,  8,  'Striped T-Shirt',       'Tommy Hilfiger',  'L',   'Navy',   'New',      2499.00,  'Available', 0, 'Classic stripe',                    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'),
  (2,  11, 'Formal Trousers',       'Van Heusen',      '32',  'Black',  'Like New', 2299.00,  'Available', 0, 'Slim fit, office wear',             'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=400&h=400&fit=crop'),

  -- Charlie (user 3) — 8 items
  (3,  8,  'Oversized Hoodie',      'Puma',            'XL',  'Grey',   'Good',     2499.00,  'Available', 0, 'Fleece lined',                      'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=400&fit=crop'),
  (3,  10, 'Ripped Jeans',          'Pepe Jeans',      '30',  'Blue',   'Good',     2999.00,  'Available', 0, 'Slim fit distressed',               'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=400&h=400&fit=crop'),
  (3,  4,  'Bomber Jacket',         'Zara',            'M',   'Beige',  'Like New', 3999.00,  'Available', 0, 'Satin finish',                      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop'),
  (3,  12, 'Jordan 1 Retro',        'Nike',            '41',  'Red',    'Good',     12999.00, 'Available', 0, 'Chicago colorway',                  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'),
  (3,  6,  'Snapback Cap',          'New Era',         NULL,  'Black',  'Good',     1499.00,  'Available', 0, '59FIFTY fitted',                    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop'),
  (3,  7,  'Compression Shorts',    'Under Armour',    'M',   'Black',  'Good',     1299.00,  'Available', 0, 'HeatGear',                          'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop'),
  (3,  9,  'Flannel Shirt',         'Levis',           'L',   'Red',    'Good',     1999.00,  'Available', 0, 'Plaid pattern',                     'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=400&h=400&fit=crop'),
  (3,  3,  'Wrap Dress',            'H&M',             'M',   'Green',  'New',      1799.00,  'Available', 0, 'Midi wrap, floral',                 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop');

-- ============================================================
-- Wear Log  (item_ids 1–14 belong to alice = user 1)
-- ============================================================
INSERT INTO Wear_Log (item_id, worn_on, occasion) VALUES
  (1,  '2026-01-05', 'College'),
  (1,  '2026-01-12', 'Casual'),
  (1,  '2026-01-20', 'College'),
  (2,  '2026-01-08', 'Concert'),
  (2,  '2026-02-14', 'Casual'),
  (3,  '2026-01-15', 'Work'),
  (3,  '2026-01-22', 'Work'),
  (3,  '2026-02-01', 'Formal'),
  (4,  '2026-01-10', 'College'),
  (4,  '2026-01-18', 'Casual'),
  (4,  '2026-02-05', 'College'),
  (4,  '2026-02-20', 'Casual'),
  (5,  '2026-01-25', 'Party'),
  (5,  '2026-02-08', 'Date'),
  (7,  '2026-01-30', 'Casual'),
  (8,  '2026-02-10', 'Work'),
  (8,  '2026-02-18', 'Formal'),
  (9,  '2026-01-07', 'College'),
  (9,  '2026-01-14', 'Casual'),
  (9,  '2026-01-21', 'College'),
  (13, '2026-02-15', 'Date'),
  (14, '2026-01-28', 'Sport');

-- ============================================================
-- Outfits  (alice = user 1)
-- ============================================================
INSERT INTO Outfits (user_id, name, occasion_tag) VALUES
  (1, 'Monday College Fit',  'College'),
  (1, 'Weekend Casual',      'Casual'),
  (1, 'Office Ready',        'Work'),
  (1, 'Night Out',           'Party'),
  (1, 'Gym Session',         'Sport');

-- Outfit_Items  (outfit 1–5, items from alice)
INSERT INTO Outfit_Items (outfit_id, item_id, position) VALUES
  -- Monday College Fit: white tee + slim jeans + white sneakers
  (1, 1, 1), (1, 4, 2), (1, 9, 3),
  -- Weekend Casual: graphic tee + black jeans + running shoes
  (2, 2, 1), (2, 5, 2), (2, 10, 3),
  -- Office Ready: oxford shirt + chinos + wool blazer + leather belt
  (3, 3, 1), (3, 6, 2), (3, 8, 3), (3, 11, 4),
  -- Night Out: floral dress + white sneakers
  (4, 13, 1), (4, 9, 2),
  -- Gym Session: yoga pants + graphic tee + running shoes
  (5, 14, 1), (5, 2, 2), (5, 10, 3);

-- ============================================================
-- Transactions
-- ============================================================
INSERT INTO Transactions (item_id, seller_id, buyer_id, txn_type, amount, status, txn_date, notes) VALUES
  -- alice sells denim jacket to bob (completed — trigger fires → item = Sold)
  (7,  1, 2, 'Sale',   2500.00, 'Completed', '2026-02-01', 'Good condition, slight fading'),
  -- bob lends chelsea boots to charlie (pending)
  (20, 2, 3, 'Borrow', NULL,    'Pending',   '2026-02-10', 'Return by end of month'),
  -- charlie sells Jordan 1 to alice (pending)
  (28, 3, 1, 'Sale',   9999.00, 'Pending',   '2026-02-20', 'Barely worn, box included'),
  -- alice borrows polo from bob (completed)
  (15, 2, 1, 'Borrow', NULL,    'Completed', '2026-01-25', 'For college fest'),
  -- bob sells leather jacket to diana (cancelled)
  (18, 2, 4, 'Sale',   7000.00, 'Cancelled', '2026-02-05', 'Buyer backed out');
