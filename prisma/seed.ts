import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ FATAL: DATABASE_URL is missing from .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const UNIQUE_ORGANIZERS_CATALOG = [
  { id: "KITCHEN", name: "Kitchen & Dining", subs: ["Small Appliances","Storage & Organizers","Cookware","Plates & Dining","Cutlery","Lighting","Barware","Tea & Coffee Gear"] },
  { id: "HOME_LIVING", name: "Home & Living", subs: ["Decor","Furniture","Rugs","Bedding","Cushions","Candles & Scents","Curtains","Wall Art","Mirrors"] },
  { id: "GIFTS", name: "Gifts & Occasions", subs: ["Corporate","Birthday","Wedding","Luxury Hampers","Anniversary","Baby Shower","Seasonal","Greeting Cards"] },
  { id: "ELECTRONICS", name: "Electronics", subs: ["Audio","Gadgets","Smart Home","Office Gear","Photography","Wearables","Gaming","Power & Cables"] },
  { id: "CLOTHING", name: "Clothing & Apparel", subs: ["Men","Women","Kids","Accessories","Footwear","Activewear","Sleepwear","Outerwear"] },
  { id: "BEAUTY", name: "Beauty & Personal Care", subs: ["Skincare","Makeup","Fragrance","Haircare","Men's Grooming","Beauty Tools","Bath & Body","Oral Care"] },
  { id: "GROCERY", name: "Grocery & Food", subs: ["Dry Goods","Beverages","Spices","Snacks","Coffee & Tea","Organic","Condiments","Baking Essentials"] },
  { id: "SPORTS", name: "Sports & Fitness", subs: ["Fitness","Camping","Cycling","Swimming","Team Sports","Active Gear","Yoga & Meditation"] },
  { id: "TOYS", name: "Toys & Baby", subs: ["Educational", "Plush", "Baby Gear", "Games", "Outdoor Play", "Building Sets", "Puzzles"] },
  { id: "OFFICE", name: "Office Supplies", subs: ["Stationery","Desk Organizers","Tech Accessories","Writing Tools","Paper Products","Filing & Storage"] },
  { id: "HEALTH", name: "Health & Wellness", subs: ["Supplements","Personal Care","Yoga & Meditation","Massagers","Aromatherapy","Fitness Trackers"] }
];

async function main() {
  console.log("🚀 Starting database seed...");

  try {
    console.log("🧹 Cleaning old data...");
    // @ts-ignore
    if (prisma.product) {
        // @ts-ignore
        await prisma.product.deleteMany();
        console.log("✅ Products cleared");
    }

    await prisma.category.deleteMany();
    console.log("✅ Categories cleared");

    for (const cat of UNIQUE_ORGANIZERS_CATALOG) {
      // Use upsert for parents
      const parent = await prisma.category.upsert({
        where: { id: cat.id },
        update: { name: cat.name },
        create: { id: cat.id, name: cat.name }
      });
      console.log(`✅ Processed Parent: ${parent.name}`);

      for (const subName of cat.subs) {
        const subId = subName.toUpperCase()
          .replace(/ & /g, '_')
          .replace(/ /g, '_')
          .replace(/'/g, '');

        // Use upsert for sub-categories to handle duplicates like YOGA_MEDITATION
        await prisma.category.upsert({
          where: { id: subId },
          update: { name: subName, parentId: parent.id },
          create: {
            id: subId,
            name: subName,
            parentId: parent.id
          }
        });
      }
    }
    console.log("🏁 Seeding complete! Go grab a coffee, you earned it.");
  } catch (e) {
    console.error("❌ Seed error:", e);
    process.exit(1);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); }) 
  .finally(async () => { await prisma.$disconnect(); });