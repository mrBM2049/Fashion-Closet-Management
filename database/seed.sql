-- ============================================================
-- ThreadShare – Seed Data
-- ============================================================

USE threadshare;

-- ============================================================
-- Categories (top-level + subcategories)
-- ============================================================
INSERT INTO Categories (name, slug, parent_id) VALUES
  ('Tops',        'tops',        NULL),
  ('Bottoms',     'bottoms',     NULL),
  ('Dresses',     'dresses',     NULL),
  ('Outerwear',   'outerwear',   NULL),
  ('Footwear',    'footwear',    NULL),
  ('Accessories', 'accessories', NULL),
  ('Activewear',  'activewear',  NULL),
  -- Subcategories
  ('T-Shirts',    't-shirts',    1),
  ('Shirts',      'shirts',      1),
  ('Jeans',       'jeans',       2),
  ('Trousers',    'trousers',    2),
  ('Sneakers',    'sneakers',    5),
  ('Boots',       'boots',       5);

-- ============================================================
-- Users (passwords are bcrypt hashes of 'password123')
-- ============================================================
INSERT INTO Users (email, username, password_hash, display_name, location) VALUES
  ('alice@example.com',   'alice',   '$2a$12$LJ3cRz.REmFaeRMR0Fv9v.kI9Gy5fHxJlmKKiVzm1Bqz/m0jWMGq', 'Alice Johnson',  'Mumbai'),
  ('bob@example.com',     'bob',     '$2a$12$LJ3cRz.REmFaeRMR0Fv9v.kI9Gy5fHxJlmKKiVzm1Bqz/m0jWMGq', 'Bob Smith',      'Delhi'),
  ('charlie@example.com', 'charlie', '$2a$12$LJ3cRz.REmFaeRMR0Fv9v.kI9Gy5fHxJlmKKiVzm1Bqz/m0jWMGq', 'Charlie Brown',  'Bangalore'),
  ('diana@example.com',   'diana',   '$2a$12$LJ3cRz.REmFaeRMR0Fv9v.kI9Gy5fHxJlmKKiVzm1Bqz/m0jWMGq', 'Diana Prince',   'Ahmedabad'),
  ('eve@example.com',     'eve',     '$2a$12$LJ3cRz.REmFaeRMR0Fv9v.kI9Gy5fHxJlmKKiVzm1Bqz/m0jWMGq', 'Eve Williams',   'Pune');
