
# ThreadShare — Database Documentation

**Project:** Fashion Closet Management System
**Subject:** Database Management Systems (DBMS)
**Institution:** PDEU
**Database:** MySQL 8.0 · InnoDB · utf8mb4
**Prepared by:** ThreadShare Development Team
**Date:** April 2026

---

## 1. Project Overview

ThreadShare is a Pinterest-style personal wardrobe management system built as a college DBMS project. Users can catalogue their clothing inventory with photos, build and save named outfits, log every time they wear an item, and view cost-per-wear analytics to understand the true value of their wardrobe.

The platform also supports a peer-to-peer exchange layer where users can list items for sale or borrow, with full transaction tracking. The project is designed to demonstrate all key DBMS concepts — ER modelling, normalisation, SQL DDL/DML, joins, subqueries, aggregate functions, views, triggers, stored procedures, transactions, and indexing — in a realistic, full-stack application context.

**Core Features:**
- Clothing inventory management with image upload, tagging, and filtering
- Outfit builder (M:N relationship between items and outfits)
- Wear log with date and occasion tracking
- Cost-per-wear analytics via a database view
- Peer-to-peer sale and borrow transactions
- Role-based access (member / admin)
- FULLTEXT search across item name, brand, and description

---

## 2. Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Database | MySQL | 8.0 | InnoDB engine, utf8mb4 charset |
| ORM / Driver | mysql2 | 3.21.1 | Connection pool, promise API |
| Framework | Next.js | 16.2.3 | App Router, Server Actions |
| Runtime | Node.js | 22 LTS | Server-side execution |
| Auth | Auth.js | v5 beta | Session management, bcrypt |
| Password Hashing | bcryptjs | v3 | 12 salt rounds |
| Language | TypeScript | v6 | Full type safety |
| Styling | Tailwind CSS | v4 | Utility-first CSS |

---

## 3. Database Configuration

| Parameter | Value |
|---|---|
| Database Name | `threadshare` |
| Character Set | `utf8mb4` |
| Collation | `utf8mb4_unicode_ci` |
| Storage Engine | `InnoDB` |
| Host | `127.0.0.1` |
| Port | `3306` |
| Connection Strategy | mysql2 connection pool |
| Pool `connectionLimit` | `5` |

**Why InnoDB?** InnoDB is the only MySQL engine that supports foreign key constraints and ACID-compliant transactions. MyISAM does not support either, making InnoDB mandatory for a relational schema with referential integrity.

**Why utf8mb4?** Standard `utf8` in MySQL only supports 3-byte characters. `utf8mb4` supports the full Unicode range including 4-byte emoji characters, which is important for a fashion app where users may use emoji in item descriptions and tags.

**Why 127.0.0.1 instead of localhost?** On Windows, `localhost` resolves via a Unix socket which may not be available. Using `127.0.0.1` forces a TCP connection, which is consistent across platforms and required by the mysql2 driver in some environments.

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=threadshare
```

---

## 4. Entity-Relationship Overview

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
  ├──< Transactions (1:N as seller)
  └──< Transactions (1:N as buyer)
            │
            └── Inventory_Items (via item_id)

Categories (self-referencing hierarchy)
  └──< Inventory_Items (1:N via cat_id)
```

**Relationship Summary:**

| Relationship | Type | Description |
|---|---|---|
| Users → Inventory_Items | 1:N | A user owns many items |
| Users → Outfits | 1:N | A user creates many outfits |
| Users → Transactions (seller) | 1:N | A user sells many items |
| Users → Transactions (buyer) | 1:N | A user buys/borrows many items |
| Inventory_Items → Wear_Log | 1:N | An item has many wear log entries |
| Outfits ↔ Inventory_Items | M:N | Via Outfit_Items junction table |
| Categories → Categories | Self-ref | Parent/child category hierarchy |
| Categories → Inventory_Items | 1:N | A category classifies many items |
| Inventory_Items → Transactions | 1:N | An item can appear in many transactions |

---

## 5. Tables

The schema contains **7 tables**. Each is described below with its purpose, full column specification, CREATE TABLE SQL, and indexes.

---

### 5.1 Users

**Purpose:** Stores all registered users. Acts as the root entity — every item, outfit, and transaction is owned by or linked to a user.

**Column Specification:**

| Column | Data Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `user_id` | INT | NO | AUTO_INCREMENT | PRIMARY KEY | Surrogate key |
| `email` | VARCHAR(255) | NO | — | UNIQUE, NOT NULL | Login identifier |
| `username` | VARCHAR(50) | NO | — | UNIQUE, NOT NULL | Public handle |
| `password_hash` | VARCHAR(255) | NO | — | NOT NULL | bcrypt hash (12 rounds) |
| `display_name` | VARCHAR(100) | YES | NULL | — | Full name for display |
| `avatar_url` | VARCHAR(500) | YES | NULL | — | Profile picture URL |
| `location` | VARCHAR(100) | YES | NULL | — | City / region |
| `role` | ENUM('member','admin') | NO | 'member' | NOT NULL | Access control |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | Registration time |

**CREATE TABLE SQL:**

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

| Index Name | Column(s) | Type | Purpose |
|---|---|---|---|
| PRIMARY | `user_id` | B-Tree | PK lookup |
| `idx_users_email` | `email` | B-Tree | Fast login lookup |
| `idx_users_username` | `username` | B-Tree | Fast profile lookup |
| UNIQUE on `email` | `email` | B-Tree | Enforce uniqueness |
| UNIQUE on `username` | `username` | B-Tree | Enforce uniqueness |

---

### 5.2 Categories

**Purpose:** Stores clothing categories in a self-referencing hierarchy. Top-level categories (e.g. Tops, Bottoms) have `parent_id = NULL`. Subcategories (e.g. T-Shirts, Jeans) reference a parent via `parent_id`. This demonstrates a recursive/self-referencing foreign key — a key DBMS concept.

**Column Specification:**

| Column | Data Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `cat_id` | INT | NO | AUTO_INCREMENT | PRIMARY KEY | Surrogate key |
| `name` | VARCHAR(100) | NO | — | NOT NULL | Display name |
| `slug` | VARCHAR(100) | NO | — | UNIQUE, NOT NULL | URL-safe identifier |
| `parent_id` | INT | YES | NULL | FK → Categories(cat_id) ON DELETE SET NULL | NULL = top-level |

**CREATE TABLE SQL:**

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

**Seed Data (13 categories):**

