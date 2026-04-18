import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { X, Shirt, Pencil, Trash2, Heart, ChevronLeft } from "lucide-react";
import Link from "next/link";
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

  const cpw = item.purchase_price && item.wear_count > 0
    ? (Number(item.purchase_price) / item.wear_count).toFixed(0)
    : null;

  const nameParts  = item.name.split(" ");
  const firstWord  = nameParts[0] ?? "";
  const accentWord = nameParts[1] ?? "";
  const restWords  = nameParts.slice(2).join(" ");

  return (
    <div className="space-y-6 pb-8">
      {/* ── Quick View Modal Sheet ── */}
      <div className="glass rounded-3xl overflow-hidden max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[3fr_2fr]">

          {/* LEFT — image panel */}
          <div className="relative overflow-hidden min-h-[280px] md:min-h-[580px]">
            {/* Blurred bg — always dark regardless of theme (it's behind an image) */}
            {item.image_url ? (
              <div
                className="absolute inset-0 scale-110"
                style={{
                  backgroundImage: `url(${item.image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(40px) brightness(0.35) saturate(1.2)",
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-foreground/8" />
            )}
            <div className="absolute inset-0 bg-black/25" />

            {/* Main image */}
            <div className="relative h-full flex items-center justify-center p-6 md:p-10 min-h-[260px] md:min-h-[460px]">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="max-h-[240px] md:max-h-[480px] w-auto object-contain rounded-2xl"
                  style={{ filter: "drop-shadow(0 24px 56px rgba(0,0,0,0.55))" }}
                />
              ) : (
                <div className="flex items-center justify-center text-white/15">
                  <Shirt className="w-28 h-28" />
                </div>
              )}
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-8 h-[3px] rounded-full bg-white/70" />
              <div className="w-2 h-[3px] rounded-full bg-white/25" />
              <div className="w-2 h-[3px] rounded-full bg-white/25" />
            </div>
          </div>

          {/* RIGHT — content panel */}
          <div className="flex flex-col p-5 md:p-7 gap-4 md:gap-5 bg-card relative">

            {/* Single close/back button — top right */}
            <Link
              href="/closet"
              className="absolute top-5 right-5 w-9 h-9 rounded-full
                         bg-foreground/8 border border-border
                         flex items-center justify-center
                         text-foreground/50 hover:text-foreground hover:bg-foreground/12
                         transition-all duration-200"
              aria-label="Back to closet"
            >
              <X className="w-4 h-4" />
            </Link>

            {/* Category label */}
            <div className="pr-10">
              <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-foreground/35 mb-2.5">
                THREADSHARE{(item as any).category_name ? ` · ${(item as any).category_name}` : ""}
              </p>
              {/* Name with gold accent on second word */}
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
                {firstWord}{" "}
                {accentWord && (
                  <span className="font-bold" style={{ color: "var(--gold)" }}>{accentWord}</span>
                )}
                {restWords && <> {restWords}</>}
              </h1>
              {item.brand && (
                <p className="text-sm text-foreground/45 mt-1.5 font-medium">{item.brand}</p>
              )}
            </div>

            {/* Price / CPW row */}
            {(item.purchase_price != null || cpw) && (
              <div className="flex items-start gap-6 py-4 border-y border-border/50">
                {item.purchase_price != null && (
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-foreground/35 mb-1">
                      PURCHASE PRICE
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{Number(item.purchase_price).toLocaleString()}
                    </p>
                  </div>
                )}
                {cpw && (
                  <>
                    <div className="w-px h-10 bg-border/60 self-center" />
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-foreground/35 mb-1">
                        COST / WEAR
                      </p>
                      <p className="text-2xl font-bold text-foreground">₹{cpw}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
              <DetailRow label="CONDITION" value={item.condition_grade} />
              <DetailRow label="STATUS"    value={item.status} />
              {item.color      && <DetailRow label="COLOR"      value={item.color} />}
              {item.wear_count > 0 && <DetailRow label="TIMES WORN" value={`${item.wear_count}×`} />}
            </div>

            {/* Size chip */}
            {item.size && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-foreground/35 mb-2">SIZE</p>
                <span className="inline-block px-4 py-1.5 rounded-lg bg-foreground text-background text-sm font-bold">
                  {item.size}
                </span>
              </div>
            )}

            {/* Log Wear — primary CTA */}
            <LogWearForm itemId={item.item_id} />

            {/* Edit — secondary */}
            <Link
              href={`/closet/${item.item_id}/edit`}
              className="flex items-center justify-center gap-2 h-11 rounded-2xl
                         bg-foreground/6 border border-border text-sm font-semibold text-foreground/70
                         hover:bg-foreground/10 hover:text-foreground transition-all duration-200"
            >
              <Pencil className="w-4 h-4" />
              Edit Item
            </Link>

            {/* Description / stylist note */}
            {item.description && (
              <div className="flex gap-3 p-4 rounded-2xl bg-foreground/4 border border-border/50">
                <div className="w-9 h-9 rounded-full bg-foreground/8 border border-border flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-foreground/35" />
                </div>
                <div>
                  <p className="text-sm text-foreground/60 leading-relaxed italic">
                    &ldquo;{item.description}&rdquo;
                  </p>
                  <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-foreground/30 mt-1.5">
                    — ITEM NOTES
                  </p>
                </div>
              </div>
            )}

            {/* Delete */}
            <form action={deleteAction} className="mt-auto">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full h-9 rounded-xl
                           text-xs font-semibold text-destructive/60 hover:text-destructive
                           hover:bg-destructive/8 transition-all duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Item
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Wear History */}
      <div className="space-y-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4 text-foreground/30" />
          <Link href="/closet" className="text-sm text-foreground/40 hover:text-foreground transition-colors">
            Back to Closet
          </Link>
          <span className="text-foreground/20 mx-1">·</span>
          <h2 className="text-sm font-semibold text-foreground/60">Wear History</h2>
        </div>

        {wearLog.length === 0 ? (
          <div className="glass rounded-2xl px-6 py-8 text-center text-foreground/35 text-sm">
            No wear entries yet. Log your first wear above.
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/35">Date</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/35">Occasion</th>
                </tr>
              </thead>
              <tbody>
                {wearLog.map((log, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-foreground/3 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground/80">
                      {new Date(log.worn_on).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-foreground/45">
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-foreground/35 mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground/85">{value}</p>
    </div>
  );
}
