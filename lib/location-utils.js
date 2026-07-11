// Nudges a coordinate by 100–300m in a deterministic direction (based on
// the listing's own id), so the same listing always shows at the same
// "approximate" spot rather than jumping around on every page load.
export function applyPrivacyOffset(lat, lng, seedStr) {
  const seed = seedStr
    ? seedStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    : Math.round((lat + lng) * 1000);
  const angle = (seed % 360) * (Math.PI / 180);
  const distanceMeters = 150 + (seed % 150); // 150–300m
  const dLat = (distanceMeters * Math.cos(angle)) / 111320;
  const dLng = (distanceMeters * Math.sin(angle)) / (111320 * Math.cos((lat * Math.PI) / 180));
  return [lat + dLat, lng + dLng];
}

// Decides what coordinates (if any) a given viewer should see for a listing,
// based on its location_visibility setting.
// hasConfirmedViewing: whether the current viewer has a CONFIRMED appointment
// for this specific listing (only matters for "hidden_until_viewing").
// bypassPrivacy: true for the listing's own agent, or a platform admin
// reviewing it — they should always see the exact pin regardless of the
// public-facing privacy setting.
export function getDisplayCoords(listing, hasConfirmedViewing, bypassPrivacy = false) {
  const lat = listing.latitude;
  const lng = listing.longitude;
  if (lat == null || lng == null) return null;

  if (bypassPrivacy) {
    return { lat, lng, exact: true };
  }

  const visibility = listing.location_visibility || "approximate";

  if (visibility === "exact") {
    return { lat, lng, exact: true };
  }

  if (visibility === "hidden_until_viewing") {
    if (hasConfirmedViewing) return { lat, lng, exact: true };
    return null; // caller should hide the map entirely
  }

  // "approximate" — always offset, never expose the real pin publicly
  const [oLat, oLng] = applyPrivacyOffset(lat, lng, listing.id);
  return { lat: oLat, lng: oLng, exact: false };
}