| cat_id | name | slug | parent_id |
|---|---|---|---|
| 1 | Tops | tops | NULL |
| 2 | Bottoms | bottoms | NULL |
| 3 | Dresses | dresses | NULL |
| 4 | Outerwear | outerwear | NULL |
| 5 | Footwear | footwear | NULL |
| 6 | Accessories | accessories | NULL |
| 7 | Activewear | activewear | NULL |
| 8 | T-Shirts | t-shirts | 1 (Tops) |
| 9 | Shirts | shirts | 1 (Tops) |
| 10 | Jeans | jeans | 2 (Bottoms) |
| 11 | Trousers | trousers | 2 (Bottoms) |
| 12 | Sneakers | sneakers | 5 (Footwear) |
| 13 | Boots | boots | 5 (Footwear) |

---

### 5.3 Inventory_Items

**Purpose:** The core entity of the system. Every clothing item a user owns is stored here. Contains rich metadata (brand, size, color, condition, price), a FULLTEXT index for search, and a denormalised `wear_count` column that is kept in sync automatically by a trigger.

**Column Specification:**

| Column | Data Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `item_id` | INT | NO | AUTO_INCREMENT | PRIMARY KEY | Surrogate key |
| `user_id` | INT | NO | — | FK → Users ON DELETE CASCADE | Owner |
| `cat_id` | INT | YES | NULL | FK → Categories ON DELETE SET NULL | Category |
| `name` | VARCHAR(200) | NO | — | NOT NULL | Item name |
| `brand` | VARCHAR(100) | YES | NULL | — | Brand name |
| `size` | VARCHAR(20) | YES | NULL | — | e.g. S, M, L, 28, 42 |
| `color` | VARCHAR(50) | YES | NULL | — | Primary colour |
| `condition_grade` | ENUM('New','Like New','Good','Fair','Poor') | NO | 'Good' | NOT NULL | Physical condition |
| `purchase_price` | DECIMAL(10,2) | YES | NULL | CHECK(>= 0) | Original cost |
| `image_url` | VARCHAR(500) | YES | NULL | — | Photo URL |
| `tags` | VARCHAR(255) | YES | NULL | — | Comma-separated tags |
| `status` | ENUM('Available','Listed','Sold') | NO | 'Available' | NOT NULL | Listing status |
| `wear_count` | INT | NO | 0 | CHECK(>= 0) | Auto-maintained by trigger |
| `description` | TEXT | YES | NULL | — | Free-text notes |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last modified |

**CREATE TABLE SQL:**

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

| Index Name | Column(s) | Type | Purpose |
|---|---|---|---|
| PRIMARY | `item_id` | B-Tree | PK lookup |
| `idx_items_user_id` | `user_id` | B-Tree | Filter items by owner |
| `idx_items_cat_id` | `cat_id` | B-Tree | Filter by category |
| `idx_items_status` | `status` | B-Tree | Filter by listing status |
| `idx_items_color` | `color` | B-Tree | Filter by colour |
| `ft_item_search` | `name, brand, description` | FULLTEXT | Boolean mode search |

---

### 5.4 Wear_Log

**Purpose:** Records every instance a user wears an item. Each row is one wear event with a date and optional occasion label. This table powers the cost-per-wear analytics. An AFTER INSERT trigger on this table automatically increments `wear_count` in Inventory_Items.

**Column Specification:**

| Column | Data Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `log_id` | INT | NO | AUTO_INCREMENT | PRIMARY KEY | Surrogate key |
| `item_id` | INT | NO | — | FK → Inventory_Items ON DELETE CASCADE | Which item was worn |
| `worn_on` | DATE | NO | — | NOT NULL | Date of wear |
| `occasion` | VARCHAR(100) | YES | NULL | — | e.g. College, Work, Party |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | Log entry time |

**CREATE TABLE SQL:**

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

| Index Name | Column(s) | Type | Purpose |
|---|---|---|---|
| PRIMARY | `log_id` | B-Tree | PK lookup |
| `idx_wearlog_item_id` | `item_id` | B-Tree | Fetch all logs for an item |
| `idx_wearlog_worn_on` | `worn_on` | B-Tree | Date-range queries |

---

### 5.5 Outfits

**Purpose:** Stores named outfit collections created by users. An outfit is a "look" — a curated set of items saved together. The actual item-to-outfit mapping is stored in the Outfit_Items junction table.

**Column Specification:**

| Column | Data Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `outfit_id` | INT | NO | AUTO_INCREMENT | PRIMARY KEY | Surrogate key |
| `user_id` | INT | NO | — | FK → Users ON DELETE CASCADE | Creator |
| `name` | VARCHAR(200) | NO | — | NOT NULL | Outfit name |
| `occasion_tag` | VARCHAR(100) | YES | NULL | — | e.g. Casual, Work, Party |
| `description` | TEXT | YES | NULL | — | Optional notes |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | Creation time |

**CREATE TABLE SQL:**

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

### 5.6 Outfit_Items (M:N Junction Table)

**Purpose:** Resolves the many-to-many relationship between Outfits and Inventory_Items. One outfit contains many items; one item can appear in many outfits. The composite primary key `(outfit_id, item_id)` enforces uniqueness — the same item cannot be added to the same outfit twice. The optional `position` column allows ordered display.

**Column Specification:**

| Column | Data Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `outfit_id` | INT | NO | — | PK (composite), FK → Outfits ON DELETE CASCADE | Outfit reference |
| `item_id` | INT | NO | — | PK (composite), FK → Inventory_Items ON DELETE CASCADE | Item reference |
| `position` | TINYINT | YES | NULL | — | Display order within outfit |

**CREATE TABLE SQL:**

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

**Note on composite PK:** The composite primary key `(outfit_id, item_id)` serves a dual purpose — it enforces the uniqueness constraint (no duplicate item in an outfit) and also acts as an implicit index on `outfit_id`, making lookups like "get all items in outfit X" efficient without a separate index.

---

### 5.7 Transactions

**Purpose:** Records peer-to-peer exchanges between users — either a Sale (permanent transfer of ownership) or a Borrow (temporary loan). When a Sale transaction is marked Completed, a trigger automatically updates the item's status to 'Sold'. The `chk_diff_users` constraint prevents a user from transacting with themselves.

**Column Specification:**

