import Link from "next/link";
import { createClient } from "../../lib/supabase-server";
import ListingsViewToggle from "../../components/ListingsViewToggle";
import ListingsFilterPanel from "../../components/ListingsFilterPanel";
import { T, REGIONS, CAT_LABEL } from "../../lib/constants";
import { fetchOwnerTypeMap, withOwnerTypes } from "../../lib/badge-queries";

export const revalidate = 30;

const CATEGORIES = Object.keys(CAT_LABEL || {});

export default async function ListingsPage({ searchParams }) {
  const supabase = createClient();

  const type = searchParams?.type || ""; // "sale" | "rent" | ""
  const region = searchParams?.region || "";
  const category = searchParams?.category || "";
  const beds = searchParams?.beds || "";
  const minPrice = searchParams?.minPrice || "";
  const maxPrice = searchParams?.maxPrice || "";
  const furnished = searchParams?.furnished || ""; // "yes" | ""
  const q = searchParams?.q || "";
  const sort = searchParams?.sort || "newest";

  let query = supabase
    .from("listings")
    .select("*, listing_images(url, sort_order)")
    .eq("status", "active");

  if (type) query = query.eq("listing_type", type);
  if (region) query = query.eq("region", region);
  if (category) query = query.eq("category", category);
  if (beds) query = query.gte("bedrooms", Number(beds));
  if (minPrice) query = query.gte("price", Number(minPrice));
  if (maxPrice) query = query.lte("price", Number(maxPrice));
  if (furnished === "yes") query = query.eq("furnished", true);
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,city.ilike.%${q}%,region.ilike.%${q}%,address.ilike.%${q}%`
    );
  }

  if (sort === "price_asc") query = query.order("price", { ascending: true });
  else if (sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: listings, error } = await query;
  const ownerTypeMap = await fetchOwnerTypeMap(supabase);
  const listingsWithBadges = withOwnerTypes(listings || [], ownerTypeMap);

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      {/* Header / title bar */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${T.border}`, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 26, margin: "0 0 4px" }}>
            {type === "sale" ? "Properties For Sale" : type === "rent" ? "Properties To Let" : "All Listings"}
          </h1>
          <p style={{ color: T.gray2, fontSize: 14, margin: 0 }}>
            {listings ? `${listings.length} result${listings.length === 1 ? "" : "s"} found` : ""}
          </p>
        </div>
      </div>

      <div
        className="homio-listings-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px 24px",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 28,
        }}
      >
        <ListingsFilterPanel
          type={type}
          region={region}
          category={category}
          beds={beds}
          minPrice={minPrice}
          maxPrice={maxPrice}
          furnished={furnished}
          q={q}
          sort={sort}
          regions={REGIONS}
          categories={CATEGORIES}
          catLabel={CAT_LABEL}
          resultCount={listings?.length}
        />

        {/* Results */}
        <div>
          {error && (
            <div style={{ background: T.redL, color: T.red, padding: 16, borderRadius: 8, marginBottom: 20 }}>
              Something went wrong loading listings. Please try again.
            </div>
          )}

          {!error && (!listings || listings.length === 0) && (
            <div
              style={{
                background: "#fff",
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "60px 24px",
                textAlign: "center",
              }}
            >
              <p style={{ color: T.navy, fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>
                No properties match your search
              </p>
              <p style={{ color: T.gray2, fontSize: 14, margin: "0 0 20px" }}>
                Try adjusting your filters or clearing them to see all listings.
              </p>
              <Link
                href="/listings"
                style={{ color: T.navy, fontWeight: 700, textDecoration: "underline" }}
              >
                Clear filters
              </Link>
            </div>
          )}

          {!error && listings && listings.length > 0 && (
            <ListingsViewToggle listings={listingsWithBadges} />
          )}
        </div>
      </div>
    </div>
  );
}