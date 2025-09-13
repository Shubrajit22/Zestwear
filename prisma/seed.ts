import { PrismaClient, ProductCategoryEnum } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: ProductCategoryEnum.FORMALS,
      imageUrl: '/images/formals.png', // replace with your image path
      description: 'Premium formal shirts and pants for office and special occasions.',
      order: 1, // optional
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

  console.log('✅ Category seeded: FORMALS');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