| Column | Data Type | Nullable | Default | Constraints | Notes |
|---|---|---|---|---|---|
| `txn_id` | INT | NO | AUTO_INCREMENT | PRIMARY KEY | Surrogate key |
| `item_id` | INT | NO | — | FK → Inventory_Items | Item being exchanged |
| `seller_id` | INT | NO | — | FK → Users | Seller / lender |
| `buyer_id` | INT | NO | — | FK → Users | Buyer / borrower |
| `txn_type` | ENUM('Sale','Borrow') | NO | — | NOT NULL | Transaction type |
| `amount` | DECIMAL(10,2) | YES | NULL | CHECK(>= 0) | NULL for borrows |
| `status` | ENUM('Pending','Completed','Cancelled') | NO | 'Pending' | NOT NULL | Lifecycle state |
| `txn_date` | DATE | NO | — | NOT NULL | Transaction date |
| `notes` | TEXT | YES | NULL | — | Optional remarks |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | NOT NULL | Record creation time |

**Table-level Constraints:**
- `chk_diff_users`: `CHECK (seller_id != buyer_id)` — prevents self-transactions

**CREATE TABLE SQL:**

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

| Index Name | Column(s) | Type | Purpose |
|---|---|---|---|
| PRIMARY | `txn_id` | B-Tree | PK lookup |
| `idx_txn_item_id` | `item_id` | B-Tree | Find transactions for an item |
| `idx_txn_seller_id` | `seller_id` | B-Tree | Find all sales by a user |
| `idx_txn_buyer_id` | `buyer_id` | B-Tree | Find all purchases by a user |
| `idx_txn_status` | `status` | B-Tree | Filter by transaction status |

---

## 6. Enumerations

MySQL ENUM columns restrict a column to a predefined set of string values, enforced at the storage engine level. ThreadShare uses five ENUM types across three tables.

| Table | Column | Allowed Values | Default | Purpose |
|---|---|---|---|---|
| `Inventory_Items` | `condition_grade` | `'New'`, `'Like New'`, `'Good'`, `'Fair'`, `'Poor'` | `'Good'` | Physical condition of the item |
| `Inventory_Items` | `status` | `'Available'`, `'Listed'`, `'Sold'` | `'Available'` | Listing/sale lifecycle state |
| `Transactions` | `txn_type` | `'Sale'`, `'Borrow'` | — | Type of exchange |
| `Transactions` | `status` | `'Pending'`, `'Completed'`, `'Cancelled'` | `'Pending'` | Transaction lifecycle state |
| `Users` | `role` | `'member'`, `'admin'` | `'member'` | Access control level |

**Why ENUM over a lookup table?** For a college project with a small, fixed set of values that will not change, ENUM provides simpler queries, storage efficiency (stored as integers internally), and built-in constraint enforcement without requiring a JOIN to a lookup table.

---

## 7. Triggers

Triggers are stored programs that execute automatically in response to INSERT, UPDATE, or DELETE events on a table. ThreadShare uses two triggers to maintain data consistency without requiring application-level logic.

---

### 7.1 trg_wear_count_increment

**Event:** `AFTER INSERT ON Wear_Log`
**Purpose:** Automatically increments `wear_count` in `Inventory_Items` whenever a new wear log entry is inserted. This keeps the denormalised `wear_count` column in sync without requiring the application to issue a separate UPDATE query.

**Syllabus Topic:** Triggers — automatic action on table events; denormalisation with trigger-maintained consistency.

```sql
DELIMITER $

CREATE TRIGGER trg_wear_count_increment
AFTER INSERT ON Wear_Log
FOR EACH ROW
BEGIN
  UPDATE Inventory_Items
  SET    wear_count = wear_count + 1
  WHERE  item_id = NEW.item_id;
END$

DELIMITER ;
```

**How it works:**
1. Application (or stored procedure) inserts a row into `Wear_Log`
2. MySQL fires `trg_wear_count_increment` automatically
3. `NEW.item_id` refers to the `item_id` of the just-inserted row
4. The corresponding `Inventory_Items` row has its `wear_count` incremented by 1
5. No application code needs to handle this update

---

### 7.2 trg_update_item_status_on_sale

**Event:** `AFTER UPDATE ON Transactions`
**Condition:** `NEW.status = 'Completed' AND NEW.txn_type = 'Sale'`
**Purpose:** Automatically marks an item as `'Sold'` in `Inventory_Items` when a Sale transaction is completed. This ensures the item's availability status is always consistent with its transaction history.

**Syllabus Topic:** Triggers with conditional logic (IF statement); cross-table consistency enforcement.

```sql
DELIMITER $

CREATE TRIGGER trg_update_item_status_on_sale
AFTER UPDATE ON Transactions
FOR EACH ROW
BEGIN
  IF NEW.status = 'Completed' AND NEW.txn_type = 'Sale' THEN
    UPDATE Inventory_Items
    SET    status = 'Sold'
    WHERE  item_id = NEW.item_id;
  END IF;
END$

DELIMITER ;
```

**How it works:**
1. Application updates a transaction's status to `'Completed'`
2. MySQL fires `trg_update_item_status_on_sale` automatically
3. The IF condition checks both `status` and `txn_type` — only Sale completions trigger the item update
4. The item's `status` is set to `'Sold'`, preventing it from appearing as available
5. Borrow completions do not affect item status (item returns to owner)

**Seed data demonstration:** Transaction 1 in `seed.sql` (alice sells denim jacket to bob, status = 'Completed') fires this trigger, setting item 7 (Denim Jacket) to `status = 'Sold'`.

---

## 8. Stored Procedure

Stored procedures are precompiled SQL routines stored in the database. They encapsulate business logic, reduce network round-trips, and allow input validation before data modification.

---

### sp_add_wear_entry

**Purpose:** Validates that an item exists before inserting a wear log entry. Provides a clean, validated interface for the application to log wear events. The INSERT it performs automatically fires `trg_wear_count_increment`.

**Parameters:**

| Parameter | Direction | Type | Description |
|---|---|---|---|
| `p_item_id` | IN | INT | ID of the item being worn |
| `p_worn_on` | IN | DATE | Date the item was worn |
| `p_occasion` | IN | VARCHAR(100) | Optional occasion label |

**Called from:** Next.js Server Action via:
```typescript
await pool.execute('CALL sp_add_wear_entry(?, CURDATE(), ?)', [itemId, occasion]);
```

**Full SQL:**

```sql
DELIMITER $

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
END$

DELIMITER ;
```

**Logic walkthrough:**
1. Check if the item exists using `SELECT 1 ... IF NOT EXISTS`
2. If not found, raise a custom error using `SIGNAL SQLSTATE '45000'` — this causes the procedure to abort and the error propagates to the application
3. If found, insert the wear log entry
4. The INSERT fires `trg_wear_count_increment` automatically, incrementing `wear_count`

