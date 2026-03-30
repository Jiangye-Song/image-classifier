export interface ClassificationResult {
  category: string;
  confidence: number;
  reasoning: string;
  detectedItems: string[];
  asbestosLikelihood: number;
  isOverfilled: "Yes" | "No" | "Little" | "N/A";
}

export interface Model {
  id: string;
  name: string;
  description?: string;
}

export interface Category {
  name: string;
  description: string;
  commonItems: string[];
  cannotContain: string[];
}

export const categories: Category[] = [
  {
    name: "Household Rubbish",
    description:
      "Everyday non-recyclable domestic waste. Must be dry and non-putrescible. Any household rubbish mixed with construction waste becomes construction waste.",
    commonItems: [
      "General household rubbish",
      "Dirty or non-recyclable packaging",
      "Food wrappers (empty and dry), soft plastics, contaminated packaging",
      "Non-recyclable plastics, broken plastic containers",
      "Small broken household items, kitchenware, small décor items",
      "Old textiles, clothes, curtains, cushions, bedding",
      "Non-recyclable paper & cardboard, flattened boxes",
      "Small furniture pieces, chairs, small tables (conditions may apply)",
    ],
    cannotContain: [
      "Asbestos, fibro & fibro cement sheeting",
      "Hazardous, bio-hazardous or contaminated waste",
      "Chemicals, gas bottles, oils, fuels or solvents",
      "Medical or clinical waste",
      "Silica dust or regulated materials",
      "Food or liquid waste",
      "Wet concrete or slurry",
      "Hot ash",
      "Soil, dirt, bricks or concrete",
      "Steel or scrap metal (large quantities)",
      "Polystyrene, insulation or refrigeration panels",
    ],
  },
  {
    name: "Household Clutter",
    description:
      "Household clutter from decluttering, garage clean-outs, or seasonal clean-ups. Proper sorting ensures safe transport and compliant disposal. No construction waste.",
    commonItems: [
      "Household rubbish, everyday unwanted domestic items",
      "Broken toys (plastic and non-electronic)",
      "Old clothes, shoes, textiles",
      "Soft furnishings: cushions, curtains, bedding",
      "Small household items: kitchenware, décor, storage containers",
      "Light furniture: chairs, small tables (conditions may apply)",
    ],
    cannotContain: [
      "Asbestos or fibro materials",
      "Hazardous or contaminated waste",
      "Chemicals, oils, gas cylinders or fuels",
      "Medical or clinical waste",
      "Food or liquid waste",
      "Wet concrete or slurry",
      "Bricks, concrete, soil or heavy construction materials",
      "Large scrap metal loads",
      "Polystyrene, insulation or foam panels",
      "Hot ash or noxious weeds",
    ],
  },
  {
    name: "General Waste",
    description:
      "The most versatile skip bin option for household cleanouts, renovations, and decluttering. Accepts a wide range of non-hazardous materials. No heavy construction materials.",
    commonItems: [
      "Household rubbish, general household items and packaging",
      "Furniture: couches, chairs, tables, mattresses",
      "Clothing & textiles: old clothes, curtains, bedding",
      "Toys & plastics: broken toys, plastic items",
      "Cardboard & paper: boxes, newspapers, magazines",
      "Timber (untreated): unpainted, untreated wood",
      "Carpet & flooring: old carpet, underlay, vinyl flooring",
      "White goods: fridges, washing machines (conditions apply)",
    ],
    cannotContain: [
      "Asbestos or fibro cement materials",
      "Hazardous, bio-hazardous or contaminated waste",
      "Chemicals, gas, oils or radioactive substances",
      "Medical waste",
      "Food or liquid waste",
      "Wet concrete or slurry",
      "Heavy construction materials (bricks, concrete, masonry)",
      "Soil or clean fill",
      "Steel, copper or dedicated scrap metal loads",
      "Polystyrene, insulation or foam panels",
      "Hot ash",
    ],
  },
  {
    name: "Construction Waste",
    description:
      "Construction and demolition waste. Properly sorting helps reduce landfill and promotes recycling. MUST NOT contain asbestos. Any household clutter, litter & scrap or general waste mixed with construction waste becomes construction waste.",
    commonItems: [
      "Bricks: extruded and pressed bricks",
      "Concrete (dry): solid concrete pieces and blocks",
      "Roof tiles: travertine, ceramic, marble, slate, faux wood, granite, onyx, quartzite",
      "Flooring tiles: travertine, slate, limestone, granite, marble, concrete, ceramic",
      "Ceramics: mortar, shingles and pipes",
    ],
    cannotContain: [
      "Asbestos materials",
      "Hazardous or contaminated waste",
      "Chemicals, fuels, gas bottles or oils",
      "Medical waste",
      "Food or liquid waste",
      "Wet concrete or slurry",
      "Silica dust",
      "Polystyrene, insulation or refrigeration panels",
      "Hot ash or noxious weeds",
      "Soil or clean fill (unless pre-approved)",
    ],
  },
  {
    name: "Green Waste (No Soil)",
    description:
      "Plant-based garden waste. Properly disposing of green waste helps reduce landfill and allows organic materials to be composted and recycled. No soil or dirt.",
    commonItems: [
      "Grass clippings, lawn trimmings",
      "Tree branches and twigs (under 150mm diameter)",
      "Leaves, all types of fallen leaves and leaf litter",
      "Shrub prunings, hedge trimmings",
      "Weeds (without soil attached)",
      "Bark & mulch",
      "Small dead plants and flowers",
      "Palm fronds",
    ],
    cannotContain: [
      "Asbestos or fibro materials",
      "Hazardous or contaminated waste",
      "Chemicals, fuels or oils",
      "Medical waste",
      "Food or liquid waste",
      "Soil or dirt",
      "Rocks, bricks or concrete",
      "Treated timber (chemically treated wood)",
      "Wet concrete or slurry",
      "Hot ash",
      "Polystyrene or packaging materials",
    ],
  },
  {
    name: "Green Waste (With Soil)",
    description:
      "Plant-based garden waste such as grass, leaves, and small branches with soil attached. For garden waste where soil separation is not practical.",
    commonItems: [
      "Grass clippings with soil",
      "Tree branches and twigs with soil",
      "Leaves with soil",
      "Shrub prunings with soil/roots",
      "Weeds with soil attached",
      "Small plants with root balls",
    ],
    cannotContain: [
      "Asbestos or fibro materials",
      "Hazardous or contaminated waste",
      "Chemicals, fuels or oils",
      "Medical waste",
      "Food or liquid waste",
      "Rocks, bricks or concrete",
      "Treated timber",
      "Wet concrete or slurry",
      "Hot ash",
      "Polystyrene or packaging materials",
    ],
  },
  {
    name: "Mix of Bricks & Concrete",
    description:
      "Heavy masonry materials from demolition and construction projects. Weight restrictions apply due to dense materials. Keeping heavy waste separate helps ensure proper recycling and reduces disposal costs.",
    commonItems: [
      "Concrete: solid pieces, slabs, and blocks",
      "Bricks: clay bricks, extruded and pressed bricks",
      "Pavers: concrete and clay pavers",
      "Roof tiles: concrete and terracotta roof tiles",
      "Masonry blocks: besser blocks, cinder blocks, concrete blocks",
      "Stone & rock: natural stone, sandstone, granite pieces",
      "Ceramic tiles: floor and wall tiles, porcelain tiles",
      "Mortar & render: dried mortar, cement render, grout",
    ],
    cannotContain: [
      "Asbestos materials",
      "Contaminated concrete",
      "Reinforced concrete (unless pre-approved)",
      "Wet concrete or slurry",
      "Plasterboard or gyprock",
      "Timber or wood",
      "General rubbish or mixed waste",
      "Soil or dirt",
      "Hazardous or contaminated waste",
      "Chemicals, fuels, gas or oils",
      "Medical waste",
      "Polystyrene, insulation or foam panels",
      "Hot ash",
      "Silica dust",
    ],
  },
  {
    name: "Steel & Scrap Metal",
    description:
      "Steel is one of the most recyclable materials. Proper separation supports sustainable recycling. Ideal for construction sites, demolition projects, workshops, and scrap clean-ups. Must contain predominantly steel or metal.",
    commonItems: [
      "Steel pipes: structural or plumbing steel",
      "Metal sheets: roofing or construction sheets",
      "Scrap metal: offcuts and leftover metal pieces",
      "Steel framing: construction framework",
      "Metal bars & rods: reinforcement materials",
    ],
    cannotContain: [
      "Asbestos materials",
      "Hazardous or contaminated waste",
      "Chemicals, gas cylinders or oils",
      "Medical waste",
      "Food or liquid waste",
      "Concrete, bricks or masonry",
      "Soil or dirt",
      "Timber, plastics or general household waste",
      "Polystyrene or insulation panels",
      "Wet concrete or slurry",
      "Hot ash",
    ],
  },
  {
    name: "Asbestos",
    description:
      "Regulated hazardous material requiring strict handling and disposal. All asbestos must be double-wrapped in 200-micron plastic and clearly labelled per EPA regulations. Anything mixed with asbestos should be considered as asbestos.",
    commonItems: [
      "Bonded asbestos sheeting (non-friable)",
      "Fibro panels, asbestos-containing boards",
      "Roofing sheets, asbestos cement roofing",
    ],
    cannotContain: [
      "General household waste",
      "Construction waste (bricks, concrete, timber)",
      "Steel or scrap metal",
      "Soil or dirt",
      "Food or liquid waste",
      "Hazardous chemicals (other than approved asbestos)",
      "Medical waste",
      "Wet concrete or slurry",
      "Polystyrene or insulation panels",
      "Hot ash",
    ],
  },
  {
    name: "Dirt & Soil",
    description:
      "Clean fill from landscaping, excavation, and construction projects. Only clean, uncontaminated soil is permitted. Mixed loads may be rejected or reclassified at additional cost.",
    commonItems: [
      "Clean soil: uncontaminated excavation soil",
      "Dirt: natural earth materials",
      "Sand: clean sand",
      "Clay (small amounts): natural clay soil",
      "Garden fill: clean landscaping fill",
    ],
    cannotContain: [
      "Asbestos materials",
      "Hazardous or contaminated waste",
      "Chemicals, oils or fuels",
      "Medical waste",
      "General household rubbish",
      "Bricks, concrete or masonry",
      "Green waste",
      "Timber or scrap metal",
      "Polystyrene or insulation",
      "Wet concrete or slurry",
      "Hot ash",
      "Silica dust",
    ],
  },
  {
    name: "Copper Wire",
    description:
      "Highly valuable and recyclable copper materials. Proper separation ensures maximum recycling recovery. Ideal for electricians, construction sites, and scrap clean-ups. Bins must predominantly contain copper.",
    commonItems: [
      "Copper wire: insulated or stripped",
      "Copper pipes: plumbing copper",
      "Copper fittings: connectors and joints",
      "Scrap copper: offcuts and leftover materials",
      "Copper bars: solid copper pieces",
    ],
    cannotContain: [
      "Asbestos materials",
      "Hazardous or contaminated waste",
      "Chemicals, gas or oils",
      "Medical waste",
      "Food or liquid waste",
      "Concrete, bricks or soil",
      "General household waste",
      "Mixed metals (unless approved)",
      "Polystyrene or insulation panels",
      "Wet concrete or slurry",
      "Hot ash",
    ],
  },
  {
    name: "Litter & Scrap",
    description:
      "Dry, non-putrescible litter and lightweight scrap from public clean-ups, light commercial sites, and small projects. All materials must be dry. No construction waste.",
    commonItems: [
      "Empty drink cans: aluminium cans",
      "Plastic bottles (empty and dry)",
      "Food wrappers (clean/dry, non-organic packaging)",
      "Metal offcuts: small scrap pieces",
      "Scrap metal pieces: lightweight metal materials",
    ],
    cannotContain: [
      "Asbestos materials",
      "Hazardous or contaminated waste",
      "Chemicals, gas cylinders or oils",
      "Medical waste",
      "Food or liquid waste",
      "Bricks, concrete or masonry",
      "Soil or dirt",
      "Large scrap metal loads (use steel bin)",
      "Polystyrene or insulation panels",
      "Wet concrete or slurry",
      "Hot ash",
      "Silica dust",
    ],
  },
  {
    name: "Bricks",
    description:
      "Brick-based construction materials from demolition and building projects. Keeping brick waste separate ensures proper recycling and reduces disposal costs. Brick bins are for bricks only.",
    commonItems: [
      "Whole bricks: clay, pressed, or extruded bricks",
      "Broken bricks: chipped, cracked, or halved bricks",
      "Brick rubble: crushed brick debris from demolition",
      "Clay bricks: standard fired clay bricks of all sizes",
      "Face bricks: decorative or exposed bricks",
      "Engineering bricks: high-strength bricks used in structural work",
    ],
    cannotContain: [
      "Concrete or pavers (use a Bricks & Concrete bin)",
      "Asbestos materials",
      "Timber or wood",
      "General rubbish or mixed waste",
      "Soil or dirt (unless pre-approved)",
      "Hazardous or contaminated waste",
      "Chemicals, fuels, gas or oils",
      "Plasterboard or gyprock",
      "Hot ash",
    ],
  },
  {
    name: "Concrete",
    description:
      "Concrete materials from demolition and construction projects, including reinforced and non-reinforced concrete. Weight restrictions apply due to the dense nature of concrete. Keeping concrete waste separate ensures proper recycling and reduces disposal costs.",
    commonItems: [
      "Concrete: solid concrete pieces and blocks",
      "Concrete slabs: whole or broken concrete slabs",
      "Concrete rubble: crushed concrete debris from demolition",
      "Concrete blocks: standard and lightweight concrete blocks",
      "Concrete pavers: concrete paving stones and tiles",
      "Concrete footings: foundation concrete from excavation",
    ],
    cannotContain: [
      "Reinforced concrete (unless pre-approved)",
      "Wet concrete or slurry",
      "Asbestos materials",
      "Timber or wood",
      "General rubbish or mixed waste",
      "Soil or dirt (unless pre-approved)",
      "Hazardous or contaminated waste",
      "Chemicals, fuels, gas or oils",
      "Plasterboard or gyprock",
      "Hot ash",
    ],
  },
  {
    name: "Construction Waste with Soil (Mixed Heavy)",
    description:
      "Mixed heavy construction waste combined with soil from excavation, demolition, or site cleanup projects. Due to the heavy nature of these materials, weight limits apply.",
    commonItems: [
      "Bricks & concrete with soil: mixed masonry materials combined with dirt or soil",
      "Dirt mixed with rubble: soil containing small pieces of construction debris",
      "Excavation waste: materials removed during site excavation",
      "Mixed fill: soil combined with construction debris (bricks, concrete, rubble)",
      "Clay with construction debris: clay mixed with inert building materials",
      "Sand with rubble: sand containing small amounts of masonry or concrete",
    ],
    cannotContain: [
      "Asbestos materials",
      "Timber or wood",
      "General rubbish or household waste",
      "Green waste or organic matter",
      "Hazardous or contaminated soil",
      "Chemicals, fuels, gas or oils",
      "Plasterboard or gyprock",
      "Plastic, glass or metal",
      "Hot ash",
      "Wet concrete or slurry",
    ],
  },
];

export const categoryNames = categories.map((c) => c.name);
