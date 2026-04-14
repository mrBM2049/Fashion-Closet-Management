"use server";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOutfit(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).userId;
  const name = formData.get("name") as string;
  const occasionTag = (formData.get("occasion_tag") as string) || null;
  const itemIds = formData.getAll("item_ids").map(Number).filter(Boolean);

  if (!name || itemIds.length === 0) throw new Error("Name and at least one item required");

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO Outfits (user_id, name, occasion_tag) VALUES (?, ?, ?)`,
      [userId, name, occasionTag]
    );
    const outfitId = (result as any).insertId;

    for (let i = 0; i < itemIds.length; i++) {
      await conn.execute(
        `INSERT INTO Outfit_Items (outfit_id, item_id, position) VALUES (?, ?, ?)`,
        [outfitId, itemIds[i], i + 1]
      );
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  revalidatePath("/outfits");
  redirect("/outfits");
}

export async function deleteOutfit(outfitId: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).userId;

  await db.execute(
    `DELETE FROM Outfits WHERE outfit_id = ? AND user_id = ?`,
    [outfitId, userId]
  );

  revalidatePath("/outfits");
}