**Why SIGNAL SQLSTATE '45000'?** `45000` is the MySQL convention for user-defined exceptions. It causes the procedure to raise an error that the application can catch and handle gracefully (e.g. return a 404 response).

---

## 9. View

A view is a stored SELECT query that behaves like a virtual table. It simplifies complex queries, provides a stable interface for the application, and can encapsulate business logic (like the cost-per-wear formula).

---

### v_cost_per_wear

**Purpose:** Calculates the cost-per-wear metric for every item that has a recorded purchase price. Cost-per-wear = purchase_price / wear_count. `NULLIF(wear_count, 0)` prevents division-by-zero — items never worn return `NULL` for cost_per_wear rather than an error.

**Used on:** `/analytics` page via the `CostPerWearTable` component.

**Columns Returned:**

| Column | Source | Description |
|---|---|---|
| `item_id` | `Inventory_Items.item_id` | Item identifier |
| `user_id` | `Inventory_Items.user_id` | Owner identifier |
| `name` | `Inventory_Items.name` | Item name |
| `brand` | `Inventory_Items.brand` | Brand name |
| `purchase_price` | `Inventory_Items.purchase_price` | Original cost |
| `wear_count` | `Inventory_Items.wear_count` | Total times worn |
| `cost_per_wear` | Computed | `ROUND(purchase_price / NULLIF(wear_count, 0), 2)` |

**Full SQL:**

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

**Example query (used in analytics page):**

```sql
SELECT name, brand, wear_count, cost_per_wear
FROM   v_cost_per_wear
WHERE  user_id = ?
ORDER  BY cost_per_wear ASC;
```

Ordering by `cost_per_wear ASC` surfaces the best-value items (lowest cost per wear) at the top. Items with `wear_count = 0` return `NULL` for `cost_per_wear` and sort to the bottom in MySQL's default NULL ordering.

---

## 10. Indexes Summary

| Index Name | Table | Column(s) | Type | Purpose |
|---|---|---|---|---|
| PRIMARY | Users | `user_id` | B-Tree | PK lookup |
| `idx_users_email` | Users | `email` | B-Tree | Login authentication lookup |
| `idx_users_username` | Users | `username` | B-Tree | Profile page lookup |
| PRIMARY | Categories | `cat_id` | B-Tree | PK lookup |
| UNIQUE on `slug` | Categories | `slug` | B-Tree | URL slug uniqueness |
| PRIMARY | Inventory_Items | `item_id` | B-Tree | PK lookup |
| `idx_items_user_id` | Inventory_Items | `user_id` | B-Tree | Closet grid — filter by owner |
| `idx_items_cat_id` | Inventory_Items | `cat_id` | B-Tree | Filter by category |
| `idx_items_status` | Inventory_Items | `status` | B-Tree | Filter available/listed/sold |
| `idx_items_color` | Inventory_Items | `color` | B-Tree | Filter by colour |
| `ft_item_search` | Inventory_Items | `name, brand, description` | FULLTEXT | Boolean mode text search |
| PRIMARY | Wear_Log | `log_id` | B-Tree | PK lookup |
| `idx_wearlog_item_id` | Wear_Log | `item_id` | B-Tree | Fetch wear history for an item |
| `idx_wearlog_worn_on` | Wear_Log | `worn_on` | B-Tree | Date-range wear queries |
| PRIMARY | Outfits | `outfit_id` | B-Tree | PK lookup |
| PRIMARY | Outfit_Items | `(outfit_id, item_id)` | B-Tree | Composite PK + outfit lookup |
| PRIMARY | Transactions | `txn_id` | B-Tree | PK lookup |
| `idx_txn_item_id` | Transactions | `item_id` | B-Tree | Find transactions for an item |
| `idx_txn_seller_id` | Transactions | `seller_id` | B-Tree | Seller transaction history |
| `idx_txn_buyer_id` | Transactions | `buyer_id` | B-Tree | Buyer transaction history |
| `idx_txn_status` | Transactions | `status` | B-Tree | Filter by transaction status |

**Total indexes: 20** (including PKs and UNIQUE constraints)

---

## 11. Key SQL Queries

All queries are from `database/queries.sql`. Each demonstrates a specific DBMS concept.

---

### Query 1 — FULLTEXT Search

**DBMS Topic:** FULLTEXT Index, Boolean Mode Search

```sql
SELECT item_id, name, brand, image_url,
       MATCH(name, brand, description) AGAINST('vintage denim' IN BOOLEAN MODE) AS relevance
FROM   Inventory_Items
WHERE  user_id = 1
  AND  MATCH(name, brand, description) AGAINST('vintage denim' IN BOOLEAN MODE)
ORDER  BY relevance DESC;
```

**Explanation:** Uses the `ft_item_search` FULLTEXT index to search across three columns simultaneously. `IN BOOLEAN MODE` allows operators like `+` (must include), `-` (must exclude), and `*` (wildcard). The `MATCH ... AGAINST` expression in the SELECT clause returns a relevance score, enabling results to be ranked by relevance. This is far more efficient than `LIKE '%vintage%'` which cannot use any index.

---

### Query 2 — Subquery (NOT IN)

**DBMS Topic:** Subquery, Set Membership

```sql
SELECT item_id, name, brand, created_at
FROM   Inventory_Items
WHERE  user_id = 1
  AND  item_id NOT IN (SELECT DISTINCT item_id FROM Wear_Log)
ORDER  BY created_at DESC;
```

**Explanation:** The inner subquery `SELECT DISTINCT item_id FROM Wear_Log` returns the set of all item IDs that have at least one wear log entry. The outer query uses `NOT IN` to find items that have never been worn. This is a correlated-style subquery demonstrating set difference. Useful for the "unworn items" feature on the analytics page.

---

### Query 3 — Aggregate Functions + ORDER BY

**DBMS Topic:** Aggregate Functions, Computed Columns, LIMIT

```sql
SELECT name, brand, wear_count,
       ROUND(purchase_price / NULLIF(wear_count, 0), 2) AS cost_per_wear
FROM   Inventory_Items
WHERE  user_id = 1
  AND  purchase_price IS NOT NULL
ORDER  BY wear_count DESC
LIMIT  5;
```

**Explanation:** Demonstrates computed columns using arithmetic expressions and `NULLIF` to handle division-by-zero. `ROUND(..., 2)` formats the result to 2 decimal places. `ORDER BY wear_count DESC LIMIT 5` returns the top 5 most-worn items. This is the inline version of the logic encapsulated in the `v_cost_per_wear` view.

