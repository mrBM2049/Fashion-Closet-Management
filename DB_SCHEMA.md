# Database Schema

All entities, fields, relationships, constraints, indexes, triggers, stored procedures, and views for **ThreadShare**. Source of truth for MySQL migrations.

References:
- ARCHITECTURE.md (Stack, API Design, Atomic Rental Flow)
- Project Specification: Sections 2–5 (Entity Tables, Marketplace Engine, Advanced Logic)

---

## Entity Overview

```
Users
  │
  ├──< Inventory_Items (1:N)
  │         │
  │         ├──< Outfit_Contents (M:N junction → Outfits)
  │         ├──< Item_Status_Log (1:N)
  │         ├──< Wear_Log (1:N)
  │         └──< Listings (1:1, UNIQUE constraint)
  │                   │
  │                   └──< Rentals (1:N)
  │                             │
  │                             └──< Transactions (1:1)
  │
  ├──< Outfits (1:N)
  │         │
  │         ├──< Outfit_Contents (M:N junction → Inventory_Items)
  │         └──< Listings (1:1, UNIQUE constraint)
  │
  └──< Transactions (1:N, as buyer or seller)

Categories (self-referencing hierarchy)
  └──< Inventory_Items (1:N via cat_id)
```

---

## Enums and Status Values

