export interface User {
  user_id: number;
  email: string;
  username: string;
  password_hash: string;
  role: "User" | "Admin";
  created_at: Date;
}

export interface Category {
  cat_id: number;
  name: string;
  parent_id: number | null;
}

export interface InventoryItem {
  item_id: number;
  user_id: number;
  name: string;
  brand: string | null;
  cat_id: number | null;
  color: string | null;
  size: string | null;
  condition_grade: "New" | "Like New" | "Good" | "Fair" | "Poor";
  purchase_price: number | null;
  image_url: string | null;
  description: string | null;
  status: "Active" | "Archived" | "Listed" | "Sold";
  wear_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface WearLog {
  log_id: number;
  item_id: number;
  worn_on: Date;
  occasion: string | null;
}

export interface Outfit {
  outfit_id: number;
  user_id: number;
  name: string;
  occasion_tag: string | null;
  created_at: Date;
}

export interface OutfitItem {
  outfit_id: number;
  item_id: number;
  position: number;
}

export interface Transaction {
  txn_id: number;
  item_id: number;
  seller_id: number;
  buyer_id: number;
  txn_type: "Sale" | "Borrow";
  status: "Pending" | "Completed" | "Cancelled";
  amount: number | null;
  txn_date: Date;
  created_at: Date;
}