---

### Query 4 — View Query

**DBMS Topic:** Views, Abstraction Layer

```sql
SELECT name, brand, purchase_price, wear_count, cost_per_wear
FROM   v_cost_per_wear
WHERE  user_id = 1
ORDER  BY cost_per_wear ASC;
```

**Explanation:** Queries the `v_cost_per_wear` view as if it were a regular table. The view abstracts the `ROUND(purchase_price / NULLIF(wear_count, 0), 2)` formula, making the application query simple and readable. The application does not need to know the underlying formula — it just queries the view. This demonstrates the abstraction and reusability benefits of views.

---

### Query 5 — Trigger Demonstration

**DBMS Topic:** Triggers, Automatic Side Effects

```sql
-- Before: check current wear_count
SELECT wear_count FROM Inventory_Items WHERE item_id = 1;

-- Insert into Wear_Log — trg_wear_count_increment fires automatically
INSERT INTO Wear_Log (item_id, worn_on, occasion) VALUES (1, CURDATE(), 'College');

-- After: wear_count should be incremented by 1
SELECT wear_count FROM Inventory_Items WHERE item_id = 1;
```

**Explanation:** Demonstrates that inserting into `Wear_Log` automatically triggers `trg_wear_count_increment`, which increments `wear_count` in `Inventory_Items`. The application does not issue any UPDATE — the trigger handles it. Running the before/after SELECTs in a viva demonstrates the trigger firing in real time.

---

### Query 6 — Stored Procedure Call

**DBMS Topic:** Stored Procedures, Encapsulated Business Logic

```sql
CALL sp_add_wear_entry(1, '2026-04-12', 'Party');
```

**Explanation:** Calls the stored procedure with item ID 1, a specific date, and occasion. The procedure validates the item exists (raises an error if not), then inserts into `Wear_Log`, which fires the trigger. This demonstrates the full chain: `CALL` → procedure validation → `INSERT` → trigger → `UPDATE`. The `CALL` syntax is used from both MySQL Workbench and the Next.js application.

---

### Query 7 — Transaction with ROLLBACK

**DBMS Topic:** ACID Transactions, Atomicity, ROLLBACK

```sql
START TRANSACTION;
  INSERT INTO Outfits (user_id, name, occasion_tag) VALUES (1, 'Monday Fit', 'Casual');
  SET @oid = LAST_INSERT_ID();
  INSERT INTO Outfit_Items (outfit_id, item_id, position)
    VALUES (@oid, 1, 1), (@oid, 2, 2), (@oid, 3, 3);
COMMIT;
-- On error: ROLLBACK;
```