### Item Status
```
'Available' | 'In_Use_Personal' | 'Listed_For_Rent' | 'Currently_Rented' | 'Sold' | 'Laundry' | 'In_Repair'
```
> Status transitions are enforced by the `trg_rental_status_update` trigger and API-layer validation. See [Status Lifecycle](#item-status-lifecycle).

### Listing Type
```
'Rent' | 'Sale'
```

### Transaction Status
```
'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled' | 'Disputed'
```

### Transaction Type
```
'Rent' | 'Sale'
```

### User Role
```
'member' | 'admin'
```

---

## Entity Definitions

### `Users`

Stores profile, contact, reputation, and wallet data for all registered users.

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| user_id | INT | no | AUTO_INCREMENT | PK | |
| email | VARCHAR(255) | no | — | UNIQUE, NOT NULL | Login identifier |
| username | VARCHAR(50) | no | — | UNIQUE, NOT NULL | Display handle |
| password_hash | VARCHAR(255) | no | — | NOT NULL | bcrypt hash; NULL for OAuth-only users |
| google_id | VARCHAR(100) | yes | NULL | UNIQUE | Google OAuth sub claim |
| display_name | VARCHAR(100) | yes | NULL | | Full name for display |
| avatar_url | VARCHAR(500) | yes | NULL | | Cloudinary CDN URL |
| bio | TEXT | yes | NULL | | Short profile bio |
| location | VARCHAR(100) | yes | NULL | | City / region |
| rating_score | DECIMAL(3,2) | no | 0.00 | CHECK >= 0 AND <= 5 | Avg of received ratings |
| rating_count | INT | no | 0 | CHECK >= 0 | Number of ratings received |
| wallet_balance | DECIMAL(10,2) | no | 0.00 | CHECK >= 0 | Pending earnings; paid out via Stripe Connect |
| role | ENUM('member','admin') | no | 'member' | | |
| created_at | TIMESTAMP | no | CURRENT_TIMESTAMP | | |
| updated_at | TIMESTAMP | no | CURRENT_TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `users_email_idx` on `email`
- `users_username_idx` on `username`

**Notes:**
- `wallet_balance` is incremented when a rental/sale completes. Payout to bank is handled via Stripe Connect (out of scope for v1 schema).
- `rating_score` and `rating_count` are denormalized for read performance. Updated by a trigger on `Transactions` when status → `Completed`.

---

### `Categories`

Self-referencing hierarchy for item classification (e.g., Outerwear → Denim Jackets).

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| cat_id | INT | no | AUTO_INCREMENT | PK | |
| name | VARCHAR(100) | no | — | NOT NULL | e.g., "Outerwear", "Denim Jackets" |
| slug | VARCHAR(100) | no | — | UNIQUE | URL-safe identifier |
| parent_id | INT | yes | NULL | FK → Categories.cat_id | NULL = top-level category |
| depth | TINYINT | no | 0 | | 0 = root, 1 = subcategory, max 2 levels |
| created_at | TIMESTAMP | no | CURRENT_TIMESTAMP | | |

**Indexes:**
- `categories_parent_id_idx` on `parent_id`
- `categories_slug_idx` on `slug`

**Seed data (top-level categories):**
```sql
INSERT INTO Categories (name, slug, parent_id) VALUES
  ('Tops', 'tops', NULL),
  ('Bottoms', 'bottoms', NULL),
  ('Dresses', 'dresses', NULL),
  ('Outerwear', 'outerwear', NULL),
  ('Footwear', 'footwear', NULL),
  ('Accessories', 'accessories', NULL),
  ('Activewear', 'activewear', NULL);
```

---

### `Inventory_Items`

The physical clothing pieces in a user's closet. Central entity of the system.

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| item_id | INT | no | AUTO_INCREMENT | PK | |
| user_id | INT | no | — | FK → Users.user_id ON DELETE CASCADE | Owner |
| cat_id | INT | yes | NULL | FK → Categories.cat_id | NULL if uncategorized |
| name | VARCHAR(200) | no | — | NOT NULL | e.g., "Vintage Levi's Trucker Jacket" |
| brand | VARCHAR(100) | yes | NULL | | |
| size | VARCHAR(20) | yes | NULL | | "S", "M", "32x30", "EU 42" |
| color | VARCHAR(50) | yes | NULL | | Primary color |
| material | VARCHAR(100) | yes | NULL | | e.g., "100% Cotton" |
| condition_grade | ENUM('New','Like New','Good','Fair','Poor') | no | 'Good' | | |
| purchase_price | DECIMAL(10,2) | yes | NULL | CHECK >= 0 | Used for CPW analytics |
| image_url | VARCHAR(500) | yes | NULL | | Cloudinary CDN URL |
| image_public_id | VARCHAR(200) | yes | NULL | | Cloudinary public_id (for deletion) |
| tags | JSON | yes | NULL | | Array of style tags e.g. `["casual","Y2K"]` |
| status | ENUM('Available','In_Use_Personal','Listed_For_Rent','Currently_Rented','Sold','Laundry','In_Repair') | no | 'Available' | | Managed by triggers + API |
| wear_count | INT | no | 0 | CHECK >= 0 | Incremented via `Wear_Log` insert trigger |
| description | TEXT | yes | NULL | | Freeform notes |
| created_at | TIMESTAMP | no | CURRENT_TIMESTAMP | | |
| updated_at | TIMESTAMP | no | CURRENT_TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `items_user_id_idx` on `user_id`
- `items_cat_id_idx` on `cat_id`
- `items_status_idx` on `status`
- `FULLTEXT items_search_ft` on `(name, brand, description)` — used by marketplace search

**Notes:**
- Images are **never stored as BLOBs**. Only the Cloudinary CDN `image_url` and `image_public_id` are stored.
- `wear_count` is a denormalized count. Kept in sync by `trg_wear_count_increment` trigger on `Wear_Log`.
- `tags` stored as JSON array. Application-layer Zod validation enforces array-of-strings shape.

---

### `Wear_Log`

Tracks every time a user wears an item. Powers Cost-per-Wear analytics.

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| log_id | INT | no | AUTO_INCREMENT | PK | |
| item_id | INT | no | — | FK → Inventory_Items.item_id ON DELETE CASCADE | |
| worn_on | DATE | no | — | NOT NULL | Date the item was worn |
| notes | VARCHAR(255) | yes | NULL | | e.g., "wedding", "office" |
| created_at | TIMESTAMP | no | CURRENT_TIMESTAMP | | |

**Indexes:**
- `wear_log_item_id_idx` on `item_id`

**Trigger:** `trg_wear_count_increment` — on INSERT, increments `Inventory_Items.wear_count` by 1 for the corresponding `item_id`.

---

### `Outfits`

A curated collection of items saved as a "Look." One user can have many outfits; items are linked via `Outfit_Contents`.

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| outfit_id | INT | no | AUTO_INCREMENT | PK | |
| user_id | INT | no | — | FK → Users.user_id ON DELETE CASCADE | |
| name | VARCHAR(200) | no | — | NOT NULL | e.g., "Summer Festival Look" |
| description | TEXT | yes | NULL | | |
| occasion_tag | VARCHAR(100) | yes | NULL | | e.g., "Casual", "Formal", "Party" |
| cover_url | VARCHAR(500) | yes | NULL | | Auto-generated collage or user-selected image |
| created_at | TIMESTAMP | no | CURRENT_TIMESTAMP | | |
| updated_at | TIMESTAMP | no | CURRENT_TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Indexes:**
- `outfits_user_id_idx` on `user_id`

---

### `Outfit_Contents`

Many-to-Many junction: connects `Inventory_Items` ↔ `Outfits`. One item can belong to many outfits; one outfit holds many items.

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| outfit_id | INT | no | — | FK → Outfits.outfit_id ON DELETE CASCADE | |
| item_id | INT | no | — | FK → Inventory_Items.item_id ON DELETE CASCADE | |
| position | TINYINT | no | 0 | | Drag-and-drop display order |

**Primary Key:** `(outfit_id, item_id)` — composite, prevents duplicates.

**Indexes:**
- `outfit_contents_item_id_idx` on `item_id` — for reverse lookup: "which outfits contain this item?"

---

### `Item_Status_Log`

Audit trail of all status changes for an item. Append-only — never update or delete rows.

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| log_id | INT | no | AUTO_INCREMENT | PK | |
| item_id | INT | no | — | FK → Inventory_Items.item_id ON DELETE CASCADE | |
| status | ENUM('Available','In_Use_Personal','Listed_For_Rent','Currently_Rented','Sold','Laundry','In_Repair') | no | — | NOT NULL | The new status |
| changed_by | INT | yes | NULL | FK → Users.user_id | NULL if changed by system trigger |
| reason | VARCHAR(255) | yes | NULL | | e.g., "Rental confirmed", "Returned by renter" |
| changed_at | TIMESTAMP | no | CURRENT_TIMESTAMP | | |

**Indexes:**
- `status_log_item_id_idx` on `(item_id, changed_at DESC)`

**Notes:**
- Populated both by API routes (user-driven status changes) and by database triggers (rental lifecycle).
- `changed_by` is NULL when the trigger fires automatically.

---

### `Listings`

Marks an item or outfit as publicly available on the marketplace for Rent or Sale.

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| listing_id | INT | no | AUTO_INCREMENT | PK | |
| seller_id | INT | no | — | FK → Users.user_id | |
| item_id | INT | yes | NULL | FK → Inventory_Items.item_id, UNIQUE | NULL if listing an outfit |
| outfit_id | INT | yes | NULL | FK → Outfits.outfit_id, UNIQUE | NULL if listing a single item |
| listing_type | ENUM('Rent','Sale') | no | — | NOT NULL | |
| price | DECIMAL(10,2) | yes | NULL | CHECK >= 0 | Sale price OR daily rental rate |
| security_deposit | DECIMAL(10,2) | yes | NULL | CHECK >= 0 | Required for Rent listings |
| description | TEXT | yes | NULL | | Marketplace-facing description |
| is_active | BOOLEAN | no | TRUE | | FALSE = delisted |
| created_at | TIMESTAMP | no | CURRENT_TIMESTAMP | | |
| updated_at | TIMESTAMP | no | CURRENT_TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Constraints:**
```sql
-- Exactly one of item_id or outfit_id must be set
CONSTRAINT chk_listing_target
  CHECK (
    (item_id IS NOT NULL AND outfit_id IS NULL) OR
    (item_id IS NULL AND outfit_id IS NOT NULL)
  ),

-- Rent listings must have both price (daily_rate) and security_deposit
CONSTRAINT chk_rent_fields
  CHECK (
    listing_type != 'Rent' OR
    (price IS NOT NULL AND security_deposit IS NOT NULL)
  ),

-- Sale listings must have price
CONSTRAINT chk_sale_fields
  CHECK (listing_type != 'Sale' OR price IS NOT NULL),

-- One active listing per item (prevents duplicate listings)
UNIQUE KEY uq_item_listing (item_id),
UNIQUE KEY uq_outfit_listing (outfit_id)
```

**Indexes:**
- `listings_seller_id_idx` on `seller_id`
- `listings_active_type_idx` on `(is_active, listing_type)` — for fast marketplace filtering

---

### `Rentals`

Tracks the time-based possession of a listed item. The source of truth for availability calendar data.

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| rental_id | INT | no | AUTO_INCREMENT | PK | |
| listing_id | INT | no | — | FK → Listings.listing_id | |
| renter_id | INT | no | — | FK → Users.user_id | The person renting |
| start_date | DATE | no | — | NOT NULL | Inclusive start |
| end_date | DATE | no | — | NOT NULL | Inclusive end |
| total_cost | DECIMAL(10,2) | no | — | NOT NULL, CHECK >= 0 | daily_rate × days + deposit |
| stripe_payment_intent_id | VARCHAR(255) | yes | NULL | | Links to Stripe PaymentIntent |
| status | ENUM('Pending','Confirmed','Active','Completed','Cancelled') | no | 'Pending' | | |
| created_at | TIMESTAMP | no | CURRENT_TIMESTAMP | | |

**Constraints:**
```sql
CONSTRAINT chk_rental_dates
  CHECK (end_date >= start_date)
```

**Indexes:**
- `rentals_listing_id_idx` on `listing_id`
- `rentals_renter_id_idx` on `renter_id`
- `rentals_dates_idx` on `(listing_id, start_date, end_date)` — critical for overlap queries

**Trigger:** `trg_rental_status_update` — see [Triggers](#triggers) section.

---

### `Transactions`

Immutable ledger of completed financial exchanges (both Rent and Sale). Never update or delete rows.

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| transaction_id | INT | no | AUTO_INCREMENT | PK | |
| listing_id | INT | no | — | FK → Listings.listing_id | |
| buyer_id | INT | no | — | FK → Users.user_id | |
| seller_id | INT | no | — | FK → Users.user_id | |
| rental_id | INT | yes | NULL | FK → Rentals.rental_id | NULL for Sale transactions |
| transaction_type | ENUM('Rent','Sale') | no | — | NOT NULL | |
| amount_paid | DECIMAL(10,2) | no | — | NOT NULL, CHECK > 0 | Gross amount charged to buyer |
| platform_fee | DECIMAL(10,2) | no | 0.00 | CHECK >= 0 | ThreadShare commission (v1: 10%) |
| seller_earnings | DECIMAL(10,2) | no | — | NOT NULL | amount_paid - platform_fee |
| deposit_held | DECIMAL(10,2) | no | 0.00 | CHECK >= 0 | Security deposit for rentals |
| deposit_returned | BOOLEAN | no | FALSE | | TRUE after item returned in good condition |
| stripe_payment_id | VARCHAR(255) | yes | NULL | | Stripe PaymentIntent ID |
| stripe_charge_id | VARCHAR(255) | yes | NULL | | Stripe Charge ID |
| status | ENUM('Pending','Confirmed','Active','Completed','Cancelled','Disputed') | no | 'Pending' | | |
| created_at | TIMESTAMP | no | CURRENT_TIMESTAMP | | |

**Indexes:**
- `transactions_buyer_id_idx` on `buyer_id`
- `transactions_seller_id_idx` on `seller_id`
- `transactions_listing_id_idx` on `listing_id`
- `transactions_status_idx` on `status`

---

## Item Status Lifecycle

```
AVAILABLE
  ├── [User wears personally]         → IN_USE_PERSONAL → AVAILABLE
  ├── [User lists for rent]           → LISTED_FOR_RENT
  │     ├── [Rental confirmed]        → CURRENTLY_RENTED
  │     │     ├── [Rental ends]       → LAUNDRY → AVAILABLE
  │     │     └── [Damage reported]   → IN_REPAIR → AVAILABLE
  │     └── [Delisted]                → AVAILABLE
  ├── [Item needs repair]             → IN_REPAIR → AVAILABLE
  └── [Listed for sale + sold]        → SOLD  (terminal)
```

Status transitions enforced at two levels:
1. **API layer** — rejects invalid transitions before writing to DB
2. **`trg_rental_status_update` trigger** — automatically drives `LISTED_FOR_RENT → CURRENTLY_RENTED → LAUNDRY` on rental lifecycle events

---

## Stored Procedures

### `sp_book_rental`

Atomic procedure that handles the complete rental booking flow. Prevents double-booking and partial failures.

```sql
DELIMITER $$

CREATE PROCEDURE sp_book_rental (
  IN  p_listing_id     INT,
  IN  p_renter_id      INT,
  IN  p_start_date     DATE,
  IN  p_end_date       DATE,
  IN  p_stripe_pi_id   VARCHAR(255),
  OUT p_rental_id      INT,
  OUT p_transaction_id INT
)
BEGIN
  DECLARE v_item_id        INT;
  DECLARE v_seller_id      INT;
  DECLARE v_daily_rate     DECIMAL(10,2);
  DECLARE v_deposit        DECIMAL(10,2);
  DECLARE v_days           INT;
  DECLARE v_total          DECIMAL(10,2);
  DECLARE v_platform_fee   DECIMAL(10,2);
  DECLARE v_conflict_count INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

    -- 1. Fetch listing details and lock the row
    SELECT l.item_id, l.seller_id, l.price, l.security_deposit
    INTO   v_item_id, v_seller_id, v_daily_rate, v_deposit
    FROM   Listings l
    WHERE  l.listing_id = p_listing_id
      AND  l.is_active  = TRUE
      AND  l.listing_type = 'Rent'
    FOR UPDATE;

    -- 2. Double-booking guard: check for date overlap on this listing
    SELECT COUNT(*)
    INTO   v_conflict_count
    FROM   Rentals r
    WHERE  r.listing_id = p_listing_id
      AND  r.status NOT IN ('Cancelled')
      AND  r.start_date <= p_end_date
      AND  r.end_date   >= p_start_date;

    IF v_conflict_count > 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'DATES_UNAVAILABLE: Requested dates overlap with an existing rental.';
    END IF;

    -- 3. Calculate cost
    SET v_days         = DATEDIFF(p_end_date, p_start_date) + 1;
    SET v_total        = (v_daily_rate * v_days) + v_deposit;
    SET v_platform_fee = ROUND(v_total * 0.10, 2);

    -- 4. Insert Rental record
    INSERT INTO Rentals (listing_id, renter_id, start_date, end_date, total_cost, stripe_payment_intent_id, status)
    VALUES (p_listing_id, p_renter_id, p_start_date, p_end_date, v_total, p_stripe_pi_id, 'Pending');

    SET p_rental_id = LAST_INSERT_ID();

    -- 5. Insert Transaction record
    INSERT INTO Transactions (listing_id, buyer_id, seller_id, rental_id, transaction_type, amount_paid, platform_fee, seller_earnings, deposit_held, stripe_payment_id, status)
    VALUES (p_listing_id, p_renter_id, v_seller_id, p_rental_id, 'Rent', v_total, v_platform_fee, v_total - v_platform_fee, v_deposit, p_stripe_pi_id, 'Pending');

    SET p_transaction_id = LAST_INSERT_ID();

    -- 6. Update item status
    UPDATE Inventory_Items
    SET    status = 'Listed_For_Rent'  -- Stripe webhook confirmation moves to Currently_Rented
    WHERE  item_id = v_item_id;

    -- 7. Log the status change
    INSERT INTO Item_Status_Log (item_id, status, changed_by, reason)
    VALUES (v_item_id, 'Listed_For_Rent', p_renter_id, CONCAT('Rental pending: rental_id=', p_rental_id));

  COMMIT;
END$$

DELIMITER ;
```

> **Why a procedure:** Ensures steps 2–7 never partially succeed. A Stripe webhook confirms payment and triggers the Pending → Confirmed transition at the application layer, after which the item moves to `Currently_Rented`.

---

## Triggers

### `trg_wear_count_increment`

Keeps `Inventory_Items.wear_count` in sync with `Wear_Log` inserts.

```sql
CREATE TRIGGER trg_wear_count_increment
AFTER INSERT ON Wear_Log
FOR EACH ROW
BEGIN
  UPDATE Inventory_Items
  SET    wear_count = wear_count + 1
  WHERE  item_id = NEW.item_id;
END;
```

---

### `trg_rental_status_update`

Automatically manages item status through the rental lifecycle.

```sql
CREATE TRIGGER trg_rental_status_update
AFTER UPDATE ON Rentals
FOR EACH ROW
BEGIN
  DECLARE v_item_id INT;

  -- Resolve item_id from listing
  SELECT item_id INTO v_item_id
  FROM   Listings
  WHERE  listing_id = NEW.listing_id;

  -- Rental confirmed (payment succeeded via Stripe webhook)
  IF NEW.status = 'Confirmed' AND OLD.status = 'Pending' THEN
    UPDATE Inventory_Items SET status = 'Currently_Rented' WHERE item_id = v_item_id;
    INSERT INTO Item_Status_Log (item_id, status, reason)
    VALUES (v_item_id, 'Currently_Rented', CONCAT('Rental confirmed: rental_id=', NEW.rental_id));

  -- Rental completed: item goes to laundry
  ELSEIF NEW.status = 'Completed' AND OLD.status = 'Active' THEN
    UPDATE Inventory_Items SET status = 'Laundry' WHERE item_id = v_item_id;
    INSERT INTO Item_Status_Log (item_id, status, reason)
    VALUES (v_item_id, 'Laundry', CONCAT('Rental completed: rental_id=', NEW.rental_id));

  -- Rental cancelled before it started: restore availability
  ELSEIF NEW.status = 'Cancelled' AND OLD.status IN ('Pending', 'Confirmed') THEN
    UPDATE Inventory_Items SET status = 'Available' WHERE item_id = v_item_id;
    INSERT INTO Item_Status_Log (item_id, status, reason)
    VALUES (v_item_id, 'Available', CONCAT('Rental cancelled: rental_id=', NEW.rental_id));
  END IF;
END;
```

---

## Views

### `v_cost_per_wear`

Virtual view that calculates Cost-per-Wear for every item. Powers the analytics dashboard.

```sql
CREATE OR REPLACE VIEW v_cost_per_wear AS
SELECT
  ii.item_id,
  ii.user_id,
  ii.name,
  ii.brand,
  ii.purchase_price,
  ii.wear_count                                       AS personal_wears,
  COUNT(r.rental_id)                                  AS times_rented,
  (ii.wear_count + COUNT(r.rental_id))                AS total_uses,
  ROUND(
    ii.purchase_price / NULLIF(ii.wear_count + COUNT(r.rental_id), 0),
    2
  )                                                   AS cost_per_wear,
  COALESCE(SUM(t.seller_earnings), 0)                AS total_earned,
  ROUND(
    COALESCE(SUM(t.seller_earnings), 0)
      / NULLIF(ii.purchase_price, 0) * 100,
    1
  )                                                   AS recovery_percent
FROM       Inventory_Items   ii
LEFT JOIN  Listings          l  ON l.item_id    = ii.item_id
LEFT JOIN  Rentals           r  ON r.listing_id = l.listing_id
                                AND r.status    = 'Completed'
LEFT JOIN  Transactions      t  ON t.rental_id  = r.rental_id
                                AND t.status    = 'Completed'
WHERE      ii.purchase_price IS NOT NULL
GROUP BY   ii.item_id, ii.user_id, ii.name, ii.brand, ii.purchase_price, ii.wear_count;
```

**Frontend usage:**
- `cost_per_wear`: displayed as "Each wear has cost you ₹X"
- `recovery_percent`: displayed as "You've earned back 45% of this item's cost"
- `total_uses`: used to sort closet by "most active items"

---

## Key Query Patterns

### Availability check (calendar disabled dates)

Used by the booking calendar to find blocked date ranges for a listing.

```sql
-- Returns all occupied date ranges for a listing (used to build disabled-dates array)
SELECT start_date, end_date
FROM   Rentals
WHERE  listing_id = :listing_id
  AND  status NOT IN ('Cancelled')
ORDER  BY start_date ASC;
```

### Overlap guard (pre-insert validation)

Called before `sp_book_rental` at the API layer for an early HTTP 409 before entering the procedure.

```sql
SELECT COUNT(*) AS conflict_count
FROM   Rentals
WHERE  listing_id = :listing_id
  AND  status     NOT IN ('Cancelled')
  AND  start_date <= :requested_end
  AND  end_date   >= :requested_start;
-- conflict_count > 0 → return 409 DATES_UNAVAILABLE
```

### Marketplace full-text search

```sql
SELECT
  ii.item_id, ii.name, ii.brand, ii.image_url, ii.size, ii.color,
  l.price, l.security_deposit, l.listing_type,
  u.display_name AS seller_name, u.rating_score,
  MATCH(ii.name, ii.brand, ii.description)
    AGAINST (:query IN BOOLEAN MODE) AS relevance
FROM       Listings          l
JOIN       Inventory_Items   ii ON ii.item_id = l.item_id
JOIN       Users             u  ON u.user_id  = l.seller_id
WHERE      l.is_active    = TRUE
  AND      ii.status      = 'Listed_For_Rent'
  AND      MATCH(ii.name, ii.brand, ii.description)
             AGAINST (:query IN BOOLEAN MODE)
ORDER      BY relevance DESC
LIMIT      :limit OFFSET :offset;
```

### Owner dashboard: active rentals

```sql
SELECT
  r.rental_id, r.start_date, r.end_date,
  ii.name AS item_name, ii.image_url,
  u.display_name AS renter_name,
  t.amount_paid, t.deposit_held, t.deposit_returned
FROM       Rentals          r
JOIN       Listings         l   ON l.listing_id  = r.listing_id
JOIN       Inventory_Items  ii  ON ii.item_id     = l.item_id
JOIN       Users            u   ON u.user_id      = r.renter_id
JOIN       Transactions     t   ON t.rental_id    = r.rental_id
WHERE      l.seller_id = :user_id
  AND      r.status    IN ('Confirmed', 'Active')
ORDER      BY r.end_date ASC;
```

### Style matching across closets (Smart Engine)

```sql
SELECT
  ii.item_id, ii.name, ii.brand, ii.image_url, ii.tags, ii.size,
  l.price, l.listing_id,
  MATCH(ii.name, ii.brand, ii.description)
    AGAINST (:style_query IN BOOLEAN MODE) AS relevance
FROM       Inventory_Items  ii
JOIN       Listings         l  ON l.item_id = ii.item_id
WHERE      ii.user_id  != :current_user_id
  AND      ii.status    = 'Listed_For_Rent'
  AND      l.is_active  = TRUE
  AND      MATCH(ii.name, ii.brand, ii.description)
             AGAINST (:style_query IN BOOLEAN MODE)
ORDER      BY relevance DESC
LIMIT      20;
```

---

## Migration Notes

| Migration | File | Description |
|-----------|------|-------------|
| 001 | `001_initial_schema.sql` | All core tables, ENUMs, FK constraints, `trg_wear_count_increment` |
| 002 | `002_listings_transactions.sql` | `Listings`, `Rentals`, `Transactions`, `sp_book_rental` |
| 003 | `003_rental_trigger.sql` | `trg_rental_status_update`, `Item_Status_Log` |
| 004 | `004_views.sql` | `v_cost_per_wear` view |
| 005 | `005_indexes.sql` | All performance indexes, FULLTEXT index on `Inventory_Items` |
| 006 | `006_categories_seed.sql` | Seed top-level and sub-categories |

**Engine requirement:** All tables use `ENGINE=InnoDB` to support Foreign Keys and `START TRANSACTION / COMMIT / ROLLBACK`.

**Character set:** `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci` on all text columns (emoji-safe, multilingual).

---

## Soft Delete Rules

| Table | Soft Delete | Reason |
|-------|-------------|--------|
| Users | No | Account deactivation handled at auth layer |
| Inventory_Items | `[FUTURE]` via `deleted_at` | v1 uses hard delete; soft delete in v2 for audit trail |
| Outfits | No | Hard delete cascades via `Outfit_Contents` FK |
| Listings | No | Set `is_active = FALSE` instead of deleting |
| Rentals | No | Immutable once created; cancelled via status update |
| Transactions | No | Immutable financial ledger |
| Item_Status_Log | No | Immutable audit trail |
| Wear_Log | No | Immutable wear history |
| Categories | No | Seeded data; never deleted in production |

---

## Assumptions

- `[ASSUMPTION]` Platform commission is 10% of `amount_paid`. Not specified in the project spec; configurable in v2 via a `platform_settings` table.
- `[ASSUMPTION]` `wallet_balance` on `Users` holds pending seller earnings. Actual payout to bank via Stripe Connect is out of scope for v1.
- `[ASSUMPTION]` Outfit listings rent all constituent items together; the `Rental_Schedule` blocks each item individually via the trigger resolving item_id from outfit_id (v2 enhancement).
- `[ASSUMPTION]` `wear_count` tracks personal wears only (via `Wear_Log`). Rental uses are tracked separately in `Transactions` and combined in `v_cost_per_wear`.
- `[RESOLVED]` Images are stored as Cloudinary CDN URLs, not BLOBs.
- `[RESOLVED]` Full-Text indexes are on `(name, brand, description)` using InnoDB FULLTEXT (MySQL 5.6+).
- `[RESOLVED]` Double-booking prevention is enforced inside `sp_book_rental` with a `FOR UPDATE` row lock + date overlap check, not via a separate `CHECK` constraint (MySQL 8.0 supports CHECK but not on cross-row logic).
