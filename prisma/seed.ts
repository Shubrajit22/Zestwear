import { PrismaClient, ProductCategoryEnum } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: ProductCategoryEnum.BLAZERS,
      imageUrl: '/images/blazers.png', // replace with your image path
      description: 'Stylish blazers and coats for formal and semi-formal occasions.',
      order: 2, // optional (set order relative to your other categories)
    },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { name: cat.name },
      update: {
        imageUrl: cat.imageUrl,
        description: cat.description,
        order: cat.order,
      },
      create: cat,
    });
  }

  console.log('✅ Category seeded: BLAZERS');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
