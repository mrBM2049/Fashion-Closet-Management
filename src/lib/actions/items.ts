"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addItem(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).userId;
  const imageUrl = (formData.get("image_url") as string) || null;

  await db.execute(
    `INSERT INTO Inventory_Items
       (user_id, name, brand, cat_id, color, size, condition_grade, purchase_price, description, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      formData.get("name") as string,
      (formData.get("brand") as string) || null,
      (formData.get("cat_id") as string) || null,
      (formData.get("color") as string) || null,
      (formData.get("size") as string) || null,
      (formData.get("condition_grade") as string) || "Good",
      (formData.get("purchase_price") as string) || null,
      (formData.get("description") as string) || null,
      imageUrl,
    ]
  );

  revalidatePath("/closet");
  redirect("/closet");
}

export async function updateItem(itemId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).userId;
  const imageUrl = (formData.get("image_url") as string) || null;

  await db.execute(
    `UPDATE Inventory_Items
     SET name=?, brand=?, cat_id=?, color=?, size=?, condition_grade=?, purchase_price=?, description=?,
         image_url=COALESCE(NULLIF(?, ''), image_url)
     WHERE item_id=? AND user_id=?`,
    [
      formData.get("name") as string,
      (formData.get("brand") as string) || null,
      (formData.get("cat_id") as string) || null,
      (formData.get("color") as string) || null,
      (formData.get("size") as string) || null,
      (formData.get("condition_grade") as string) || "Good",
      (formData.get("purchase_price") as string) || null,
      (formData.get("description") as string) || null,
      imageUrl,
      itemId,
      userId,
    ]
  );

  revalidatePath("/closet");
  revalidatePath(`/closet/${itemId}`);
  redirect(`/closet/${itemId}`);
}

export async function deleteItem(itemId: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).userId;

  await db.execute(
    `DELETE FROM Inventory_Items WHERE item_id = ? AND user_id = ?`,
    [itemId, userId]
  );

  revalidatePath("/closet");
  redirect("/closet");
}

export async function logWear(itemId: number, occasion: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.execute("CALL sp_add_wear_entry(?, CURDATE(), ?)", [itemId, occasion || null]);
  revalidatePath(`/closet/${itemId}`);
  return { success: true };
}
