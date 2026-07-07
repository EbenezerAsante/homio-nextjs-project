export const T = {
  navy: "#1B3A6B",
 navyD: "#0F2347", 
  gold: "#C8961E",
  bg: "#F5F6F8",
  border: "#E2E5EA",
  shadow: "0 4px 20px rgba(0,0,0,0.06)",
  shadowHover: "0 8px 28px rgba(0,0,0,0.10)",
  text: "#1F2937",
  gray1: "#374151",
  gray2: "#6B7280",
  gray3: "#9CA3AF",
  gray4: "#D1D5DB",
  red: "#DC2626",
  redL: "#FEE2E2",
  green: "#16A34A",
  greenL: "#DCFCE7",
  white: "#FFFFFF",
};

export const REGIONS = ["Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Volta", "Northern", "Upper East", "Upper West", "Bono"];

export function fmt(price, listingType) {
  if (price === null || price === undefined || price === "") return "Price on request";
  const formatted = "GH₵ " + Number(price).toLocaleString();
  return listingType === "rent" ? formatted + " / month" : formatted;
}


export const CAT_LABEL = {
  house: "House",
  apartment: "Apartment",
  land: "Land",
  commercial: "Commercial",
  shortlet: "Shortlet",
  office: "Office Space",
};

export function getCoords(city, region) {
  const COORDS = {
    "Greater Accra": [5.6037, -0.1870],
    "Ashanti": [6.6885, -1.6244],
    "Central": [5.1053, -1.2466],
    "Eastern": [6.0940, -0.2591],
    "Western": [4.9016, -1.7831],
    "Volta": [6.6018, 0.4713],
    "Northern": [9.5439, -0.9057],
    "Upper East": [10.7082, -0.9821],
    "Upper West": [10.0601, -2.5099],
    "Bono": [7.3349, -2.3123],
  };
  return COORDS[region] || [7.9465, -1.0232];
}

