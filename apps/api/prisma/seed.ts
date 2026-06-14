import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_TENANT_SLUG = "demo-cafe";
const DEMO_STORE_NAME = "Main Street Café";
const DEMO_TABLES = [
  { name: "Table 1", qrCode: "demo-table-1" },
  { name: "Table 2", qrCode: "demo-table-2" },
  { name: "Patio 1", qrCode: "demo-patio-1" },
] as const;

const DEMO_CATEGORIES = [
  {
    name: "Coffee",
    sortOrder: 1,
    products: [
      {
        name: "Espresso",
        description: "Single shot of espresso",
        price: 250,
        image:
          "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ffe7?w=600&h=450&fit=crop",
        variants: [
          { name: "Single", priceModifier: 0 },
          { name: "Double", priceModifier: 100 },
        ],
      },
      {
        name: "Latte",
        description: "Espresso with steamed milk",
        price: 450,
        image:
          "https://images.unsplash.com/photo-1561882468-e40229189598?w=600&h=450&fit=crop",
        variants: [
          { name: "Small", priceModifier: 0 },
          { name: "Large", priceModifier: 100 },
        ],
      },
      {
        name: "Cappuccino",
        description: "Equal parts espresso, steamed milk, and foam",
        price: 450,
        image:
          "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=450&fit=crop",
        variants: [],
      },
    ],
  },
  {
    name: "Pastries",
    sortOrder: 2,
    products: [
      {
        name: "Croissant",
        description: "Buttery, flaky classic",
        price: 350,
        image:
          "https://images.unsplash.com/photo-1555507036-abbf6ddb9334?w=600&h=450&fit=crop",
        variants: [],
      },
      {
        name: "Blueberry Muffin",
        description: "Fresh baked daily",
        price: 300,
        image:
          "https://images.unsplash.com/photo-1607958996338-0102a517f79f?w=600&h=450&fit=crop",
        variants: [],
      },
    ],
  },
] as const;

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: DEMO_TENANT_SLUG },
    update: { name: "Demo Café Co." },
    create: {
      name: "Demo Café Co.",
      slug: DEMO_TENANT_SLUG,
    },
  });

  let store = await prisma.store.findFirst({
    where: { tenantId: tenant.id, name: DEMO_STORE_NAME },
  });

  if (!store) {
    store = await prisma.store.create({
      data: {
        tenantId: tenant.id,
        name: DEMO_STORE_NAME,
        address: "123 Main Street",
        timezone: "America/New_York",
      },
    });
  } else {
    store = await prisma.store.update({
      where: { id: store.id },
      data: {
        address: "123 Main Street",
        timezone: "America/New_York",
      },
    });
  }

  for (const table of DEMO_TABLES) {
    await prisma.table.upsert({
      where: { qrCode: table.qrCode },
      update: { name: table.name, active: true, storeId: store.id },
      create: {
        storeId: store.id,
        name: table.name,
        qrCode: table.qrCode,
        active: true,
      },
    });
  }

  for (const category of DEMO_CATEGORIES) {
    let dbCategory = await prisma.category.findFirst({
      where: { storeId: store.id, name: category.name },
    });

    if (!dbCategory) {
      dbCategory = await prisma.category.create({
        data: {
          storeId: store.id,
          name: category.name,
          sortOrder: category.sortOrder,
        },
      });
    } else {
      dbCategory = await prisma.category.update({
        where: { id: dbCategory.id },
        data: { sortOrder: category.sortOrder },
      });
    }

    for (const product of category.products) {
      let dbProduct = await prisma.product.findFirst({
        where: { categoryId: dbCategory.id, name: product.name },
      });

      if (!dbProduct) {
        dbProduct = await prisma.product.create({
          data: {
            categoryId: dbCategory.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            available: true,
          },
        });
      } else {
        dbProduct = await prisma.product.update({
          where: { id: dbProduct.id },
          data: {
            description: product.description,
            price: product.price,
            image: product.image,
            available: true,
          },
        });
      }

      for (const variant of product.variants) {
        const existingVariant = await prisma.productVariant.findFirst({
          where: { productId: dbProduct.id, name: variant.name },
        });

        if (existingVariant) {
          await prisma.productVariant.update({
            where: { id: existingVariant.id },
            data: { priceModifier: variant.priceModifier },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: dbProduct.id,
              name: variant.name,
              priceModifier: variant.priceModifier,
            },
          });
        }
      }
    }
  }

  const tables = await prisma.table.findMany({
    where: { storeId: store.id },
    orderBy: { name: "asc" },
  });

  console.log("Seed complete");
  console.log(`Tenant: ${tenant.id} (${tenant.slug})`);
  console.log(`Store:  ${store.id}`);
  for (const table of tables) {
    console.log(`Table:  ${table.id} — ${table.name} (${table.qrCode})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
