# Database Schema – ThreadShare (College Project)

**Fashion Closet Management System** | DBMS Subject | PDEU  
MySQL 8.0 · InnoDB · utf8mb4

---

## Entity Overview

```
Users
  │
  ├──< Inventory_Items (1:N)
  │         │
  │         ├──< Wear_Log (1:N)
  │         └──< Outfit_Items (M:N junction → Outfits)
  │
  ├──< Outfits (1:N)
  │         │
  │         └──< Outfit_Items (M:N junction → Inventory_Items)
  │
  └──< Transactions (1:N)
            │
            └── Inventory_Items (via item_id)

Categories (self-referencing hierarchy)
  └──< Inventory_Items (1:N via cat_id)
```

> **Syllabus coverage:** ER Model, relational model, keys, FK constraints, 1NF–3NF normalization, transactions, triggers, views, stored procedures, indexes, aggregation, subqueries, FULLTEXT search.

---

## Enums

```sql
-- Item condition
'New' | 'Like New' | 'Good' | 'Fair' | 'Poor'

-- Item status
'Available' | 'Listed' | 'Sold'

-- Transaction type
'Sale' | 'Borrow'

-- Transaction status
'Pending' | 'Completed' | 'Cancelled'

-- User role
'member' | 'admin'
```

---

## Tables

### `Users`

Stores all registered users of the platform.

| Column | Type | Nullable | Default | Constraint | Notes |
|--------|------|----------|---------|------------|-------|
| user_id | INT | NO | AUTO_INCREMENT | PK | |
| email | VARCHAR(255) | NO | — | UNIQUE, NOT NULL | Login identifier |
| username | VARCHAR(50) | NO | — | UNIQUE, NOT NULL | Display handle |
| password_hash | VARCHAR(255) | NO | — | NOT NULL | bcryptjs hash |
| display_name | VARCHAR(100) | YES | NULL | | Full name |
| avatar_url | VARCHAR(500) | YES | NULL | | Profile picture URL |
| location | VARCHAR(100) | YES | NULL | | City / region |
| role | ENUM('member','admin') | NO | 'member' | | |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | | |

```sql
CREATE TABLE Users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100),
  avatar_url    VARCHAR(500),
  location      VARCHAR(100),
  role          ENUM('member','admin') NOT NULL DEFAULT 'member',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Indexes:**
```sql
CREATE INDEX idx_users_email    ON Users(email);
CREATE INDEX idx_users_username ON Users(username);
```

---

### `Categories`

Self-referencing table for clothing classification (e.g. Tops → T-Shirts).

| Column | Type | Nullable | Default | Constraint | Notes |
|--------|------|----------|---------|------------|-------|
| cat_id | INT | NO | AUTO_INCREMENT | PK | |
| name | VARCHAR(100) | NO | — | NOT NULL | e.g. "Tops" |
| slug | VARCHAR(100) | NO | — | UNIQUE | URL-safe identifier |
| parent_id | INT | YES | NULL | FK → Categories.cat_id | NULL = top-level |

```sql
CREATE TABLE Categories (
  cat_id    INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(100) NOT NULL UNIQUE,
  parent_id INT DEFAULT NULL,
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id)
    REFERENCES Categories(cat_id) ON DELETE SET NULL
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Seed data:**
```sql
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
```

---

### `Inventory_Items`

Core entity — every clothing item a user owns.

| Column | Type | Nullable | Default | Constraint | Notes |
|--------|------|----------|---------|------------|-------|
| item_id | INT | NO | AUTO_INCREMENT | PK | |
| user_id | INT | NO | — | FK → Users.user_id ON DELETE CASCADE | Owner |
| cat_id | INT | YES | NULL | FK → Categories.cat_id ON DELETE SET NULL | |
| name | VARCHAR(200) | NO | — | NOT NULL | Item name |
| brand | VARCHAR(100) | YES | NULL | | |
| size | VARCHAR(20) | YES | NULL | | "S", "M", "32x30" |
| color | VARCHAR(50) | YES | NULL | | Primary color |
| condition_grade | ENUM('New','Like New','Good','Fair','Poor') | NO | 'Good' | | |
| purchase_price | DECIMAL(10,2) | YES | NULL | CHECK (purchase_price >= 0) | For cost-per-wear |
| image_url | VARCHAR(500) | YES | NULL | | Hosted image URL |
| tags | VARCHAR(255) | YES | NULL | | Comma-separated style tags |
| status | ENUM('Available','Listed','Sold') | NO | 'Available' | | |
| wear_count | INT | NO | 0 | CHECK (wear_count >= 0) | Auto-incremented by trigger |
| description | TEXT | YES | NULL | | |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | | |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