**Explanation:** Demonstrates atomicity — the outfit and all its items are inserted as a single atomic unit. `LAST_INSERT_ID()` captures the auto-generated `outfit_id` from the first INSERT. If any INSERT fails (e.g. an item_id doesn't exist), `ROLLBACK` undoes all changes, leaving the database in a consistent state. Without a transaction, a partial failure would leave an orphaned outfit with no items.

---

### Query 8 — Multi-table JOIN

**DBMS Topic:** INNER JOIN, Multiple Table Joins, Table Aliases

```sql
SELECT t.txn_id, t.txn_type, t.status, t.amount, t.txn_date,
       ii.name AS item_name,
       s.username AS seller, b.username AS buyer
FROM   Transactions t
JOIN   Inventory_Items ii ON ii.item_id   = t.item_id
JOIN   Users           s  ON s.user_id    = t.seller_id
JOIN   Users           b  ON b.user_id    = t.buyer_id
WHERE  t.seller_id = 1 OR t.buyer_id = 1
ORDER  BY t.created_at DESC;
```

**Explanation:** Joins four tables — `Transactions`, `Inventory_Items`, and `Users` twice (aliased as `s` for seller and `b` for buyer). Joining `Users` twice with different aliases is a key technique for self-referencing relationships. The WHERE clause uses OR to fetch all transactions where the user is either the seller or the buyer. This powers the transaction history page.

---

### Query 9 — LEFT JOIN with Filters

**DBMS Topic:** LEFT JOIN, Outer Joins, NULL handling

```sql
SELECT ii.*, c.name AS category_name
FROM   Inventory_Items ii
LEFT JOIN Categories c ON c.cat_id = ii.cat_id
WHERE  ii.user_id = 1
ORDER  BY ii.created_at DESC;
```

**Explanation:** Uses LEFT JOIN so that items with `cat_id = NULL` (uncategorised items) are still returned — they just have `category_name = NULL`. An INNER JOIN would exclude uncategorised items entirely. This is the query behind the closet grid, where every item must appear regardless of whether it has a category assigned.

---

### Query 10 — Self-Referencing Foreign Key

**DBMS Topic:** Self-Referencing FK, Recursive Relationships, Hierarchical Data

```sql
SELECT child.cat_id, child.name, child.slug, parent.name AS parent_name
FROM   Categories child
LEFT JOIN Categories parent ON parent.cat_id = child.parent_id
ORDER  BY parent.name, child.name;
```

**Explanation:** Joins the `Categories` table to itself — `child` is the alias for subcategories, `parent` is the alias for their parent categories. `LEFT JOIN` ensures top-level categories (where `parent_id = NULL`) are also returned with `parent_name = NULL`. This demonstrates how a single table with a self-referencing FK can represent a tree hierarchy. Used to populate the category dropdown in the add/edit item form.

---

### Query 11 — M:N JOIN (Outfit Items)

**DBMS Topic:** Many-to-Many Relationships, Junction Table, Multi-table JOIN

```sql
SELECT o.name AS outfit_name, ii.name AS item_name, ii.brand, oi.position
FROM   Outfit_Items oi
JOIN   Outfits o ON o.outfit_id = oi.outfit_id
JOIN   Inventory_Items ii ON ii.item_id = oi.item_id
WHERE  o.outfit_id = 1
ORDER  BY oi.position;
```

**Explanation:** Demonstrates resolving a many-to-many relationship through the `Outfit_Items` junction table. The query starts from the junction table and joins both sides — `Outfits` and `Inventory_Items`. `ORDER BY oi.position` returns items in the user-defined display order. This is the query used to render an outfit detail page showing all items in the look.

---

## 12. Normalization Analysis

Normalization is the process of organizing a relational database to reduce data redundancy and improve data integrity. ThreadShare's schema is designed to satisfy 3NF for all tables.

| Table | Normal Form | Key Dependencies | Justification |
|---|---|---|---|
| Users | 3NF | `user_id` → all columns | All non-key attributes depend solely on `user_id`. No partial or transitive dependencies. |
| Categories | 3NF | `cat_id` → name, slug, parent_id | All attributes depend on `cat_id`. `parent_id` is a FK reference, not a transitive dependency. |
| Inventory_Items | 3NF* | `item_id` → all columns | All attributes depend on `item_id`. `wear_count` is denormalised (see note below). |
| Wear_Log | 3NF | `log_id` → item_id, worn_on, occasion | All attributes depend on `log_id`. No partial or transitive dependencies. |
| Outfits | 3NF | `outfit_id` → user_id, name, occasion_tag, description | All attributes depend on `outfit_id`. |
| Outfit_Items | 3NF | `(outfit_id, item_id)` → position | `position` depends on the full composite key, not just one part. Satisfies 2NF and 3NF. |
| Transactions | 3NF | `txn_id` → all columns | All attributes depend on `txn_id`. Seller/buyer are separate FK references, not transitive. |

**1NF (First Normal Form):** All tables satisfy 1NF — every column contains atomic values, each row is unique (via PK), and there are no repeating groups.

**2NF (Second Normal Form):** All tables satisfy 2NF — there are no partial dependencies. The only composite PK is `Outfit_Items(outfit_id, item_id)`, and the only non-key attribute `position` depends on the full composite key, not just one part.

**3NF (Third Normal Form):** All tables satisfy 3NF — there are no transitive dependencies. Every non-key attribute depends directly on the primary key, not on another non-key attribute.

**BCNF:** All tables satisfy BCNF since every determinant is a candidate key.

**Known 1NF Deviation — `tags` column:**
The `tags` column in `Inventory_Items` stores comma-separated values (e.g. `'vintage,summer,casual'`) in a single VARCHAR column. This technically violates 1NF (non-atomic values). The fully normalised solution would be a separate `Item_Tags` table with a FK to `Inventory_Items`. This deviation is intentional for college project scope — it simplifies the implementation while still demonstrating the concept. In a production system, a proper tags table would be used.

---

## 13. Referential Integrity

All foreign key constraints are enforced by InnoDB. The ON DELETE actions determine what happens to child rows when a parent row is deleted.

| Constraint Name | Child Table | Child Column | Parent Table | Parent Column | ON DELETE |
|---|---|---|---|---|---|
| `fk_cat_parent` | Categories | `parent_id` | Categories | `cat_id` | SET NULL |
| `fk_item_user` | Inventory_Items | `user_id` | Users | `user_id` | CASCADE |
| `fk_item_cat` | Inventory_Items | `cat_id` | Categories | `cat_id` | SET NULL |
| `fk_wearlog_item` | Wear_Log | `item_id` | Inventory_Items | `item_id` | CASCADE |
| `fk_outfit_user` | Outfits | `user_id` | Users | `user_id` | CASCADE |
| `fk_oi_outfit` | Outfit_Items | `outfit_id` | Outfits | `outfit_id` | CASCADE |
| `fk_oi_item` | Outfit_Items | `item_id` | Inventory_Items | `item_id` | CASCADE |
| `fk_txn_item` | Transactions | `item_id` | Inventory_Items | `item_id` | RESTRICT (default) |
| `fk_txn_seller` | Transactions | `seller_id` | Users | `user_id` | RESTRICT (default) |
| `fk_txn_buyer` | Transactions | `buyer_id` | Users | `user_id` | RESTRICT (default) |

**ON DELETE behaviour explained:**

- **CASCADE:** Deleting a parent automatically deletes all child rows. Used for user-owned data (items, outfits, wear logs) — deleting a user account removes all their data.
- **SET NULL:** Deleting a parent sets the FK column to NULL in child rows. Used for categories — deleting a category does not delete the items in it; they become uncategorised.
- **RESTRICT (default):** Prevents deletion of a parent if child rows exist. Used for transactions — you cannot delete an item or user that has transaction records, preserving financial history.

---

## 14. ACID Properties Demonstration

ACID is a set of properties that guarantee database transactions are processed reliably. InnoDB (MySQL's default engine) is fully ACID-compliant. ThreadShare demonstrates all four properties.

---

### Atomicity

**Definition:** A transaction is treated as a single unit — either all operations succeed, or none do.

**Demonstration 1 — Outfit Creation:**
```sql
START TRANSACTION;
  INSERT INTO Outfits (user_id, name, occasion_tag) VALUES (1, 'Monday Fit', 'Casual');
  SET @oid = LAST_INSERT_ID();
  INSERT INTO Outfit_Items (outfit_id, item_id, position)
    VALUES (@oid, 1, 1), (@oid, 2, 2), (@oid, 3, 3);
COMMIT;
-- If any INSERT fails:
ROLLBACK;
```
If the `Outfit_Items` INSERT fails (e.g. invalid item_id), the `ROLLBACK` undoes the `Outfits` INSERT too. The database never contains an outfit with no items.

**Demonstration 2 — Transaction Recording:**
```sql
START TRANSACTION;
  INSERT INTO Transactions (item_id, seller_id, buyer_id, txn_type, amount, status, txn_date)
    VALUES (7, 1, 2, 'Sale', 2500.00, 'Pending', CURDATE());
  UPDATE Inventory_Items SET status = 'Listed' WHERE item_id = 7;
COMMIT;
```
Both the transaction record and the item status update succeed together or fail together.

---

### Consistency

**Definition:** A transaction brings the database from one valid state to another, respecting all defined rules and constraints.

**Demonstrated by:**

| Constraint | Type | Rule Enforced |
|---|---|---|
| `purchase_price >= 0` | CHECK | Prices cannot be negative |
| `wear_count >= 0` | CHECK | Wear count cannot go below zero |
| `amount >= 0` | CHECK | Transaction amounts cannot be negative |
| `seller_id != buyer_id` | CHECK | A user cannot transact with themselves |
| `condition_grade` ENUM | ENUM | Only valid condition values accepted |
| `status` ENUM | ENUM | Only valid status transitions accepted |
| `NOT NULL` on key columns | NOT NULL | Required fields cannot be omitted |
| Foreign Keys | FK | References must point to existing rows |

Any INSERT or UPDATE that violates these constraints is rejected by MySQL, keeping the database in a consistent state.

---

### Isolation

**Definition:** Concurrent transactions execute as if they were serial — intermediate states of a transaction are not visible to other transactions.

**Demonstrated by:** InnoDB uses **REPEATABLE READ** as its default isolation level. This means:
- A transaction sees a consistent snapshot of the data as it was at the start of the transaction
- Dirty reads (reading uncommitted data from another transaction) are prevented
- Non-repeatable reads are prevented — the same SELECT within a transaction returns the same result

In ThreadShare, this is relevant when two users simultaneously attempt to purchase the same item — InnoDB's row-level locking ensures only one transaction can update the item's status at a time.

---

### Durability

**Definition:** Once a transaction is committed, it remains committed even in the event of a system failure.

**Demonstrated by:** InnoDB implements durability through:
- **Write-Ahead Logging (WAL):** All changes are written to the redo log before being applied to data files
- **Redo Logs:** InnoDB maintains redo logs (`ib_logfile0`, `ib_logfile1`) that allow recovery of committed transactions after a crash
- **Doublewrite Buffer:** Protects against partial page writes during a crash

When `COMMIT` returns successfully in ThreadShare, the transaction is guaranteed to be durable regardless of subsequent system failures.

---

## 15. Data Flow Diagrams

### 15.1 Log Wear Flow

```
User clicks "Log Wear" button on item detail page
        │
        ▼
LogWearForm submits (item_id, occasion)
        │
        ▼
Next.js Server Action: logWear(formData)
        │
        ▼
auth() — verify active session, extract user_id
        │
        ▼
pool.execute('CALL sp_add_wear_entry(?, CURDATE(), ?)', [item_id, occasion])
        │
        ▼
MySQL: sp_add_wear_entry executes
        │
        ├── IF NOT EXISTS → SIGNAL SQLSTATE '45000' → Error returned to app
        │
        └── INSERT INTO Wear_Log (item_id, worn_on, occasion)
                    │
                    ▼
            trg_wear_count_increment fires (AFTER INSERT)
                    │
                    ▼
            UPDATE Inventory_Items SET wear_count = wear_count + 1
                    │
                    ▼
        revalidatePath('/closet/[itemId]')
                    │
                    ▼
        Page re-renders with updated wear_count
```

---

### 15.2 Complete Sale Flow

```
User clicks "Mark Complete" on a Pending Sale transaction
        │
        ▼
Next.js Server Action: updateTransactionStatus(txnId, 'Completed')
        │
        ▼
auth() — verify session, check seller_id matches current user
        │
        ▼
pool.execute(
  'UPDATE Transactions SET status = ? WHERE txn_id = ?',
  ['Completed', txnId]
)
        │
        ▼
MySQL: Transactions row updated
        │
        ▼
trg_update_item_status_on_sale fires (AFTER UPDATE)
        │
        ├── IF NEW.status = 'Completed' AND NEW.txn_type = 'Sale'
        │         │
        │         ▼
        │   UPDATE Inventory_Items SET status = 'Sold'
        │   WHERE item_id = NEW.item_id
        │
        └── (Borrow completions: IF condition false, no item update)
                    │
                    ▼
        revalidatePath('/transactions')
                    │
                    ▼
        Page re-renders — item shows as Sold, transaction shows Completed
```

---

### 15.3 Create Outfit Flow

```
User selects items + enters outfit name on /outfits/new
        │
        ▼
CreateOutfitForm submits (name, occasion_tag, item_ids[])
        │
        ▼
Next.js Server Action: createOutfit(formData)
        │
        ▼
auth() — verify session, extract user_id
        │
        ▼
BEGIN TRANSACTION (pool.getConnection → connection.beginTransaction())
        │
        ▼
INSERT INTO Outfits (user_id, name, occasion_tag)
VALUES (userId, name, occasionTag)
        │
        ▼
outfitId = LAST_INSERT_ID()
        │
        ▼
For each selected item_id:
  INSERT INTO Outfit_Items (outfit_id, item_id, position)
  VALUES (outfitId, itemId, position)
        │
        ▼
All inserts successful?
  ├── YES → COMMIT → redirect('/outfits')
  └── NO  → ROLLBACK → return error to form
```

---

## 16. Seed Data Summary

The `database/seed.sql` file populates the database with realistic demo data for development, testing, and viva demonstrations.

| Entity | Count | Details |
|---|---|---|
| Users | 5 | alice, bob, charlie, diana, eve — all with password `password123` |
| Categories | 13 | 7 top-level + 6 subcategories |
| Inventory Items | 32 | 14 for alice, 10 for bob, 8 for charlie — with Unsplash photos |
| Wear Log Entries | 22 | Entries for alice's items (item_ids 1–14) |
| Outfits | 5 | All created by alice |
| Outfit Items | 15 | Items assigned across 5 outfits |
| Transactions | 5 | Mix of Sale/Borrow, all three statuses |

**Users:**

| user_id | username | email | location | Password |
|---|---|---|---|---|
| 1 | alice | alice@example.com | Mumbai | password123 |
| 2 | bob | bob@example.com | Delhi | password123 |
| 3 | charlie | charlie@example.com | Bangalore | password123 |
| 4 | diana | diana@example.com | Ahmedabad | password123 |
| 5 | eve | eve@example.com | Pune | password123 |

**Transactions (for trigger/viva demonstration):**

| txn_id | Type | Seller | Buyer | Item | Amount | Status | Trigger Effect |
|---|---|---|---|---|---|---|---|
| 1 | Sale | alice | bob | Denim Jacket | ₹2,500 | Completed | Item 7 → status='Sold' |
| 2 | Borrow | bob | charlie | Chelsea Boots | NULL | Pending | No item status change |
| 3 | Sale | charlie | alice | Jordan 1 Retro | ₹9,999 | Pending | No item status change |
| 4 | Borrow | bob | alice | Polo Shirt | NULL | Completed | No item status change (Borrow) |
| 5 | Sale | bob | diana | Leather Jacket | ₹7,000 | Cancelled | No item status change |

**Wear Log (alice's items — demonstrates trigger and analytics):**

Items 1, 2, 3, 4, 5, 7, 8, 9, 13, 14 have wear log entries. After seed.sql runs, `wear_count` values in `Inventory_Items` reflect the trigger having fired for each entry:
- Item 1 (Classic White Tee): 3 wears
- Item 4 (Slim Fit Jeans): 4 wears
- Item 9 (White Sneakers): 3 wears
- Item 3 (Oxford Button-Down): 3 wears

---

## 17. Syllabus Coverage Checklist

| Topic | Implementation | File / Location |
|---|---|---|
| ER Model | 7-entity ER diagram with 1:N, M:N, self-ref relationships | Section 4 of this document |
| Relational Model | All entities converted to normalised tables with PKs/FKs | `database/schema.sql` |
| Primary Keys | AUTO_INCREMENT PKs on all 7 tables | `schema.sql` — all CREATE TABLE |
| Foreign Keys | 10 FK constraints with CASCADE / SET NULL / RESTRICT | `schema.sql` — all CREATE TABLE |
| SQL DDL | CREATE DATABASE, CREATE TABLE, CREATE INDEX, CREATE VIEW, CREATE TRIGGER, CREATE PROCEDURE | `database/schema.sql` |
| SQL DML | INSERT, SELECT, UPDATE, DELETE across all tables | `database/seed.sql`, `database/queries.sql` |
| INNER JOIN | Multi-table join for transaction history | `queries.sql` — Query 8 |
| LEFT JOIN | Closet grid with optional category | `queries.sql` — Query 9 |
| Self-JOIN | Categories parent/child hierarchy | `queries.sql` — Query 10 |
| Aggregate Functions | ROUND(), COUNT(), SUM() via view and queries | `queries.sql` — Query 3, `schema.sql` — view |
| Subqueries | NOT IN subquery for unworn items | `queries.sql` — Query 2 |
| GROUP BY | Implicit in aggregate queries | `queries.sql` — Query 3 |
| FULLTEXT Index | `ft_item_search` on name, brand, description | `schema.sql`, `queries.sql` — Query 1 |
| Views | `v_cost_per_wear` — cost-per-wear analytics | `schema.sql`, `queries.sql` — Query 4 |
| Triggers | `trg_wear_count_increment`, `trg_update_item_status_on_sale` | `schema.sql`, `queries.sql` — Queries 5, 6 |
| Stored Procedures | `sp_add_wear_entry` with SIGNAL error handling | `schema.sql`, `queries.sql` — Query 6 |
| Normalization 1NF | Atomic values, unique rows, no repeating groups | Section 12 |
| Normalization 2NF | No partial dependencies (composite PK in Outfit_Items) | Section 12 |
| Normalization 3NF | No transitive dependencies in any table | Section 12 |
| Transactions (ACID) | START TRANSACTION / COMMIT / ROLLBACK for outfit creation | `queries.sql` — Query 7, `src/lib/actions/outfits.ts` |
| Atomicity | Outfit creation rolls back on partial failure | `queries.sql` — Query 7 |
| Consistency | CHECK constraints, ENUM, NOT NULL, FK constraints | `schema.sql` — all tables |
| Isolation | InnoDB REPEATABLE READ default isolation level | Section 14 |
| Durability | InnoDB WAL and redo logs | Section 14 |
| Indexes | 20 indexes (B-Tree + FULLTEXT) across all tables | `schema.sql`, Section 10 |
| Self-referencing FK | `Categories.parent_id → Categories.cat_id` | `schema.sql`, `queries.sql` — Query 10 |
| M:N Relationship | `Outfit_Items` junction table | `schema.sql`, `queries.sql` — Query 11 |
| ENUM Constraints | 5 ENUM columns across 3 tables | `schema.sql`, Section 6 |
| CHECK Constraints | `purchase_price >= 0`, `wear_count >= 0`, `amount >= 0`, `seller_id != buyer_id` | `schema.sql` |
| NULLIF / NULL handling | `NULLIF(wear_count, 0)` in view to prevent division-by-zero | `schema.sql` — view |
| SIGNAL / Error Handling | `SIGNAL SQLSTATE '45000'` in stored procedure | `schema.sql` — procedure |
| Connection Pooling | mysql2 pool with `connectionLimit: 5` | `src/lib/db/client.ts` |
| Authentication | Auth.js v5 with bcrypt password hashing | `src/auth.ts`, `src/lib/actions/auth.ts` |

---

## 18. Database Setup Instructions

Follow these steps to set up the ThreadShare database from scratch.

### Step 1 — Start MySQL 8.0

**Option A — XAMPP:**
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL
3. Verify MySQL is running (green status)

**Option B — MySQL Workbench / standalone MySQL:**
1. Ensure MySQL 8.0 service is running
2. Connect using MySQL Workbench or the CLI

### Step 2 — Run the Schema

Execute `database/schema.sql` to create the database, all tables, indexes, triggers, stored procedure, and view:

```bash
# Using MySQL CLI
mysql -u root -p < database/schema.sql

# Or in MySQL Workbench:
# File → Open SQL Script → database/schema.sql → Execute (lightning bolt)
```

This script:
- Creates the `threadshare` database
- Creates all 7 tables with constraints
- Creates all 20 indexes
- Creates 2 triggers
- Creates 1 stored procedure
- Creates 1 view

### Step 3 — Run the Seed Data

Execute `database/seed.sql` to populate the database with demo data:

```bash
mysql -u root -p < database/seed.sql
```

This inserts:
- 13 categories
- 5 users
- 32 inventory items
- 22 wear log entries (triggers fire, updating wear_count)
- 5 outfits with 15 outfit-item assignments
- 5 transactions (trigger fires for completed sale, updating item status)

### Step 4 — Configure Environment Variables

Create `.env.local` in the project root:

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=threadshare

# Auth.js
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

> **Important — Windows users:** Use `127.0.0.1` instead of `localhost` for `DB_HOST`. On Windows, `localhost` may attempt a Unix socket connection which is not available. `127.0.0.1` forces a TCP/IP connection that mysql2 requires.

### Step 5 — Install Dependencies and Run

```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000` and sign in with any seed user:
- Email: `alice@example.com` / Password: `password123`
- Email: `bob@example.com` / Password: `password123`

### Verification Queries

Run these after setup to verify everything is working:

```sql
USE threadshare;

-- Check all tables exist
SHOW TABLES;

-- Verify triggers
SHOW TRIGGERS;

-- Verify stored procedure
SHOW PROCEDURE STATUS WHERE Db = 'threadshare';

-- Verify view
SELECT * FROM v_cost_per_wear LIMIT 5;

-- Verify wear_count was updated by trigger during seed
SELECT item_id, name, wear_count FROM Inventory_Items WHERE wear_count > 0;

-- Verify trigger fired for completed sale (item 7 should be 'Sold')
SELECT item_id, name, status FROM Inventory_Items WHERE item_id = 7;
```

---

*ThreadShare Database Documentation — PDEU DBMS Project — April 2026*
