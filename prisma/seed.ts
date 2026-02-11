// 1. This line makes the file a "module" so it doesn't conflict globally
export {}; 

const { PrismaClient } = require('@prisma/client');

// 2. We use 'seedPrisma' instead of 'prisma' to avoid redeclaration errors
const seedPrisma = new PrismaClient();

async function main() {
  console.log("Starting seed process...");
  
  // Clear existing data
  await seedPrisma.orderItem.deleteMany({});
  await seedPrisma.product.deleteMany({});

  const products = [
    {
      name: "Acrylic Tech Organizer",
      description: "Premium crystal-clear workspace management system with modular compartments.",
      images: ["https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800"],
      category: "Workstation",
      retailPrice: 4500,
      wholesalePrice: 2250,
      colors: ["Clear Crystal", "Smoked Grey"],
    },
    {
      name: "Minimalist Watch Vault",
      description: "Leather-lined interior with a carbon fiber exterior for luxury timepiece protection.",
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800"],
      category: "Archive",
      retailPrice: 8200,
      wholesalePrice: 4100,
      colors: ["Midnight Black", "Cognac"],
    },
    {
      name: "Modular EDC Tray",
      description: "Everyday carry station featuring wireless charging integration.",
      images: ["https://images.unsplash.com/photo-1585333127302-c2c98189b7ec?q=80&w=800"],
      category: "Essentials",
      retailPrice: 3800,
      wholesalePrice: 1900,
      colors: ["Slate", "Matte Black"],
    },
    {
      name: "Vertical Laptop Dock",
      description: "Space-saving aluminum alloy dock with adjustable width for all MacBook models.",
      images: ["https://images.unsplash.com/photo-1611186871348-b1ec696e523b?q=80&w=800"],
      category: "Workstation",
      retailPrice: 5500,
      wholesalePrice: 2750,
      colors: ["Space Grey", "Silver"],
    },
    {
      name: "Desktop Cable Management",
      description: "Magnetic weighted base to keep your charging cables organized and accessible.",
      images: ["https://images.unsplash.com/photo-1603113024148-2eb295779061?q=80&w=800"],
      category: "Essentials",
      retailPrice: 1500,
      wholesalePrice: 750,
      colors: ["Standard"],
    }
  ];

  for (const product of products) {
    // 3. Make sure to use 'seedPrisma' here too
    await seedPrisma.product.create({ data: product });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // 4. And here
    await seedPrisma.$disconnect();
  });