```sql
CREATE TABLE Inventory_Items (
  item_id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  cat_id          INT DEFAULT NULL,
  name            VARCHAR(200) NOT NULL,
  brand           VARCHAR(100),
  size            VARCHAR(20),
  color           VARCHAR(50),
  condition_grade ENUM('New','Like New','Good','Fair','Poor') NOT NULL DEFAULT 'Good',
  purchase_price  DECIMAL(10,2) CHECK (purchase_price >= 0),
  image_url       VARCHAR(500),
  tags            VARCHAR(255),
  status          ENUM('Available','Listed','Sold') NOT NULL DEFAULT 'Available',
  wear_count      INT NOT NULL DEFAULT 0 CHECK (wear_count >= 0),
  description     TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_item_user FOREIGN KEY (user_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_item_cat FOREIGN KEY (cat_id)
    REFERENCES Categories(cat_id) ON DELETE SET NULL,
  FULLTEXT INDEX ft_item_search (name, brand, description)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Indexes:**
```sql
CREATE INDEX idx_items_user_id ON Inventory_Items(user_id);
CREATE INDEX idx_items_cat_id  ON Inventory_Items(cat_id);
CREATE INDEX idx_items_status  ON Inventory_Items(status);
CREATE INDEX idx_items_color   ON Inventory_Items(color);
```

---

### `Wear_Log`

Records every time a user wears an item. Powers cost-per-wear analytics.

| Column | Type | Nullable | Default | Constraint | Notes |
|--------|------|----------|---------|------------|-------|
| log_id | INT | NO | AUTO_INCREMENT | PK | |
| item_id | INT | NO | — | FK → Inventory_Items.item_id ON DELETE CASCADE | |
| worn_on | DATE | NO | — | NOT NULL | Date worn |
| occasion | VARCHAR(100) | YES | NULL | | e.g. "College", "Party" |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | | |

```sql
CREATE TABLE Wear_Log (
  log_id     INT AUTO_INCREMENT PRIMARY KEY,
  item_id    INT NOT NULL,
  worn_on    DATE NOT NULL,
  occasion   VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wearlog_item FOREIGN KEY (item_id)
    REFERENCES Inventory_Items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Indexes:**
```sql
CREATE INDEX idx_wearlog_item_id ON Wear_Log(item_id);
CREATE INDEX idx_wearlog_worn_on ON Wear_Log(worn_on);
```

---

### `Outfits`

A named collection of items saved as a "Look."

| Column | Type | Nullable | Default | Constraint | Notes |
|--------|------|----------|---------|------------|-------|
| outfit_id | INT | NO | AUTO_INCREMENT | PK | |
| user_id | INT | NO | — | FK → Users.user_id ON DELETE CASCADE | |
| name | VARCHAR(200) | NO | — | NOT NULL | e.g. "Monday Fit" |
| occasion_tag | VARCHAR(100) | YES | NULL | | e.g. "Casual", "Formal" |
| description | TEXT | YES | NULL | | |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | | |

```sql
CREATE TABLE Outfits (
  outfit_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  name         VARCHAR(200) NOT NULL,
  occasion_tag VARCHAR(100),
  description  TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_outfit_user FOREIGN KEY (user_id)
    REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### `Outfit_Items` *(M:N Junction Table)*

Links outfits to items. One outfit has many items; one item can appear in many outfits.

| Column | Type | Nullable | Default | Constraint | Notes |
|--------|------|----------|---------|------------|-------|
| outfit_id | INT | NO | — | PK (composite), FK → Outfits | |
| item_id | INT | NO | — | PK (composite), FK → Inventory_Items | |
| position | TINYINT | YES | NULL | | Display order |

```sql
CREATE TABLE Outfit_Items (
  outfit_id INT NOT NULL,
  item_id   INT NOT NULL,
  position  TINYINT DEFAULT NULL,
  PRIMARY KEY (outfit_id, item_id),
  CONSTRAINT fk_oi_outfit FOREIGN KEY (outfit_id)
    REFERENCES Outfits(outfit_id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_item FOREIGN KEY (item_id)
    REFERENCES Inventory_Items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### `Transactions`

Records item sales and borrow exchanges between users.

| Column | Type | Nullable | Default | Constraint | Notes |
|--------|------|----------|---------|------------|-------|
| txn_id | INT | NO | AUTO_INCREMENT | PK | |
| item_id | INT | NO | — | FK → Inventory_Items.item_id | |
| seller_id | INT | NO | — | FK → Users.user_id | |
| buyer_id | INT | NO | — | FK → Users.user_id | |
| txn_type | ENUM('Sale','Borrow') | NO | — | NOT NULL | |
| amount | DECIMAL(10,2) | YES | NULL | CHECK (amount >= 0) | |
| status | ENUM('Pending','Completed','Cancelled') | NO | 'Pending' | | |
| txn_date | DATE | NO | — | NOT NULL | |
| notes | TEXT | YES | NULL | | |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | | |

```sql
CREATE TABLE Transactions (
  txn_id     INT AUTO_INCREMENT PRIMARY KEY,
  item_id    INT NOT NULL,
  seller_id  INT NOT NULL,
  buyer_id   INT NOT NULL,
  txn_type   ENUM('Sale','Borrow') NOT NULL,
  amount     DECIMAL(10,2) CHECK (amount >= 0),
  status     ENUM('Pending','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  txn_date   DATE NOT NULL,
  notes      TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_txn_item   FOREIGN KEY (item_id)   REFERENCES Inventory_Items(item_id),
  CONSTRAINT fk_txn_seller FOREIGN KEY (seller_id) REFERENCES Users(user_id),
  CONSTRAINT fk_txn_buyer  FOREIGN KEY (buyer_id)  REFERENCES Users(user_id),
  CONSTRAINT chk_diff_users CHECK (seller_id != buyer_id)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Indexes:**
```sql
CREATE INDEX idx_txn_item_id   ON Transactions(item_id);
CREATE INDEX idx_txn_seller_id ON Transactions(seller_id);
CREATE INDEX idx_txn_buyer_id  ON Transactions(buyer_id);
CREATE INDEX idx_txn_status    ON Transactions(status);
```

---

## Triggers

### `trg_wear_count_increment`

Automatically increments `wear_count` on `Inventory_Items` after each insert into `Wear_Log`.

```sql
DELIMITER $$

CREATE TRIGGER trg_wear_count_increment
AFTER INSERT ON Wear_Log
FOR EACH ROW
BEGIN
  UPDATE Inventory_Items
  SET    wear_count = wear_count + 1
  WHERE  item_id = NEW.item_id;
END$$

DELIMITER ;
```

> **Syllabus topic:** Triggers — automatic action on table events.

---

### `trg_update_item_status_on_sale`

Automatically marks an item as `'Sold'` when a Sale transaction is completed.

```sql
DELIMITER $$

CREATE TRIGGER trg_update_item_status_on_sale
AFTER UPDATE ON Transactions
FOR EACH ROW
BEGIN
  IF NEW.status = 'Completed' AND NEW.txn_type = 'Sale' THEN
    UPDATE Inventory_Items
    SET    status = 'Sold'
    WHERE  item_id = NEW.item_id;
  END IF;
END$$

DELIMITER ;
```

---

## Stored Procedure

### `sp_add_wear_entry`

Validates the item exists, then inserts a row into `Wear_Log`. The trigger then auto-increments `wear_count`.

```sql
DELIMITER $$

CREATE PROCEDURE sp_add_wear_entry (
  IN p_item_id  INT,
  IN p_worn_on  DATE,
  IN p_occasion VARCHAR(100)
)
BEGIN
  IF NOT EXISTS (SELECT 1 FROM Inventory_Items WHERE item_id = p_item_id) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Item not found';
  END IF;

  INSERT INTO Wear_Log (item_id, worn_on, occasion)
  VALUES (p_item_id, p_worn_on, p_occasion);
END$$

DELIMITER ;
```

**Usage (called from Next.js 16 Server Action via mysql2):**
```sql
CALL sp_add_wear_entry(3, '2025-04-12', 'College');
```

---

## View

### `v_cost_per_wear`

Calculates cost-per-wear for every item. Queried directly on the analytics page.

```sql
CREATE OR REPLACE VIEW v_cost_per_wear AS
SELECT
  ii.item_id,
  ii.user_id,
  ii.name,
  ii.brand,
  ii.purchase_price,
  ii.wear_count,
  ROUND(
    ii.purchase_price / NULLIF(ii.wear_count, 0),
    2
  ) AS cost_per_wear
FROM Inventory_Items ii
WHERE ii.purchase_price IS NOT NULL;
```

**Query example (analytics page):**
```sql
SELECT name, brand, wear_count, cost_per_wear
FROM   v_cost_per_wear
WHERE  user_id = ?
ORDER  BY cost_per_wear ASC;
```

---

## Key Query Patterns

### 1. Closet grid with filters

```sql
SELECT ii.*, c.name AS category_name
FROM   Inventory_Items ii
LEFT JOIN Categories c ON c.cat_id = ii.cat_id
WHERE  ii.user_id = ?
  AND  (? IS NULL OR ii.cat_id         = ?)
  AND  (? IS NULL OR ii.color           = ?)
  AND  (? IS NULL OR ii.size            = ?)
  AND  (? IS NULL OR ii.status          = ?)
ORDER  BY ii.created_at DESC;
```

### 2. FULLTEXT search

```sql
SELECT item_id, name, brand, image_url,
       MATCH(name, brand, description) AGAINST(? IN BOOLEAN MODE) AS relevance
FROM   Inventory_Items
WHERE  user_id = ?
  AND  MATCH(name, brand, description) AGAINST(? IN BOOLEAN MODE)
ORDER  BY relevance DESC;
```

### 3. Outfit with its items (M:N join)

```sql
SELECT ii.item_id, ii.name, ii.brand, ii.image_url, oi.position
FROM   Outfit_Items oi
JOIN   Inventory_Items ii ON ii.item_id = oi.item_id
WHERE  oi.outfit_id = ?
ORDER  BY oi.position;
```

### 4. Transaction history (multi-table JOIN)

```sql
SELECT t.txn_id, t.txn_type, t.status, t.amount, t.txn_date,
       ii.name AS item_name,
       s.username AS seller, b.username AS buyer
FROM   Transactions t
JOIN   Inventory_Items ii ON ii.item_id   = t.item_id
JOIN   Users           s  ON s.user_id    = t.seller_id
JOIN   Users           b  ON b.user_id    = t.buyer_id
WHERE  t.seller_id = ? OR t.buyer_id = ?
ORDER  BY t.created_at DESC;
```

### 5. Most-worn items (aggregation)

```sql
SELECT name, brand, wear_count,
       ROUND(purchase_price / NULLIF(wear_count, 0), 2) AS cost_per_wear
FROM   Inventory_Items
WHERE  user_id = ?
  AND  purchase_price IS NOT NULL
ORDER  BY wear_count DESC
LIMIT  5;
```

### 6. Items never worn (subquery)

```sql
SELECT item_id, name, brand, created_at
FROM   Inventory_Items
WHERE  user_id = ?
  AND  item_id NOT IN (SELECT DISTINCT item_id FROM Wear_Log)
ORDER  BY created_at DESC;
```

### 7. Atomic outfit creation (transaction)

```sql
START TRANSACTION;
  INSERT INTO Outfits (user_id, name, occasion_tag) VALUES (?, ?, ?);
  SET @oid = LAST_INSERT_ID();
  INSERT INTO Outfit_Items (outfit_id, item_id, position)
    VALUES (@oid, ?, 1), (@oid, ?, 2), (@oid, ?, 3);
COMMIT;
-- On error: ROLLBACK;
```

### 8. Atomic sale recording (transaction)

```sql
START TRANSACTION;
  INSERT INTO Transactions (item_id, seller_id, buyer_id, txn_type, amount, txn_date)
  VALUES (?, ?, ?, 'Sale', ?, CURDATE());
  UPDATE Inventory_Items SET status = 'Listed' WHERE item_id = ?;
COMMIT;
```

> **Syllabus topic:** ACID properties, `START TRANSACTION`, `COMMIT`, `ROLLBACK`.

---

## Normalization Notes

| Table | Normal Form | Justification |
|-------|-------------|---------------|
| Users | 3NF | All non-key columns depend only on PK; no transitive dependencies |
| Categories | 3NF | Self-referencing FK; no transitive dependency |
| Inventory_Items | 3NF | `cat_id` FK eliminates category name repetition |
| Wear_Log | 3NF | Each row is a single atomic wear event |
| Outfits | 3NF | No multi-valued or transitive attributes |
| Outfit_Items | BCNF | Composite PK; pure junction table with no non-key attributes |
| Transactions | 3NF | seller_id, buyer_id are FKs — no stored redundant names |

> `tags` in `Inventory_Items` is stored as a comma-separated `VARCHAR` for simplicity at college scale. In a fully normalized production schema this would be a separate `Tags` table (full 1NF).

---

## ER Summary

| Relationship | Type | Enforced By |
|---|---|---|
| Users → Inventory_Items | 1 : N | `user_id` FK in Inventory_Items |
| Categories → Inventory_Items | 1 : N | `cat_id` FK in Inventory_Items |
| Categories → Categories | Self-ref 1 : N | `parent_id` FK |
| Inventory_Items → Wear_Log | 1 : N | `item_id` FK in Wear_Log |
| Users → Outfits | 1 : N | `user_id` FK in Outfits |
| Outfits ↔ Inventory_Items | M : N | `Outfit_Items` junction table |
| Users → Transactions (seller) | 1 : N | `seller_id` FK |
| Users → Transactions (buyer) | 1 : N | `buyer_id` FK |
| Inventory_Items → Transactions | 1 : N | `item_id` FK |
