import { PrismaClient, ProductCategoryEnum } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: ProductCategoryEnum.PRAKRITI,
      imageUrl: '/images/pakriti.png',
      description: '100% made from bamboo T-shirts for sustainable fashion.',
      order: 1, // optional if using order field
    },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { name: cat.name },
      update: {
        imageUrl: cat.imageUrl,
        description: cat.description,
        order: cat.order, // include only if your schema has `order`
      },
      create: cat,
    });
  }

  console.log('✅ Category seeded: PRAKRITI');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
