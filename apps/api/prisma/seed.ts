import { PrismaClient, StaffRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";
const DEMO_USERS = [
  {
    email: "manager@demo.cafe",
    name: "Alex Manager",
    role: StaffRole.manager,
  },
  {
    email: "barista1@demo.cafe",
    name: "Sam Barista",
    role: StaffRole.barista,
  },
  {
    email: "barista2@demo.cafe",
    name: "Jordan Barista",
    role: StaffRole.barista,
  },
] as const;

const DEMO_TENANT_SLUG = "demo-cafe";
const DEMO_STORE_NAME = "Main Street Café";
const DEMO_TABLES = [
  { name: "Table 1", qrCode: "demo-table-1" },
  { name: "Table 2", qrCode: "demo-table-2" },
  { name: "Patio 1", qrCode: "demo-patio-1" },
] as const;

const DEMO_MODIFIER_GROUPS = [
  {
    name: "Milk",
    minSelect: 1,
    maxSelect: 1,
    sortOrder: 1,
    options: [
      { name: "Whole milk", priceModifier: 0, sortOrder: 1 },
      { name: "Oat milk", priceModifier: 60, sortOrder: 2 },
      { name: "Almond milk", priceModifier: 60, sortOrder: 3 },
    ],
  },
  {
    name: "Extra shot",
    minSelect: 0,
    maxSelect: 2,
    sortOrder: 2,
    options: [
      { name: "Single shot", priceModifier: 100, sortOrder: 1 },
      { name: "Double shot", priceModifier: 180, sortOrder: 2 },
    ],
  },
  {
    name: "Syrups",
    minSelect: 0,
    maxSelect: 3,
    sortOrder: 3,
    options: [
      { name: "Vanilla", priceModifier: 50, sortOrder: 1 },
      { name: "Caramel", priceModifier: 50, sortOrder: 2 },
      { name: "Hazelnut", priceModifier: 50, sortOrder: 3 },
    ],
  },
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
        modifierGroups: [] as string[],
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
        modifierGroups: ["Milk", "Extra shot", "Syrups"],
      },
      {
        name: "Cappuccino",
        description: "Equal parts espresso, steamed milk, and foam",
        price: 450,
        image:
          "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=450&fit=crop",
        variants: [],
        modifierGroups: ["Milk"],
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
        modifierGroups: [] as string[],
      },
      {
        name: "Blueberry Muffin",
        description: "Fresh baked daily",
        price: 300,
        image:
          "https://images.unsplash.com/photo-1607958996338-0102a517f79f?w=600&h=450&fit=crop",
        variants: [],
        modifierGroups: [] as string[],
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

  const modifierGroupIds = new Map<string, string>();

  for (const group of DEMO_MODIFIER_GROUPS) {
    let dbGroup = await prisma.modifierGroup.findFirst({
      where: { storeId: store.id, name: group.name },
    });

    if (!dbGroup) {
      dbGroup = await prisma.modifierGroup.create({
        data: {
          storeId: store.id,
          name: group.name,
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          sortOrder: group.sortOrder,
        },
      });
    } else {
      dbGroup = await prisma.modifierGroup.update({
        where: { id: dbGroup.id },
        data: {
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          sortOrder: group.sortOrder,
        },
      });
    }

    modifierGroupIds.set(group.name, dbGroup.id);

    for (const option of group.options) {
      const existingOption = await prisma.modifierOption.findFirst({
        where: { groupId: dbGroup.id, name: option.name },
      });

      if (existingOption) {
        await prisma.modifierOption.update({
          where: { id: existingOption.id },
          data: {
            priceModifier: option.priceModifier,
            sortOrder: option.sortOrder,
            available: true,
          },
        });
      } else {
        await prisma.modifierOption.create({
          data: {
            groupId: dbGroup.id,
            name: option.name,
            priceModifier: option.priceModifier,
            sortOrder: option.sortOrder,
            available: true,
          },
        });
      }
    }
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

      await prisma.productModifierGroup.deleteMany({
        where: { productId: dbProduct.id },
      });

      for (const [index, groupName] of product.modifierGroups.entries()) {
        const groupId = modifierGroupIds.get(groupName);
        if (!groupId) continue;

        await prisma.productModifierGroup.create({
          data: {
            productId: dbProduct.id,
            groupId,
            sortOrder: index,
          },
        });
      }
    }
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const demoUser of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: {
        tenantId_email: { tenantId: tenant.id, email: demoUser.email },
      },
      update: {
        name: demoUser.name,
        role: demoUser.role,
        active: true,
        passwordHash,
      },
      create: {
        tenantId: tenant.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        passwordHash,
        active: true,
      },
    });

    await prisma.userStore.upsert({
      where: {
        userId_storeId: { userId: user.id, storeId: store.id },
      },
      update: {},
      create: { userId: user.id, storeId: store.id },
    });
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
  console.log("");
  console.log("Demo staff (password for all: demo1234):");
  for (const demoUser of DEMO_USERS) {
    console.log(`  ${demoUser.role.padEnd(8)} ${demoUser.email} — ${demoUser.name}`);
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
