import Link from "next/link";
import { createClient } from "../../lib/supabase-server";
import PropertyCard from "../../components/PropertyCard";
import SaveSearchButton from "../../components/SaveSearchButton";
import { T, REGIONS, CAT_LABEL } from "../../lib/constants";

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

  const buildHref = (overrides) => {
    const params = new URLSearchParams({
      type,
      region,
      category,
      beds,
      minPrice,
      maxPrice,
      furnished,
      q,
      sort,
      ...overrides,
    });
    // strip empty params for a clean URL
    [...params.keys()].forEach((k) => {
      if (!params.get(k)) params.delete(k);
    });
    return `/listings?${params.toString()}`;
  };

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
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px 24px",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 28,
        }}
      >
        {/* Filters sidebar */}
        <aside style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, height: "fit-content" }}>
          <form method="GET" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Type toggle */}
            <div>
              <FieldLabel>Type</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                <TypeLink href={buildHref({ type: "" })} active={!type}>
                  All
                </TypeLink>
                <TypeLink href={buildHref({ type: "sale" })} active={type === "sale"}>
                  For Sale
                </TypeLink>
                <TypeLink href={buildHref({ type: "rent" })} active={type === "rent"}>
                  To Let
                </TypeLink>
              </div>
            </div>

            <input type="hidden" name="type" value={type} />

            {/* Search text */}
            <div>
              <FieldLabel>Search</FieldLabel>
              <input
                name="q"
                defaultValue={q}
                placeholder="City, area, title..."
                style={inputStyle}
              />
            </div>

            {/* Region */}
            <div>
              <FieldLabel>Region</FieldLabel>
              <select name="region" defaultValue={region} style={inputStyle}>
                <option value="">All Regions</option>
                {(REGIONS || []).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <FieldLabel>Category</FieldLabel>
              <select name="category" defaultValue={category} style={inputStyle}>
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CAT_LABEL[c]}</option>
                ))}
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <FieldLabel>Min Bedrooms</FieldLabel>
              <select name="beds" defaultValue={beds} style={inputStyle}>
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}+</option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div>
              <FieldLabel>Price Range (GH₵)</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                <input name="minPrice" defaultValue={minPrice} placeholder="Min" type="number" style={inputStyle} />
                <input name="maxPrice" defaultValue={maxPrice} placeholder="Max" type="number" style={inputStyle} />
              </div>
            </div>

            {/* Furnished */}
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: T.gray1 }}>
              <input type="checkbox" name="furnished" value="yes" defaultChecked={furnished === "yes"} />
              Furnished only
            </label>

            {/* Sort */}
            <div>
              <FieldLabel>Sort By</FieldLabel>
              <select name="sort" defaultValue={sort} style={inputStyle}>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                background: T.gold,
                color: T.navyD,
                border: "none",
                borderRadius: 8,
                padding: "10px 0",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Apply Filters
            </button>

            <SaveSearchButton filters={{ type, region, category, beds, minPrice, maxPrice, furnished, q, sort }} />

            <Link
              href="/listings"
              style={{ textAlign: "center", fontSize: 13, color: T.gray2, textDecoration: "underline" }}
            >
              Clear all filters
            </Link>
          </form>
        </aside>

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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                gap: 20,
              }}
            >
              {listings.map((p) => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <p style={{ color: T.navy, fontWeight: 700, fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase", margin: "0 0 6px" }}>
      {children}
    </p>
  );
}

function TypeLink({ href, active, children }) {
  return (
    <Link
      href={href}
      style={{
        flex: 1,
        textAlign: "center",
        padding: "8px 0",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 700,
        textDecoration: "none",
        background: active ? T.navy : T.bg,
        color: active ? "#fff" : T.gray1,
        border: `1px solid ${active ? T.navy : T.border}`,
      }}
    >
      {children}
    </Link>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  fontSize: 14,
  color: T.gray1,
  boxSizing: "border-box",
};