export const CATEGORY_STRUCTURE = {
  "OFFICE_SUPPLIES": {
    name: "Office Supplies",
    subCategories: ["Stationary", "Desk", "Tech", "Writing Tools", "Papers", "Planners", "Desk Decor"]
  },
  "ELECTRONICS": {
    name: "Electronics",
    subCategories: ["Gadgets", "Audio", "Smart Home", "Computing"]
  },
  "HOME_LIVING": {
    name: "Home & Living",
    subCategories: ["Furniture", "Decor", "Kitchen", "Storage"]
  }
};

export type CategoryKey = keyof typeof CATEGORY_STRUCTURE;