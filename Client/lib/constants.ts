// Drag item types
export const ItemTypes = {
  FURNITURE: "furniture",
  WALL: "wall",
  WINDOW: "window",
  DOOR: "door",
}

// Room configuration
export const ROOM_CONFIG = {
  width: 20,
  depth: 20,
  height: 4,
  wallColor: "#f5f5f5",
  floorColor: "#f0f0f0",
  floorTextureScale: 4,
}
// Environment presets for 3D visualization
export const ENVIRONMENT_PRESETS = [
  { value: "dawn", label: "Dawn" },
  { value: "sunset", label: "Sunset" },
  { value: "night", label: "Night" },
  { value: "warehouse", label: "Warehouse" },
  { value: "forest", label: "Forest" },
  { value: "apartment", label: "Apartment" },
  { value: "studio", label: "Studio" },
  { value: "city", label: "City" },
];

// Furniture element types that can be matched
export const FURNITURE_ELEMENT_TYPES = [
  "shelf",
  "display",
  "table",
  "fridge",
  "planogram",
  "gondola",
  "counter",
  "cashier",
  "rack",
  "mannequin",
  "cube",
]
