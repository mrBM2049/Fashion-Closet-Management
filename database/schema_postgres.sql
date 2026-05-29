-- ============================================================
-- ThreadShare – Fashion Closet Management System
-- Database Schema (PostgreSQL / Supabase)
-- ============================================================

-- Custom ENUM types
CREATE TYPE user_role AS ENUM ('member', 'admin');
CREATE TYPE item_condition AS ENUM ('New', 'Like New', 'Good', 'Fair', 'Poor');
CREATE TYPE item_status AS ENUM ('Available', 'Listed', 'Sold');
CREATE TYPE transaction_type AS ENUM ('Sale', 'Borrow');
CREATE TYPE transaction_status AS ENUM ('Pending', 'Completed', 'Cancelled');

-- ============================================================
-- TABLE: Users
-- ============================================================
CREATE TABLE Users (
  user_id       SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100),
  avatar_url    VARCHAR(500),
  location      VARCHAR(100),
  role          user_role NOT NULL DEFAULT 'member',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email    ON Users(email);
CREATE INDEX idx_users_username ON Users(username);

-- ============================================================
-- TABLE: Categories (self-referencing hierarchy)
-- ============================================================
CREATE TABLE Categories (
  cat_id    SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(100) NOT NULL UNIQUE,
  parent_id INT DEFAULT NULL,
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id)
    REFERENCES Categories(cat_id) ON DELETE SET NULL
);

-- ============================================================
-- TABLE: Inventory_Items (core entity)
-- ============================================================
CREATE TABLE Inventory_Items (
  item_id         SERIAL PRIMARY KEY,
  user_id         INT NOT NULL,
  cat_id          INT DEFAULT NULL,
  name            VARCHAR(200) NOT NULL,
  brand           VARCHAR(100),
  size            VARCHAR(20),
  color           VARCHAR(50),
  condition_grade item_condition NOT NULL DEFAULT 'Good',
  purchase_price  DECIMAL(10,2) CHECK (purchase_price >= 0),
  image_url       VARCHAR(500),
  tags            VARCHAR(255),
  status          item_status NOT NULL DEFAULT 'Available',
  wear_count      INT NOT NULL DEFAULT 0 CHECK (wear_count >= 0),
  description     TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_item_user FOREIGN KEY (user_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_item_cat FOREIGN KEY (cat_id)
    REFERENCES Categories(cat_id) ON DELETE SET NULL
);

-- Full-Text Search tsvector (Generated STORED column)
ALTER TABLE Inventory_Items ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))
  ) STORED;

CREATE INDEX idx_items_user_id ON Inventory_Items(user_id);
CREATE INDEX idx_items_cat_id  ON Inventory_Items(cat_id);
CREATE INDEX idx_items_status  ON Inventory_Items(status);
CREATE INDEX idx_items_color   ON Inventory_Items(color);
CREATE INDEX idx_items_search   ON Inventory_Items USING gin(search_vector);

-- ============================================================
-- TABLE: Wear_Log
-- ============================================================
CREATE TABLE Wear_Log (
  log_id     SERIAL PRIMARY KEY,
  item_id    INT NOT NULL,
  worn_on    DATE NOT NULL,
  occasion   VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wearlog_item FOREIGN KEY (item_id)
    REFERENCES Inventory_Items(item_id) ON DELETE CASCADE
);

CREATE INDEX idx_wearlog_item_id ON Wear_Log(item_id);
CREATE INDEX idx_wearlog_worn_on ON Wear_Log(worn_on);

-- ============================================================
-- TABLE: Outfits
-- ============================================================
CREATE TABLE Outfits (
  outfit_id    SERIAL PRIMARY KEY,
  user_id      INT NOT NULL,
  name         VARCHAR(200) NOT NULL,
  occasion_tag VARCHAR(100),
  description  TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_outfit_user FOREIGN KEY (user_id)
    REFERENCES Users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: Outfit_Items (M:N junction)
-- ============================================================
CREATE TABLE Outfit_Items (
  outfit_id INT NOT NULL,
  item_id   INT NOT NULL,
  position  SMALLINT DEFAULT NULL,
  PRIMARY KEY (outfit_id, item_id),
  CONSTRAINT fk_oi_outfit FOREIGN KEY (outfit_id)
    REFERENCES Outfits(outfit_id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_item FOREIGN KEY (item_id)
    REFERENCES Inventory_Items(item_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: Transactions
-- ============================================================
CREATE TABLE Transactions (
  txn_id     SERIAL PRIMARY KEY,
  item_id    INT NOT NULL,
  seller_id  INT NOT NULL,
  buyer_id   INT NOT NULL,
  txn_type   transaction_type NOT NULL,
  amount     DECIMAL(10,2) CHECK (amount >= 0),
  status     transaction_status NOT NULL DEFAULT 'Pending',
  txn_date   DATE NOT NULL,
  notes      TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_txn_item   FOREIGN KEY (item_id)   REFERENCES Inventory_Items(item_id),
  CONSTRAINT fk_txn_seller FOREIGN KEY (seller_id) REFERENCES Users(user_id),
  CONSTRAINT fk_txn_buyer  FOREIGN KEY (buyer_id)  REFERENCES Users(user_id),
  CONSTRAINT chk_diff_users CHECK (seller_id != buyer_id)
);

CREATE INDEX idx_txn_item_id   ON Transactions(item_id);
CREATE INDEX idx_txn_seller_id ON Transactions(seller_id);
CREATE INDEX idx_txn_buyer_id  ON Transactions(buyer_id);
CREATE INDEX idx_txn_status    ON Transactions(status);

-- ============================================================
-- TRIGGER FUNCTION: updated_at auto-update
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_item_timestamp
BEFORE UPDATE ON Inventory_Items
FOR EACH ROW
EXECUTE FUNCTION fn_update_timestamp();

-- ============================================================
-- TRIGGER FUNCTION: Auto-increment wear_count after Wear_Log insert
-- ============================================================
CREATE OR REPLACE FUNCTION fn_wear_count_increment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE Inventory_Items
  SET    wear_count = wear_count + 1
  WHERE  item_id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wear_count_increment
AFTER INSERT ON Wear_Log
FOR EACH ROW
EXECUTE FUNCTION fn_wear_count_increment();

-- ============================================================
-- TRIGGER FUNCTION: Mark item as 'Sold' when Sale transaction completed
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_item_status_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Completed' AND NEW.txn_type = 'Sale' THEN
    UPDATE Inventory_Items
    SET    status = 'Sold'
    WHERE  item_id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_item_status_on_sale
AFTER UPDATE ON Transactions
FOR EACH ROW
EXECUTE FUNCTION fn_update_item_status_on_sale();

-- ============================================================
-- STORED PROCEDURE: Add wear entry with validation
-- ============================================================
CREATE OR REPLACE PROCEDURE sp_add_wear_entry (
  p_item_id  INT,
  p_worn_on  DATE,
  p_occasion VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM Inventory_Items WHERE item_id = p_item_id) THEN
    RAISE EXCEPTION 'Item not found';
  END IF;

  INSERT INTO Wear_Log (item_id, worn_on, occasion)
  VALUES (p_item_id, p_worn_on, p_occasion);
END;
$$;

-- ============================================================
-- VIEW: Cost-per-wear analytics
-- ============================================================
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
