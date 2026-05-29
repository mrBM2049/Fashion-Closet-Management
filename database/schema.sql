-- ============================================================
-- ThreadShare – Fashion Closet Management System
-- Database Schema (MySQL 8.0 · InnoDB · utf8mb4)
-- DBMS Subject | PDEU
-- ============================================================

CREATE DATABASE IF NOT EXISTS threadshare
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE threadshare;

-- ============================================================
-- TABLE: Users
-- ============================================================
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

CREATE INDEX idx_users_email    ON Users(email);
CREATE INDEX idx_users_username ON Users(username);

-- ============================================================
-- TABLE: Categories (self-referencing hierarchy)
-- ============================================================
CREATE TABLE Categories (
  cat_id    INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  slug      VARCHAR(100) NOT NULL UNIQUE,
  parent_id INT DEFAULT NULL,
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id)
    REFERENCES Categories(cat_id) ON DELETE SET NULL
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: Inventory_Items (core entity)
-- ============================================================
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

CREATE INDEX idx_items_user_id ON Inventory_Items(user_id);
CREATE INDEX idx_items_cat_id  ON Inventory_Items(cat_id);
CREATE INDEX idx_items_status  ON Inventory_Items(status);
CREATE INDEX idx_items_color   ON Inventory_Items(color);

-- ============================================================
-- TABLE: Wear_Log
-- ============================================================
CREATE TABLE Wear_Log (
  log_id     INT AUTO_INCREMENT PRIMARY KEY,
  item_id    INT NOT NULL,
  worn_on    DATE NOT NULL,
  occasion   VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wearlog_item FOREIGN KEY (item_id)
    REFERENCES Inventory_Items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX idx_wearlog_item_id ON Wear_Log(item_id);
CREATE INDEX idx_wearlog_worn_on ON Wear_Log(worn_on);

-- ============================================================
-- TABLE: Outfits
-- ============================================================
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

-- ============================================================
-- TABLE: Outfit_Items (M:N junction)
-- ============================================================
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

-- ============================================================
-- TABLE: Transactions
-- ============================================================
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

CREATE INDEX idx_txn_item_id   ON Transactions(item_id);
CREATE INDEX idx_txn_seller_id ON Transactions(seller_id);
CREATE INDEX idx_txn_buyer_id  ON Transactions(buyer_id);
CREATE INDEX idx_txn_status    ON Transactions(status);

-- ============================================================
-- TRIGGER: Auto-increment wear_count after Wear_Log insert
-- ============================================================
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

-- ============================================================
-- TRIGGER: Mark item as 'Sold' when Sale transaction completed
-- ============================================================
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

-- ============================================================
-- STORED PROCEDURE: Add wear entry with validation
-- ============================================================
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
