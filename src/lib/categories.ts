export interface Category {
  name: string;
  description: string;
  commonItems: string[];
}

export const categories: Category[] = [
  {
    name: "Household Rubbish",
    description:
      "Non-putrescible general household waste from everyday domestic activities. Waste must be dry and securely contained; any household rubbish mixed with construction waste becomes construction waste",
    commonItems: [
      "Dirty or non-recyclable packaging",
      "Non-recyclable plastics",
      "Small broken household items",
    ],
  },
  {
    name: "Household Clutter",
    description: "Everyday non-recyclable household items. (No construction waste)",
    commonItems: ["Household rubbish", "Broken toys", "Old clothes"],
  },
  {
    name: "General Waste",
    description: "Household items, packaging, and non-recyclables. (No construction waste)",
    commonItems: ["Household rubbish", "Packaging", "Plastic bags"],
  },
  {
    name: "Construction Waste",
    description: "Timber, drywall, tiles, and bricks (MUST NOT CONTAINS ASBESTOS); any household clutter, litter & scrap or general waste or mixed with Construction waste becomes construction waste",
    commonItems: ["Timber", "Drywall", "Tiles"],
  },
  {
    name: "Green Waste (No Soil)",
    description:
      "Plant-based garden waste such as grass, leaves, and small branches. (No soil or dirt)",
    commonItems: ["Grass clippings", "Tree branches", "Leaves"],
  },
  {
    name: "Green Waste (With Soil)",
    description:
      "Plant-based garden waste such as grass, leaves, and small branches with soil",
    commonItems: ["Grass clippings", "Tree branches", "Leaves"],
  },
  {
    name: "Bricks & Concrete",
    description: "Concrete, masonry, and heavy materials",
    commonItems: ["Concrete", "Masonry", "Heavy materials"],
  },
  {
    name: "Steel",
    description: "Scrap and metal-based materials",
    commonItems: ["Steel pipes", "Metal sheets", "Scrap metal"],
  },
  {
    name: "Asbestos",
    description: "Bonded or friable asbestos-containing materials; anything mixed with asbestos should be considered as asbestos",
    commonItems: ["Asbestos sheeting", "Fibro panels", "Roofing sheets"],
  },
  {
    name: "Dirt & Soil",
    description:
      "Clean fill such as dirt, soil, and sand suitable for disposal or reuse",
    commonItems: ["Clean soil", "Dirt", "Sand"],
  },
  {
    name: "Copper Wire",
    description:
      "Copper wiring, pipes, fittings, and scrap materials suitable for recycling.",
    commonItems: ["Copper wire", "Copper pipes", "Copper fittings"],
  },
  {
    name: "Litter & Scrap",
    description:
      "Non-putrescible dry litter and discarded metal or material pieces suitable for collection or recycling. (No construction waste)",
    commonItems: [
      "Empty drink cans",
      "Plastic bottles (empty)",
      "Food wrappers (clean/dry)",
    ],
  },
];

export const categoryNames = categories.map((c) => c.name);
