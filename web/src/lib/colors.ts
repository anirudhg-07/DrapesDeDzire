export interface ColorOption {
  name: string;
  hex: string;
}

export const PREDEFINED_COLORS: ColorOption[] = [
  { name: "Deep Crimson", hex: "#DC143C" },
  { name: "Royal Blue", hex: "#4169E1" },
  { name: "Forest Green", hex: "#228B22" },
  { name: "Mustard Gold", hex: "#FFDB58" },
  { name: "Peach Pink", hex: "#FFCBA4" },
  { name: "Ivory White", hex: "#FFFFF0" },
  { name: "Midnight Black", hex: "#191970" },
  { name: "Emerald Teal", hex: "#008080" },
  { name: "Coral Orange", hex: "#FF7F50" },
  { name: "Lavender Purple", hex: "#E6E6FA" },
  // Adding common Kurta & Jewellery colors
  { name: "Ruby Red", hex: "#9B111E" },
  { name: "Sapphire Blue", hex: "#0F52BA" },
  { name: "Emerald", hex: "#50C878" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Rose Gold", hex: "#B76E79" },
  { name: "Mint Green", hex: "#98FF98" },
  { name: "Magenta", hex: "#FF00FF" },
  { name: "Turquoise", hex: "#40E0D0" },
  { name: "Navy Blue", hex: "#000080" },
  { name: "Maroon", hex: "#800000" },
  { name: "Pastel Pink", hex: "#FFD1DC" },
];

/**
 * Extracts the hex code from the stored color format (e.g., "#DC143C:Deep Crimson").
 * If it's a legacy simple string, it tries to match it to a predefined color or returns a default.
 */
export function getColorHex(storedColor: string): string {
  if (!storedColor) return "#cccccc"; // Fallback grey

  // New format: "#HEX:Name"
  if (storedColor.includes(":")) {
    return storedColor.split(":")[0];
  }

  // Legacy format: "Deep Crimson"
  const predefined = PREDEFINED_COLORS.find(
    (c) => c.name.toLowerCase() === storedColor.toLowerCase()
  );
  if (predefined) {
    return predefined.hex;
  }

  // If it's a raw hex code directly
  if (storedColor.startsWith("#")) {
    return storedColor;
  }

  return "#cccccc"; // Default fallback
}

/**
 * Extracts the display name from the stored color format.
 */
export function getColorName(storedColor: string): string {
  if (!storedColor) return "Unknown Color";

  // New format: "#HEX:Name"
  if (storedColor.includes(":")) {
    return storedColor.split(":")[1] || storedColor.split(":")[0];
  }

  // Legacy format: "Deep Crimson"
  return storedColor;
}
