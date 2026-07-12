import { createClient } from "../lib/supabase-server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const supabase = createClient();

  const staticPages = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/listings`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/for-contributors`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/team`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.5 },
  ];

  const { data: listings } = await supabase
    .from("listings")
    .select("id, updated_at")
    .eq("status", "active");

  const listingPages = (listings || []).map((l) => ({
    url: `${siteUrl}/property/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...listingPages];
}