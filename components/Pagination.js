import Link from "next/link";
import { T } from "../lib/constants";

// Builds a /listings URL that preserves all current filters/search params
// but swaps in a new page number.
function pageHref(searchParams, page) {
  const params = new URLSearchParams();
  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (key === "page") return; // we set this ourselves below
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/listings?${qs}` : "/listings";
}

// Compact page-number list: always show first, last, current, and one
// neighbour on each side; collapse the rest into "…".
function buildPageList(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1]);
  return [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export default function Pagination({ currentPage, totalPages, searchParams }) {
  if (totalPages <= 1) return null;

  const pageList = buildPageList(currentPage, totalPages);

  const linkStyle = (active) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 36,
    height: 36,
    padding: "0 10px",
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 700,
    textDecoration: "none",
    border: `1.5px solid ${active ? T.navy : T.border}`,
    background: active ? T.navy : "#fff",
    color: active ? "#fff" : T.gray1,
  });

  return (
    <nav
      aria-label="Listings pagination"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 32,
      }}
    >
      <Link
        href={pageHref(searchParams, Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        style={{
          ...linkStyle(false),
          pointerEvents: currentPage === 1 ? "none" : "auto",
          opacity: currentPage === 1 ? 0.4 : 1,
        }}
      >
        Prev
      </Link>

      {pageList.map((p, i) => {
        const prev = pageList[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {showEllipsis && <span style={{ color: T.gray3, fontSize: 13 }}>…</span>}
            <Link href={pageHref(searchParams, p)} style={linkStyle(p === currentPage)}>
              {p}
            </Link>
          </span>
        );
      })}

      <Link
        href={pageHref(searchParams, Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        style={{
          ...linkStyle(false),
          pointerEvents: currentPage === totalPages ? "none" : "auto",
          opacity: currentPage === totalPages ? 0.4 : 1,
        }}
      >
        Next
      </Link>
    </nav>
  );
}