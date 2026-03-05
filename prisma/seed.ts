const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WORLD_CATEGORIES = [
  {
    name: "Electronics",
    subs: ["Smartphones", "Laptops", "Audio & Headphones", "Cameras", "Smart Home", "Gaming Consoles", "Wearables", "Components"]
  },
  {
    name: "Kitchen & Dining",
    subs: ["Small Appliances", "Cookware", "Bakeware", "Dining & Entertaining", "Kitchen Storage", "Cutlery"]
  },
  {
    name: "Home Decor",
    subs: ["Lighting", "Wall Art", "Cushions & Throws", "Rugs", "Furniture", "Bed & Bath", "Garden"]
  },
  {
    name: "Beauty & Personal Care",
    subs: ["Skincare", "Makeup", "Hair Care", "Fragrance", "Oral Care", "Tools & Accessories", "Men's Grooming"]
  },
  {
    name: "Fashion & Apparel",
    subs: ["Men's Fashion", "Women's Fashion", "Kids & Baby", "Shoes", "Jewelry", "Watches", "Activewear"]
  },
  {
    name: "Health & Wellness",
    subs: ["Supplements", "Fitness Equipment", "Yoga & Meditation", "Personal Care", "Massage Tools"]
  },
  {
    name: "Sports & Outdoors",
    subs: ["Camping & Hiking", "Cycling", "Exercise & Fitness", "Water Sports", "Team Sports", "Outdoor Clothing"]
  },
  {
    name: "Industrial & Tools",
    subs: ["Power Tools", "Hand Tools", "Safety Gear", "Gardening", "Hardware", "Measurement Tools"]
  },
  {
    name: "Grocery & Gourmet",
    subs: ["Beverages", "Snacks", "Pantry Staples", "Baking", "Organic & Health", "Tea & Coffee"]
  }
];

async function main() {
  console.log("Cleaning Database...");
  await prisma.category.deleteMany();

  console.log("Seeding All Global Categories...");

  for (const cat of WORLD_CATEGORIES) {
    const parent = await prisma.category.create({
      data: { name: cat.name }
    });

    for (const subName of cat.subs) {
      await prisma.category.create({
        data: {
          name: subName,
          parentId: parent.id
        }
      });
    }
  }

  console.log("Seeding Successful.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });