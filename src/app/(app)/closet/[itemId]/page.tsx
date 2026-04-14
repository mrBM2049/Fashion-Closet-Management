import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { ChevronLeft, Shirt, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteItem } from "@/lib/actions/items";
import LogWearForm from "@/components/closet/LogWearForm";
import { InventoryItem, WearLog } from "@/types";

async function getItem(itemId: string, userId: string) {
  const [[itemRows], [logRows]] = await Promise.all([
    db.execute(
      `SELECT ii.*, c.name AS category_name
       FROM   Inventory_Items ii
       LEFT JOIN Categories c ON c.cat_id = ii.cat_id
       WHERE  ii.item_id = ? AND ii.user_id = ?`,
      [itemId, userId]
    ),
    db.execute(
      `SELECT worn_on, occasion FROM Wear_Log WHERE item_id = ? ORDER BY worn_on DESC`,
      [itemId]
    ),
  ]);
  return {
    item: (itemRows as InventoryItem[])[0] ?? null,
    wearLog: logRows as WearLog[],
  };
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const session = await auth();
  const userId = (session?.user as any)?.userId as string;
  const { itemId } = await params;

  const { item, wearLog } = await getItem(itemId, userId);
  if (!item) notFound();

  const deleteAction = async () => {
    "use server";
    await deleteItem(item.item_id);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/closet">
          <Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Shirt className="w-20 h-20 opacity-20" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">{item.name}</h1>
            {item.brand && <p className="text-muted-foreground">{item.brand}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{item.condition_grade}</Badge>
            <Badge variant="outline">{item.status}</Badge>
            {item.size && <Badge variant="outline">Size: {item.size}</Badge>}
            {item.color && <Badge variant="outline">{item.color}</Badge>}
            {(item as any).category_name && (
              <Badge variant="outline">{(item as any).category_name}</Badge>
            )}
          </div>

          <div className="text-sm space-y-1 text-muted-foreground">
            {item.purchase_price != null && (
              <p>Purchase price: <span className="text-foreground font-medium">₹{item.purchase_price}</span></p>
            )}
            <p>Worn: <span className="text-foreground font-medium">{item.wear_count} times</span></p>
            {item.purchase_price != null && item.wear_count > 0 && (
              <p>Cost per wear: <span className="text-foreground font-medium">
                ₹{(item.purchase_price / item.wear_count).toFixed(2)}
              </span></p>
            )}
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground border-t pt-3">{item.description}</p>
          )}

          {/* Log Wear */}
          <LogWearForm itemId={item.item_id} />

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Link href={`/closet/${item.item_id}/edit`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Pencil className="w-4 h-4 mr-1" />Edit
              </Button>
            </Link>
            <form action={deleteAction}>
              <Button variant="destructive" type="submit">
                <Trash2 className="w-4 h-4 mr-1" />Delete
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Wear Log Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Wear History</h2>
        {wearLog.length === 0 ? (
          <p className="text-sm text-muted-foreground">No wear entries yet.</p>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Date</th>
                  <th className="text-left px-4 py-2.5 font-medium">Occasion</th>
                </tr>
              </thead>
              <tbody>
                {wearLog.map((log, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2.5">
                      {new Date(log.worn_on).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {log.occasion ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
